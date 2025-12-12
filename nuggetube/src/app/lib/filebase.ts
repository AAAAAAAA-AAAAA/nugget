// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVegjmAS1PL1zDMHxdCbfh83jRN21B1M4",
  authDomain: "nugget-7263c.firebaseapp.com",
  projectId: "nugget-7263c",
  storageBucket: "nugget-7263c.firebasestorage.app",
  messagingSenderId: "543535541610",
  appId: "1:543535541610:web:bdd8ffffa003abf7ea4913",
  measurementId: "G-97B4ZB0KD5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase Auth and Google provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);