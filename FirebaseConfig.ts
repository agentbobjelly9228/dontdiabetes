// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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
var auth;
try {
    auth = initializeAuth(FIREBASE_APP, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });

} catch {
    auth = getAuth(FIREBASE_APP);
}
export const FIREBASE_AUTH = auth;
export const FIREBASE_DATABASE = getDatabase(FIREBASE_APP)
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP)
// export const auth = getAuth(FIREBASE_APP);
// export const db = getDatabase(FIREBASE_APP)
