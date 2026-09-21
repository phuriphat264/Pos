import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCsQBZJKirRAV-3hfyo_YrYP3k_B4Pumgo",
  authDomain: "pospp-c5ca2.firebaseapp.com",
  projectId: "pospp-c5ca2",
  storageBucket: "pospp-c5ca2.firebasestorage.app",
  messagingSenderId: "275900087460",
  appId: "1:275900087460:web:a472b8864758cfdba7ba31",
  measurementId: "G-1GWTEZ4P7G"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider, doc, setDoc, onSnapshot };
