import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- Firebase Configuration ---
// These global variables are provided by the environment.
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
      apiKey: "YOUR_FALLBACK_API_KEY",
      authDomain: "YOUR_FALLBACK_AUTH_DOMAIN",
      projectId: "YOUR_FALLBACK_PROJECT_ID",
      storageBucket: "YOUR_FALLBACK_STORAGE_BUCKET",
      messagingSenderId: "YOUR_FALLBACK_MESSAGING_SENDER_ID",
      appId: "YOUR_FALLBACK_APP_ID"
    };

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
// Initialize and export only the Firestore database
const db = getFirestore(app);

// --- Exports ---
export { app, db };