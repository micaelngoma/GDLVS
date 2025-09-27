const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

/**
 * Set a user as ADMIN (run this once for your email).
 */
exports.setAdmin = functions.https.onCall(async (data, context) => {
  // Your Firebase Authentication email
  const targetEmail = "m.ngoma1988@gmail.com";

  try {
    const user = await admin.auth().getUserByEmail(targetEmail);
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });

    return { message: `${targetEmail} is now an ADMIN.` };
  } catch (err) {
    throw new functions.https.HttpsError("unknown", err.message, err);
  }
});
