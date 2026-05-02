// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAkkQUxg_xyNNiLm5nhnX2m4iuYJ08xwQ",
  authDomain: "placement-prep-portal-7d3ef.firebaseapp.com",
  projectId: "placement-prep-portal-7d3ef",
  storageBucket: "placement-prep-portal-7d3ef.firebasestorage.app",
  messagingSenderId: "897705345889",
  appId: "1:897705345889:web:921dc07eff45a825397b20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)