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
import { User, Swipe, Match, Message, SwipeType } from '../types';

// Hook to fetch users for swiping
export function useSwipeablUsers(
    currentUser: User | null,
    filters?: { maxDistance?: number; ageRange?: { min: number; max: number } }
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
            const constraints: QueryConstraint[] = [
                where('role', '==', targetRole),
                limit(20),
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

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const userId = doc.id;

                // Skip if already swiped, matched, or blocked
                if (
                    swipedUserIds.has(userId) ||
                    matchedUserIds.has(userId) ||
                    currentUser.blockedUsers?.includes(userId) ||
                    data.blockedUsers?.includes(currentUser.id)
                ) {
                    return;
                }

                fetchedUsers.push({
                    ...data,
                    id: userId,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as User);
            });

            setUsers(fetchedUsers);
            setError(null);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

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

        const matchesQuery = query(
            collection(db, 'matches'),
            where('users', 'array-contains', userId),
            orderBy('lastMessageAt', 'desc')
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
