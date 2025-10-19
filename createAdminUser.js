// createAdminUser.js
const admin = require("firebase-admin");

// Initialize Admin SDK (uses your local gcloud credentials or service account)
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

async function createSystemAdmin() {
  try {
    // Step 1 — Create admin account in Firebase Auth
    const user = await admin.auth().createUser({
      email: "m.ngoma1988@gmail.com",
      password: "GDLVSsecure123!", // temp password for first login
      displayName: "GDLVS System Administrator",
      emailVerified: true
    });
    console.log("✅ Created user:", user.email);

    // Step 2 — Assign admin custom claim
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    console.log("🔑 Custom claim { role: 'admin' } assigned.");

    // Step 3 — Add Firestore role document
    const db = admin.firestore();
    await db.collection("roles").doc(user.email).set({
      role: "admin",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("📁 Firestore document added under roles/", user.email);

    console.log("🎉 GDLVS Admin user created successfully!");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  }
}

createSystemAdmin();
