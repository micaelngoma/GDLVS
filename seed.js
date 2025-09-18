// seed.js content
// Seed script from earlier
// public/seed.js
// Run once after logging in. It promotes your current account to admin and inserts a sample license.
import { db, auth } from "./firebase.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) { alert("Please login first."); return; }
  try {
    await setDoc(doc(db,"roles",user.uid), { email: user.email||null, role: "admin" });
    await setDoc(doc(db,"licenses","TEST-12345"), {
      licenseNumber:"TEST-12345",
      fullName:"Jean Baptiste Moussavou",
      issueDate:"2020-06-10",
      expiryDate:"2030-06-10",
      status:"Active"
    });
    alert("✅ Seed complete: you are admin, sample license created.");
  } catch(err){ alert("Seed error: "+err.message); }
});
