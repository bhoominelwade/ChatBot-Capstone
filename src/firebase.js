import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyARAnWD_DlEX_mcji2ywc5MQzcctqOk_sE",
    authDomain: "finalprj-ac971.firebaseapp.com",
    projectId: "finalprj-ac971",
    storageBucket: "finalprj-ac971.appspot.com",
    messagingSenderId: "643444492440",
    appId: "1:643444492440:web:3a46cb303f557f33b0a8ed",
    measurementId: "G-2HFPEN6D04"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;