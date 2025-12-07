// LocalLoop Type Definitions

// User Roles
export type UserRole = 'host' | 'visitor';
export type Gender = 'male' | 'female' | 'other';
export type GenderPreference = 'any' | 'male' | 'female' | 'other';

// Location types
export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Location {
    country: string;
    city: string;
    coordinates: Coordinates;
    geohash?: string;
}

// User preferences
export interface AgePreference {
    min: number;
    max: number;
}

export interface UserPreferences {
    radiusPreference: number; // in km
    genderPreference: GenderPreference;
    agePreference: AgePreference;
}

// Main User Profile
export interface User {
    id: string;
    email: string;
    name: string;
    age: number;
    gender: Gender;
    bio: string;
    languages: string[];
    interests: string[];
    photos: string[];
    role: UserRole;
    location: Location;
    preferences: UserPreferences;
    blockedUsers: string[];
    pushToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Partial user for creating profiles
export interface CreateUserData {
    email: string;
    name: string;
    age: number;
    gender: Gender;
    bio: string;
    languages: string[];
    interests: string[];
    photos: string[];
    role: UserRole;
    location: Location;
    preferences: UserPreferences;
}

// Swipe types
export type SwipeType = 'like' | 'dislike';

export interface Swipe {
    id: string;
    from: string;  // userId who swiped
    to: string;    // userId who was swiped on
    type: SwipeType;
    timestamp: Date;
}

// Match types
export interface Match {
    id: string;
    users: [string, string]; // Two user IDs
    createdAt: Date;
    lastMessage?: string;
    lastMessageAt?: Date;
}

// Message types
export interface Message {
    id: string;
    matchId: string;
    senderId: string;
    text: string;
    createdAt: Date;
}

// Filter options for feed
export interface FeedFilters {
    ageRange: AgePreference;
    gender: GenderPreference;
    maxDistance: number;
    languages?: string[];
    interests?: string[];
}

// Auth state
export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    firebaseUser: any | null;
}

// Report (for safety feature)
export interface Report {
    id: string;
    reporterId: string;
    reportedId: string;
    reason: string;
    timestamp: Date;
}

// Notification types
export type NotificationType = 'new_match' | 'new_message' | 'liked_you';

export interface Notification {
    id: string;
    type: NotificationType;
    userId: string;
    relatedUserId?: string;
    matchId?: string;
    message: string;
    read: boolean;
    createdAt: Date;
}
