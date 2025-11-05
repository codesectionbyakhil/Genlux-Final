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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();