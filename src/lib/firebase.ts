'use client';

// Import Firebase
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCF62zHT9CbtSloXc4EYrCTJrjTpy5zBhQ",
  authDomain: "meditrack-3f2c0.firebaseapp.com",
  projectId: "meditrack-3f2c0",
  storageBucket: "meditrack-3f2c0.firebasestorage.app",
  messagingSenderId: "297941069670",
  appId: "1:297941069670:web:0a0845d8400803e71922a7",
  measurementId: "G-50LHG5M8T8"
};

// Initialize Firebase safely
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);