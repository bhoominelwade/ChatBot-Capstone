import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDP_rQ1U0_2xEFEfe92GEzFcsB0FU3wWmw",
    authDomain: "test-d1e87.firebaseapp.com",
    projectId: "test-d1e87",
    storageBucket: "test-d1e87.appspot.com",
    messagingSenderId: "247468023811",
    appId: "1:247468023811:web:1db9e825819d182ced6e36",
    measurementId: "G-004GC814KR"
};

const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;