// src/services/firebaseClient.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmpoE8jCddMSi5-hpmRrdQfIplERKF1Xc",
  authDomain: "gen-lang-client-0239125682.firebaseapp.com",
  databaseURL: "https://gen-lang-client-0239125682-default-rtdb.firebaseio.com",
  projectId: "gen-lang-client-0239125682",
  storageBucket: "gen-lang-client-0239125682.firebasestorage.app",
  messagingSenderId: "958379450977",
  appId: "1:958379450977:web:e3b900285a42518c138020",
  measurementId: "G-SD9ZDEM9VY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app); // Realtime Database

export { auth, db, realtimeDb, analytics };
