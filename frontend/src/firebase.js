// Firebase Configuration for CodeConnect
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAT2K4CEFA9ZQenAXOYHQ0-0pZio-YY1l8",
    authDomain: "code-connect-fe801.firebaseapp.com",
    projectId: "code-connect-fe801",
    storageBucket: "code-connect-fe801.firebasestorage.app",
    messagingSenderId: "577715425702",
    appId: "1:577715425702:web:e683c598534a9a87abbf67",
    measurementId: "G-LGGX1SFVXJ"
};

// Validate Config
if (!firebaseConfig.apiKey) {
    console.error("Firebase Configuration Missing! Check your .env setup.");
}

// Initialize Firebase
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    console.error("Firebase Initialization Error:", error);
    // Fallback or re-throw
    throw new Error("Firebase init failed: " + (error.message || String(error)));
}

// Initialize Analytics (safely)
let analytics = null;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
});

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export { app, analytics };
export default app;
