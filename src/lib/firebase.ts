'use client';
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "studio-8031940220-7023b",
  appId: "1:566909750901:web:c9b8cd765d32181a21f23c",
  apiKey: "AIzaSyDG2Cg4XJzZMkwm8_o97qRo82pAgPqoLSU",
  authDomain: "studio-8031940220-7023b.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "566909750901",
  storageBucket: "studio-8031940220-7023b.appspot.com"
};

// Initialize Firebase for client side
function initializeFirebase() {
    if (getApps().length === 0) {
        return initializeApp(firebaseConfig);
    } else {
        return getApp();
    }
}

const app = initializeFirebase();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// NOTE: The Firebase config has been populated with your project's credentials.
// You can view and manage your project in the Firebase console.
