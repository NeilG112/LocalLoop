// Firestore Hooks for data operations

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    doc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Swipe, Match, Message, SwipeType, FeedFilters } from '../types';
import { calculateDistance } from '../utils/distance';

// Hook to fetch users for swiping
export function useSwipeablUsers(
    currentUser: User | null,
    filters?: FeedFilters
) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchUsers = useCallback(async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Get the opposite role
            const targetRole = currentUser.role === 'host' ? 'visitor' : 'host';

            // Base query - get users with opposite role
            // Note: We're fetching more users initially to allow for client-side filtering
            const constraints: QueryConstraint[] = [
                where('role', '==', targetRole),
                limit(50), // Increased limit for better filtering spread
            ];

            const q = query(collection(db, 'users'), ...constraints);
            const snapshot = await getDocs(q);

            // Get already swiped users to exclude
            const swipesQuery = query(
                collection(db, 'swipes'),
                where('from', '==', currentUser.id)
            );
            const swipesSnapshot = await getDocs(swipesQuery);
            const swipedUserIds = new Set(swipesSnapshot.docs.map(d => d.data().to));

            // Get matched users to exclude
            const matchesQuery = query(
                collection(db, 'matches'),
                where('users', 'array-contains', currentUser.id)
            );
            const matchesSnapshot = await getDocs(matchesQuery);
            const matchedUserIds = new Set<string>();
            matchesSnapshot.docs.forEach(d => {
                const users = d.data().users as string[];
                users.forEach(uid => {
                    if (uid !== currentUser.id) matchedUserIds.add(uid);
                });
            });

            // Filter and transform users
            const fetchedUsers: User[] = [];

            // Use provided filters or fallback to user preferences
            const activeAgeRange = filters?.ageRange || currentUser.preferences.agePreference;
            const activeGenderPref = filters?.gender || currentUser.preferences.genderPreference;
            const activeMaxDistance = filters?.maxDistance || currentUser.preferences.radiusPreference;
            const activeLanguages = filters?.languages || [];

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const userId = doc.id;

                // 1. Basic Exclusion (Block list, Swipes, Matches)
                if (
                    swipedUserIds.has(userId) ||
                    matchedUserIds.has(userId) ||
                    currentUser.blockedUsers?.includes(userId) ||
                    data.blockedUsers?.includes(currentUser.id)
                ) {
                    return;
                }

                const userCandidate = {
                    ...data,
                    id: userId,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as User;

                // 2. Age Filter
                if (userCandidate.age < activeAgeRange.min || userCandidate.age > activeAgeRange.max) {
                    return;
                }

                // 3. Gender Filter
                if (activeGenderPref !== 'any' && userCandidate.gender !== activeGenderPref) {
                    return;
                }

                // 4. Distance Filter
                if (currentUser.location?.coordinates && userCandidate.location?.coordinates) {
                    const distance = calculateDistance(
                        currentUser.location.coordinates,
                        userCandidate.location.coordinates
                    );
                    if (distance > activeMaxDistance) {
                        return;
                    }
                }

                // 5. Language Filter
                if (activeLanguages.length > 0) {
                    const candidateLanguages = userCandidate.languagesSpoken || [];
                    const hasLanguage = candidateLanguages.some(l => activeLanguages.includes(l.language));

                    if (!hasLanguage) {
                        return;
                    }
                }

                fetchedUsers.push(userCandidate);
            });
            // ... (rest of logic)
        } catch (err) {
            // ...
        }
    }, [currentUser, filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, loading, error, refetch: fetchUsers };
}

// Hook to handle swipes
export function useSwipes(userId: string | undefined) {
    const [loading, setLoading] = useState(false);

    const recordSwipe = async (
        toUserId: string,
        type: SwipeType
    ): Promise<{ matched: boolean; matchId?: string }> => {
        if (!userId) throw new Error('User not logged in');

        setLoading(true);
        try {
            // Record the swipe
            await addDoc(collection(db, 'swipes'), {
                from: userId,
                to: toUserId,
                type,
                timestamp: serverTimestamp(),
            });

            // If it's a like, check for mutual like
            if (type === 'like') {
                const mutualQuery = query(
                    collection(db, 'swipes'),
                    where('from', '==', toUserId),
                    where('to', '==', userId),
                    where('type', '==', 'like')
                );
                const mutualSnapshot = await getDocs(mutualQuery);

                if (!mutualSnapshot.empty) {
                    // Create a match
                    const matchDoc = await addDoc(collection(db, 'matches'), {
                        users: [userId, toUserId],
                        createdAt: serverTimestamp(),
                    });
                    return { matched: true, matchId: matchDoc.id };
                }
            }

            return { matched: false };
        } finally {
            setLoading(false);
        }
    };

    // Check if another user has liked the current user
    const checkIfLikedBy = async (otherUserId: string): Promise<boolean> => {
        if (!userId) return false;

        const likeQuery = query(
            collection(db, 'swipes'),
            where('from', '==', otherUserId),
            where('to', '==', userId),
            where('type', '==', 'like')
        );
        const snapshot = await getDocs(likeQuery);
        return !snapshot.empty;
    };

    return { recordSwipe, checkIfLikedBy, loading };
}

// Hook to get matches
export function useMatches(userId: string | undefined) {
    const [matches, setMatches] = useState<Match[]>([]);
    const [matchedUsers, setMatchedUsers] = useState<Map<string, User>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        // Note: Removed orderBy to avoid needing a composite index
        // We'll sort client-side instead
        const matchesQuery = query(
            collection(db, 'matches'),
            where('users', 'array-contains', userId)
        );

        const unsubscribe = onSnapshot(matchesQuery, async (snapshot) => {
            const matchesList: Match[] = [];
            const usersMap = new Map<string, User>();

            for (const matchDoc of snapshot.docs) {
                const data = matchDoc.data();
                const match: Match = {
                    id: matchDoc.id,
                    users: data.users as [string, string],
                    createdAt: data.createdAt?.toDate() || new Date(),
                    lastMessage: data.lastMessage,
                    lastMessageAt: data.lastMessageAt?.toDate(),
                };
                matchesList.push(match);

                // Fetch the other user's profile
                const otherUserId = match.users.find(id => id !== userId);
                if (otherUserId && !usersMap.has(otherUserId)) {
                    const userDocRef = await getDoc(doc(db, 'users', otherUserId));
                    if (userDocRef.exists()) {
                        usersMap.set(otherUserId, {
                            ...userDocRef.data(),
                            id: otherUserId,
                        } as User);
                    }
                }
            }

            // Sort client-side by lastMessageAt (most recent first)
            matchesList.sort((a, b) => {
                const timeA = a.lastMessageAt?.getTime() || a.createdAt.getTime();
                const timeB = b.lastMessageAt?.getTime() || b.createdAt.getTime();
                return timeB - timeA; // Descending order
            });

            setMatches(matchesList);
            setMatchedUsers(usersMap);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { matches, matchedUsers, loading };
}

// Hook for chat messages
export function useMessages(matchId: string | undefined) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!matchId) {
            setLoading(false);
            return;
        }

        const messagesQuery = query(
            collection(db, 'matches', matchId, 'messages'),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const messagesList: Message[] = snapshot.docs.map(doc => ({
                id: doc.id,
                matchId,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            } as Message));

            setMessages(messagesList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [matchId]);

    const sendMessage = async (text: string, senderId: string) => {
        if (!matchId) throw new Error('No match selected');

        await addDoc(collection(db, 'matches', matchId, 'messages'), {
            senderId,
            text,
            createdAt: serverTimestamp(),
        });

        // Update the match's last message
        await updateDoc(doc(db, 'matches', matchId), {
            lastMessage: text,
            lastMessageAt: serverTimestamp(),
        });
    };

    return { messages, loading, sendMessage };
}

// Hook to get a user profile by ID
export function useUserProfile(userId: string | undefined) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    setUser({
                        ...userDoc.data(),
                        id: userId,
                    } as User);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    return { user, loading };
}
