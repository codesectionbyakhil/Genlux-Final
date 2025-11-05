// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
