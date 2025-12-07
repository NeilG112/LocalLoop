// Firebase Configuration
// Replace these placeholder values with your actual Firebase project credentials
// Get these from: https://console.firebase.google.com -> Project Settings -> Your apps

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBWBc4M-v8F744Fq8ptOeGDY5Ws0kK1VKk",
    authDomain: "localloop-auth.firebaseapp.com",
    projectId: "localloop-auth",
    storageBucket: "localloop-auth.appspot.com",
    messagingSenderId: "171259286074",
    appId: "1:171259286074:web:86d08e49c8983e478adb03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
