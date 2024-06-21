// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC_8eeY-0EfoQB2aDXZRKwvf7gMWOCOMs8",
    authDomain: "nutrivision-f1daa.firebaseapp.com",
    projectId: "nutrivision-f1daa",
    storageBucket: "nutrivision-f1daa.appspot.com",
    messagingSenderId: "9059900724",
    appId: "1:9059900724:web:e93f99f02f01f3bfb45961",
    measurementId: "G-XVS57HLFF4"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const auth = getAuth(FIREBASE_APP);
export const db = getDatabase(FIREBASE_APP)