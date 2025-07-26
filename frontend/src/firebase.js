import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDGPon7WHgKLRq8DYkamUvbq6pznqNYBus",
  authDomain: "gen-lang-client-0045692674.firebaseapp.com",
  projectId: "gen-lang-client-0045692674",
  storageBucket: "gen-lang-client-0045692674.firebasestorage.app",
  messagingSenderId: "563280616510",
  appId: "1:563280616510:web:bff3058114879c6726c56f",
  measurementId: "G-YQNY58JKC0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;