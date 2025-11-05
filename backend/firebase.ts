
// Import the functions you need from the SDKs you need
// FIX: Switched to Firebase v8 compatibility imports to resolve module export errors.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVm-Lo2zLSbFfX5deExD_ZS47NElFHg1Y",
  authDomain: "genlux-ai.firebaseapp.com",
  projectId: "genlux-ai",
  storageBucket: "genlux-ai.firebasestorage.app",
  messagingSenderId: "1072235208709",
  appId: "1:1072235208709:web:94d7d4d007da4798f03c6c"
};

// Initialize Firebase
// FIX: Switched to v8 compat initialization style.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// FIX: Export v8 compat instances of auth and firestore.
export const auth = firebase.auth();
export const db = firebase.firestore();
