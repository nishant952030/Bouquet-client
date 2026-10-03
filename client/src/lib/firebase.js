import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const apiKey =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  process.env.VITE_FIREBASE_API_KEY ||
  "AIzaSyCTsC2-lzdcfFw6GaRA2Dn6nltBZcKYa1k";

const authDomain =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
  process.env.VITE_FIREBASE_AUTH_DOMAIN ||
  "bouquet-9a203.firebaseapp.com";

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID ||
  "bouquet-9a203";

const storageBucket =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  process.env.VITE_FIREBASE_STORAGE_BUCKET ||
  "bouquet-9a203.firebasestorage.app";

const messagingSenderId =
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
  process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
  "904506751557";

const appId =
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
  process.env.VITE_FIREBASE_APP_ID ||
  "1:904506751557:web:0b3ae9d173f63a5e25012c";

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

const isFirebaseConfigured = Boolean(apiKey && authDomain && projectId && appId);

let db = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} else {
  console.warn("Firebase config missing. Using localStorage fallback for bouquet sharing.");
}

export { db, auth, googleProvider, isFirebaseConfigured };
