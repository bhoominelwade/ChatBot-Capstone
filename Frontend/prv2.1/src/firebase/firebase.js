// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";



const firebaseConfig = {
  apiKey: "AIzaSyDQo9T462lYTfAH40sVGrxJzC5grWuyiYQ",
  authDomain: "chatbot-app-277fb.firebaseapp.com",
  projectId: "chatbot-app-277fb",
  storageBucket: "chatbot-app-277fb.appspot.com",
  messagingSenderId: "957280015001",
  appId: "1:957280015001:web:e6a4c4e429ec05070e5e08",
  measurementId: "G-8JB8K0SL2K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

export{app, auth};
