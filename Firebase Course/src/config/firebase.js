import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA-AePp2r1YGUW8tve8JivyI_GriaK8TpA",
  authDomain: "fir-course-b8f7d.firebaseapp.com",
  projectId: "fir-course-b8f7d",
  storageBucket: "fir-course-b8f7d.appspot.com",
  messagingSenderId: "801264476485",
  appId: "1:801264476485:web:2534f817111a5054eb5e2c",
  measurementId: "G-57TPQ7PMK5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Auth with Google
export const googleProvider = new GoogleAuthProvider();
// Firestore database
export const db = getFirestore(app);
// Firebase storage
export const storage = getStorage(app);
