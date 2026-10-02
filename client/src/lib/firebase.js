import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const getEnv = (key) => (typeof process !== "undefined" && process.env ? process.env[key] : undefined);

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID"),
};

const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let db = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} else {
  console.warn("Firebase config missing. Using localStorage fallback for bouquet sharing.");
}

export { db, auth, googleProvider, isFirebaseConfigured };
