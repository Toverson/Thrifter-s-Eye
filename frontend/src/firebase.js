import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCW6BjHAyGc9Pic4TWKvcE1xxPEXComxMY",
  authDomain: "thrifters-eye-app.firebaseapp.com",
  projectId: "thrifters-eye-app",
  storageBucket: "thrifters-eye-app.appspot.com",
  messagingSenderId: "308c3b4b446924325",
  appId: "1:308c3b4b446924325:web:thrifterseye"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;