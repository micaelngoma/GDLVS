/**
 * GDLVS Firebase Cloud Functions
 * ================================
 * Automates:
 *  - Admin role assignment
 *  - Access request notifications
 *  - User creation on approval
 *  - Cleanup on deletion
 *  - Optional bulk re-sync
 *
 * Author: Micael Ngoma
 * Project: Gabon Driver’s License Verification System (GDLVS)
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

// === Initialize Firebase Admin ===
admin.initializeApp();
const db = admin.firestore();

// === Set your SendGrid API key ===
// Set once in your Firebase CLI:
// firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
sgMail.setApiKey(functions.config().sendgrid.key);

// === Constants ===
const ADMIN_EMAIL = "m.ngoma1988@gmail.com";
const SYSTEM_EMAIL = "noreply@gdlvs.com";

/**
 * 🔹 Callable: Assign Admin Role
 * ---------------------------------
 * Run manually once via Firebase CLI or callable client.
 * This grants ADMIN rights to the specified email.
 */
exports.setAdmin = functions.https.onCall(async (data, context) => {
  const targetEmail = "m.ngoma1988@gmail.com";
  try {
    const user = await admin.auth().getUserByEmail(targetEmail);
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });

    return { message: `${targetEmail} is now an ADMIN.` };
  } catch (err) {
    throw new functions.https.HttpsError("unknown", err.message, err);
  }
});

/**
 * 🔹 Trigger: Notify Admin on New Access Request
 * -----------------------------------------------
 * Fires when a new access request is submitted in /requests.
 * Sends an email alert to the admin.
 */
exports.notifyAdminOnNewRequest = functions.firestore
  .document("requests/{requestId}")
  .onCreate(async (snap) => {
    const data = snap.data();
    const { fullName, email, organization, phone, purpose } = data;

    const msg = {
      to: ADMIN_EMAIL,
      from: SYSTEM_EMAIL,
      subject: `🆕 New Access Request: ${fullName}`,
      text: `
A new access request was submitted to GDLVS.

Full Name: ${fullName}
Email: ${email}
Organization: ${organization}
Phone: ${phone}
Purpose: ${purpose}

Please log in to review and approve this request:
https://gdlvs-2348e.web.app/requests.html
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Admin notified of new request from ${fullName}`);
    } catch (error) {
      console.error("❌ Error sending admin notification:", error);
    }
  });

/**
 * 🔹 Trigger: Sync User When Request Approved
 * --------------------------------------------
 * When a request’s status changes from pending → approved,
 * a corresponding user and role document are created.
 * Also sends an approval email to the requester.
 */
exports.syncUserOnApproval = functions.firestore
  .document("requests/{requestId}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status === "approved" || after.status !== "approved") return;

    const { fullName, email, organization, phone } = after;

    try {
      // ✅ Create / Update User Record
      await db.collection("users").doc(email).set({
        fullName,
        email,
        organization,
        phone,
        role: "verifier",
        status: "approved",
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // ✅ Create / Update Role Record
      await db.collection("roles").doc(email).set({ role: "verifier" });

      console.log(`✅ User ${email} synced to users & roles.`);

      // 📧 Notify the requester
      const msg = {
        to: email,
        from: SYSTEM_EMAIL,
        subject: "✅ GDLVS Access Approved",
        text: `
Dear ${fullName},

Your access request to the Gabon Driver’s License Verification System (GDLVS) has been approved.

You can now log in to your account:
https://gdlvs-2348e.web.app/index.html

Best regards,  
GDLVS Administration
        `,
      };
      await sgMail.send(msg);
      console.log(`📨 Approval email sent to ${email}`);
    } catch (error) {
      console.error("❌ Error syncing approved user:", error);
    }
  });

/**
 * 🔹 Trigger: Clean Up on User Delete
 * -----------------------------------
 * Automatically deletes role entry when a user is removed.
 */
exports.cleanUpUserOnDelete = functions.firestore
  .document("users/{userId}")
  .onDelete(async (snap) => {
    const user = snap.data();
    try {
      await db.collection("roles").doc(user.email).delete();
      console.log(`🗑️ Role for ${user.email} removed.`);
    } catch (error) {
      console.error("❌ Error cleaning up user roles:", error);
    }
  });

/**
 * 🔹 HTTP Endpoint: Manual Request Re-Sync
 * ----------------------------------------
 * Useful for bulk repairing records or migration tasks.
 * Example: https://us-central1-gdlvs-2348e.cloudfunctions.net/resyncRequests
 */
exports.resyncRequests = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection("requests").where("status", "==", "approved").get();
    let count = 0;

    for (const doc of snapshot.docs) {
      const r = doc.data();
      await db.collection("users").doc(r.email).set({
        fullName: r.fullName,
        email: r.email,
        organization: r.organization,
        phone: r.phone,
        role: "verifier",
        status: "approved",
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await db.collection("roles").doc(r.email).set({ role: "verifier" });
      count++;
    }

    res.status(200).send(`✅ Re-sync completed. ${count} records processed.`);
  } catch (err) {
    console.error("❌ Error during resync:", err);
    res.status(500).send("Internal Server Error");
  }
});
