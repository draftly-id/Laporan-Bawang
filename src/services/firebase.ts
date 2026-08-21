import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth } from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length
  ? initializeApp({
      apiKey: firebaseConfigData.apiKey,
      authDomain: firebaseConfigData.authDomain,
      projectId: firebaseConfigData.projectId,
      storageBucket: firebaseConfigData.storageBucket,
      messagingSenderId: firebaseConfigData.messagingSenderId,
      appId: firebaseConfigData.appId,
    })
  : getApp();

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Ensure authenticated session
export async function ensureAuth() {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (err) {
    console.warn('Anonymous auth note (proceeding):', err);
  }
}

export {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
};

