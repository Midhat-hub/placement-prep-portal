export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDAkkQUxg_xyNNiLm5nhnX2m4iuYJ08xwQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "placement-prep-portal-7d3ef.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "placement-prep-portal-7d3ef",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "placement-prep-portal-7d3ef.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "897705345889",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:897705345889:web:921dc07eff45a825397b20",
};
