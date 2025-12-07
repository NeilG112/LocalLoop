// Auth Context - Firebase Authentication State Management

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, CreateUserData, AuthState } from '../types';

interface AuthContextType extends AuthState {
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<string>;
    signOut: () => Promise<void>;
    updateUserProfile: (data: Partial<User>) => Promise<void>;
    createUserProfile: (userId: string, data: CreateUserData) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        firebaseUser: null,
    });

    // Fetch user profile from Firestore
    const fetchUserProfile = async (uid: string): Promise<User | null> => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                return {
                    ...data,
                    id: uid,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as User;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userProfile = await fetchUserProfile(firebaseUser.uid);
                setState({
                    isAuthenticated: true,
                    isLoading: false,
                    user: userProfile,
                    firebaseUser,
                });
            } else {
                setState({
                    isAuthenticated: false,
                    isLoading: false,
                    user: null,
                    firebaseUser: null,
                });
            }
        });

        return () => unsubscribe();
    }, []);

    // Sign in with email/password
    const signIn = async (email: string, password: string): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const userProfile = await fetchUserProfile(result.user.uid);
            setState({
                isAuthenticated: true,
                isLoading: false,
                user: userProfile,
                firebaseUser: result.user,
            });
        } catch (error) {
            setState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    // Sign up with email/password - returns user ID for profile creation
    const signUp = async (email: string, password: string): Promise<string> => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            setState(prev => ({
                ...prev,
                isLoading: false,
                firebaseUser: result.user,
                isAuthenticated: true
            }));
            return result.user.uid;
        } catch (error) {
            setState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    // Create user profile in Firestore
    const createUserProfile = async (userId: string, data: CreateUserData): Promise<void> => {
        try {
            await setDoc(doc(db, 'users', userId), {
                ...data,
                blockedUsers: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            const userProfile = await fetchUserProfile(userId);
            setState(prev => ({ ...prev, user: userProfile }));
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    };

    // Update user profile
    const updateUserProfile = async (data: Partial<User>): Promise<void> => {
        if (!state.user?.id) throw new Error('No user logged in');

        try {
            await updateDoc(doc(db, 'users', state.user.id), {
                ...data,
                updatedAt: serverTimestamp(),
            });

            setState(prev => ({
                ...prev,
                user: prev.user ? { ...prev.user, ...data } : null,
            }));
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    };

    // Sign out
    const signOut = async (): Promise<void> => {
        try {
            await firebaseSignOut(auth);
            setState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                firebaseUser: null,
            });
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    // Refresh user data
    const refreshUser = async (): Promise<void> => {
        if (state.firebaseUser) {
            const userProfile = await fetchUserProfile(state.firebaseUser.uid);
            setState(prev => ({ ...prev, user: userProfile }));
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                signIn,
                signUp,
                signOut,
                updateUserProfile,
                createUserProfile,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
