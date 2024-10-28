import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCr8VJg3-cyu-V8693hVBRPeTX9Gs8hbVo",
  authDomain: "capstone-4eff9.firebaseapp.com",
  projectId: "capstone-4eff9",
  storageBucket: "capstone-4eff9.appspot.com",
  messagingSenderId: "841107545003",
  appId: "1:841107545003:web:808862ff4c8b47f7e250ee",
  measurementId: "G-MHE45H8Z9Y"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;