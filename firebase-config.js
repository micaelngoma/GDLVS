// firebase-config.js  (Firebase v9+ modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 🔐 Your project config (same keys you already use)
const firebaseConfig = {
  apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.appspot.com",
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
