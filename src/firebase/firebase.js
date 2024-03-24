import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBndyj1ID2UZ2TLdP-2XPSZcVia30Q9zME",
  authDomain: "trading-journal-3d91c.firebaseapp.com",
  projectId: "trading-journal-3d91c",
  storageBucket: "trading-journal-3d91c.appspot.com",
  messagingSenderId: "602422204474",
  appId: "1:602422204474:web:6c8b90a5cd0a83e3657d03",
  measurementId: "G-QZX3ZPQZ6M"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore()

