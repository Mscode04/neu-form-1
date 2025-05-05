// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZ9_hNR8k2vkZ9zWJbK3ZVfFfGwePeQ6k",
  authDomain: "form-neuraq.firebaseapp.com",
  projectId: "form-neuraq",
  storageBucket: "form-neuraq.firebasestorage.app",
  messagingSenderId: "708531385925",
  appId: "1:708531385925:web:cf821ae1a3f2e07226552c",
  measurementId: "G-DCVEQ4W42D"
};

const FirebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(FirebaseApp);
