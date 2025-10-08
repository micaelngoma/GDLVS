/**
 * GDLVS Firebase Cloud Functions
 * ================================
 * Automates:
 *  - Admin role assignment
 *  - Access request notifications
 *  - User creation on approval
 *  - Role synchronization
 *  - Cleanup on deletion
 *  - Bulk re-sync for recovery
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

// === SendGrid API Configuration ===
// Set in CLI: firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
sgMail.setApiKey(functions.config().sendgrid.key);

// === System Constants ===
const ADMIN_EMAIL = "m.ngoma1988@gmail.com";
const SYSTEM_EMAIL = "noreply@gdlvs.com";
const BASE_URL = "https://gdlvs-2348e.web.app";

/* ============================================================
   🔹 Callable: Assign Admin Role
   ============================================================ */
exports.setAdmin = functions.https.onCall(async (data, context) => {
  const targetEmail = "m.ngoma1988@gmail.com";

  try {
    const user = await admin.auth().getUserByEmail(targetEmail);
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });

    await db.collection("roles").doc(targetEmail).set({ role: "admin" }, { merge: true });
    console.log(`✅ ${targetEmail} assigned as ADMIN.`);
    return { message: `${targetEmail} is now an ADMIN.` };
  } catch (err) {
    console.error("❌ Error assigning admin:", err);
    throw new functions.https.HttpsError("unknown", err.message, err);
  }
});

/* ============================================================
   🔹 Trigger: Notify Admin on New Access Request
   ============================================================ */
exports.notifyAdminOnNewRequest = functions.firestore
  .document("requests/{requestId}")
  .onCreate(async (snap) => {
    const data = snap.data();
    const { fullName, email, organization, phone, purpose } = data;

    const msg = {
      to: ADMIN_EMAIL,
      from: SYSTEM_EMAIL,
      subject: `🆕 New GDLVS Access Request: ${fullName}`,
      text: `
A new access request has been submitted to the GDLVS system.

Full Name: ${fullName}
Email: ${email}
Organization: ${organization || "N/A"}
Phone: ${phone || "N/A"}
Purpose: ${purpose || "N/A"}

Please log in to review and approve this request:
${BASE_URL}/requests.html
      `,
    };

    try {
      // ✅ Notify Admin
      await sgMail.send(msg);
      console.log(`📨 Admin notified about new request from ${fullName} (${email})`);

      // ✅ Also notify user that their request was received
      const confirmation = {
        to: email,
        from: SYSTEM_EMAIL,
        subject: "✅ GDLVS Access Request Received",
        text: `
Dear ${fullName},

Your access request to the Gabon Driver’s License Verification System (GDLVS) has been received.

It will be reviewed by the administrator within the next 72 hours.
You will receive an update once your request has been approved.

Thank you for your interest in GDLVS.

Best regards,
GDLVS Administration
        `,
      };

      await sgMail.send(confirmation);
      console.log(`📨 Confirmation email sent to requester: ${email}`);
    } catch (error) {
      console.error("❌ Error sending notifications:", error);
    }
  });

/* ============================================================
   🔹 Trigger: Sync User + Role on Approval
   ============================================================ */
exports.syncUserOnApproval = functions.firestore
  .document("requests/{requestId}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only run if transitioning to "approved"
    if (before.status === "approved" || after.status !== "approved") return;

    const { fullName, email, organization, phone } = after;

    try {
      // 🔸 Create or update user record
      await db.collection("users").doc(email).set(
        {
          fullName,
          email,
          organization: organization || "",
          phone: phone || "",
          role: "verifier",
          status: "approved",
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // 🔸 Assign verifier role in Firestore
      await db.collection("roles").doc(email).set({ role: "verifier" }, { merge: true });
      console.log(`✅ Approved user synced: ${email}`);

      // 🔸 Send confirmation email to requester
      const msg = {
        to: email,
        from: SYSTEM_EMAIL,
        subject: "✅ GDLVS Access Approved",
        text: `
Dear ${fullName},

Your access request to the Gabon Driver’s License Verification System (GDLVS)
has been approved.

You can now log in using your registered email address at:
${BASE_URL}/index.html

If you experience any issues, contact the GDLVS administrator at ${ADMIN_EMAIL}.

Best regards,
GDLVS Administration
        `,
      };
      await sgMail.send(msg);
      console.log(`📩 Approval confirmation sent to ${email}`);
    } catch (error) {
      console.error("❌ Error syncing approved user:", error);
    }
  });

/* ============================================================
   🔹 Trigger: Clean Up Role on User Delete
   ============================================================ */
exports.cleanUpUserOnDelete = functions.firestore
  .document("users/{userId}")
  .onDelete(async (snap) => {
    const user = snap.data();
    if (!user || !user.email) return;

    try {
      await db.collection("roles").doc(user.email).delete();
      console.log(`🗑️ Role for ${user.email} deleted successfully.`);
    } catch (error) {
      console.error("❌ Error removing user role:", error);
    }
  });

/* ============================================================
   🔹 Trigger: Apply Auth Role Claims
   ============================================================ */
exports.applyRoleClaims = functions.firestore
  .document("roles/{email}")
  .onWrite(async (change, context) => {
    const email = context.params.email;
    const role = change.after.exists ? change.after.data().role : null;

    if (!role) {
      console.log(`ℹ️ Role for ${email} deleted or undefined. Skipping.`);
      return;
    }

    try {
      const user = await admin.auth().getUserByEmail(email);
      await admin.auth().setCustomUserClaims(user.uid, { role });
      console.log(`🔄 Updated custom claims for ${email} → ${role}`);
    } catch (err) {
      console.error(`❌ Error updating claims for ${email}:`, err.message);
    }
  });

/* ============================================================
   🔹 HTTP Endpoint: Manual Bulk Re-Sync
   ============================================================ */
exports.resyncRequests = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection("requests").where("status", "==", "approved").get();
    let count = 0;

    for (const doc of snapshot.docs) {
      const r = doc.data();
      await db.collection("users").doc(r.email).set(
        {
          fullName: r.fullName,
          email: r.email,
          organization: r.organization || "",
          phone: r.phone || "",
          role: "verifier",
          status: "approved",
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      await db.collection("roles").doc(r.email).set({ role: "verifier" }, { merge: true });
      count++;
    }

    console.log(`✅ Bulk re-sync complete. ${count} user(s) updated.`);
    res.status(200).send(`✅ Re-sync completed. ${count} records processed.`);
  } catch (err) {
    console.error("❌ Error during bulk re-sync:", err);
    res.status(500).send("Internal Server Error during re-sync.");
  }
});
