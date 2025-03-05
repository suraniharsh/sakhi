import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnzPiVTHq3RGyI_0TR-8TEX2PWXH0j3Cs",
  authDomain: "sakhi-11343.firebaseapp.com",
  projectId: "sakhi-11343",
  storageBucket: "sakhi-11343.firebasestorage.app",
  messagingSenderId: "575718285015",
  appId: "1:575718285015:web:51d378b489926056561a92",
  measurementId: "G-VGKS64YG88"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app; 