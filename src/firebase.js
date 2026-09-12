// Firebase Initialization
// EvoGuard — Firebase Realtime Database
// Fill in VITE_FIREBASE_* env vars in .env.local

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

// Only initialize if the required config is present
const isFirebaseConfigured =
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "your_api_key_here" &&
    firebaseConfig.databaseURL &&
    firebaseConfig.databaseURL !== "https://your_project-default-rtdb.firebaseio.com";

let app = null;
let db = null;

if (isFirebaseConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        db = getDatabase(app);
        console.log("✅ Firebase Realtime Database connected.");
    } catch (err) {
        console.warn("⚠️ Firebase init failed:", err.message);
    }
} else {
    console.info(
        "ℹ️ Firebase not configured. Fill in VITE_FIREBASE_* vars in .env.local to enable live data."
    );
}

export { db, isFirebaseConfigured };

