import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDO8rLj1rvHZq6f2luS14E36wamQVq6vnU",
  authDomain: "love-4db65.firebaseapp.com",
  databaseURL: "https://love-4db65-default-rtdb.firebaseio.com",
  projectId: "love-4db65",
  storageBucket: "love-4db65.firebasestorage.app",
  messagingSenderId: "314625864463",
  appId: "1:314625864463:web:d8c03e4f646d006b3c047a",
  measurementId: "G-PHH8KV3B81"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
try { getAnalytics(app); } catch(e) {}
export default app;
