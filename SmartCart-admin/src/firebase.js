// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase config
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBekyEZu_pWpblzDzRivNiZXLyx-aGukPw",
  authDomain: "smartcart3-80472.firebaseapp.com",
  projectId: "smartcart3-80472",
  storageBucket: "smartcart3-80472.firebasestorage.app",
  messagingSenderId: "521256420311",
  appId: "1:521256420311:web:2c5928b0a919ba35dc4192",
  measurementId: "G-91TN2Y62MT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
