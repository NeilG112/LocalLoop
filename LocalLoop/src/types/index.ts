// LocalLoop Type Definitions

// User Roles
export type UserRole = 'host' | 'visitor';
export type Gender = 'male' | 'female' | 'other';
export type GenderPreference = 'any' | 'male' | 'female' | 'other';

// Language proficiency levels (CEFR standard)
export type LanguageProficiency = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// Language with proficiency level
export interface LanguageWithLevel {
    language: string;
    level: LanguageProficiency;
}

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
    languagesSpoken: LanguageWithLevel[];  // Languages user speaks with proficiency
    languagesToLearn?: LanguageWithLevel[]; // Languages user wants to learn (optional for visitors)
    interests: string[];
    photos: string[];
    role: UserRole;
    location: Location;
    preferences: UserPreferences;
    blockedUsers: string[];
    pushToken?: string;
    durationOfStay?: string; // Only for visitors
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
    languagesSpoken: LanguageWithLevel[];
    languagesToLearn?: LanguageWithLevel[];
    interests: string[];
    photos: string[];
    role: UserRole;
    location: Location;
    preferences: UserPreferences;
    durationOfStay?: string;
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
