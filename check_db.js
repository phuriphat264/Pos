import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const d = await getDoc(doc(db, "pos_data", "main_store"));
  if(d.exists()) {
    console.log("INVENTORY COUNT:", d.data().inventory?.length || 0);
    console.log("CUSTOMERS COUNT:", d.data().customers?.length || 0);
    console.log("LAST UPDATED:", new Date(d.data().lastUpdatedLocal).toLocaleString());
  } else {
    console.log("NO DATA IN FIREBASE");
  }
  process.exit(0);
}
check();
