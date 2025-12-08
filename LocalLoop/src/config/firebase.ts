// Firebase Configuration
// Uses environment variables from .env file
// Fallback to hardcoded values if env vars are not available (for development)
// Get these from: https://console.firebase.google.com -> Project Settings -> Your apps

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBWBc4M-v8F744Fq8ptOeGDY5Ws0kK1VKk",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "localloop-42221.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "localloop-auth",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "localloop.appspot.com",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "171259286074",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:171259286074:web:86d08e49c8983e478adb03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
