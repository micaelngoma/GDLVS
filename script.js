// === Firebase Setup ===
var firebaseConfig = {
  apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.appspot.com",
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff"
};

// Initialize Firebase if not already
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
var auth = firebase.auth();
var db = firebase.firestore();

// === Admin Emails (hardcoded for Capstone demo) ===
var ADMIN_EMAILS = ["m.ngoma1988@gmail.com", "ngomamicaelc@gmail.com"];

// === Utility: Show Alert Messages ===
function showAlert(message, type = "error") {
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert " + (type === "success" ? "success" : "error");
  alertDiv.innerText = message;
  document.body.prepend(alertDiv);
  setTimeout(() => alertDiv.remove(), 4000);
}

// === AUTHENTICATION ===

// Login user with email/password
function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) {
    showAlert("Please enter email and password.");
    return;
  }
  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(error => showAlert(error.message, "error"));
}

// Sign out
function signOutUser() {
  auth.signOut()
    .then(() => window.location.href = "index.html")
    .catch(error => showAlert(error.message, "error"));
}

// Restrict access to pages
auth.onAuthStateChanged(user => {
  const currentPage = window.location.pathname.split("/").pop();
  const protectedPages = ["dashboard.html", "add_license.html", "logs.html", "backups.html", "backupLogs.html"];

  if (!user && protectedPages.includes(currentPage)) {
    window.location.href = "index.html";
    return;
  }

  // Extra restriction: Add License is admin-only
  if (user && currentPage === "add_license.html" && !ADMIN_EMAILS.includes(user.email)) {
    alert("You don’t have permission to add licenses.");
    window.location.href = "dashboard.html";
  }
});

// === LICENSE MANAGEMENT ===

// Add new license (admin only)
function addLicense() {
  const licenseNumber = document.getElementById("licenseNumber").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const licenseClass = document.getElementById("licenseClass").value;
  const issueDate = document.getElementById("issueDate").value;
  const expiryDate = document.getElementById("expiryDate").value;

  if (!licenseNumber || !fullName || !licenseClass || !issueDate || !expiryDate) {
    showAlert("Please fill in all fields.", "error");
    return;
  }

  const ref = db.collection("licenses").doc(licenseNumber);
  ref.get().then(docSnap => {
    if (docSnap.exists) {
      showAlert("License already exists!", "error");
      return;
    }
    return ref.set({
      licenseNumber,
      fullName,
      class: licenseClass,
      status: "Active",
      issueDate,
      expiryDate,
      addedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.currentUser ? auth.currentUser.email : null
    });
  })
  .then(() => {
    showAlert("License added successfully!", "success");
    document.getElementById("addLicenseForm").reset();
  })
  .catch(error => showAlert("Error adding license: " + error.message, "error"));
}

// === DASHBOARD ===
function loadDashboardData() {
  db.collection("licenses").get().then(snapshot => {
    const total = snapshot.size;
    let activeCount = 0;
    snapshot.forEach(doc => {
      if (doc.data().status === "Active") activeCount++;
    });
    document.getElementById("totalLicenses").innerText = total;
    document.getElementById("activeLicenses").innerText = activeCount;
  });
}

// === VERIFICATION ===
function verifyLicense() {
  const licenseNumber = document.getElementById("verifyLicenseNumber").value.trim();
  const requestingOrg = document.getElementById("requestingOrg")?.value.trim();
  const country = document.getElementById("country")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const purpose = document.getElementById("purpose")?.value.trim();

  if (!licenseNumber) {
    showAlert("Please enter a license number.", "error");
    return;
  }

  db.collection("licenses").doc(licenseNumber).get()
    .then(doc => {
      const resultDiv = document.getElementById("verificationResult");
      let resultText = "";

      if (!doc.exists) {
        resultText = "<p>License not found.</p>";
      } else {
        const data = doc.data();
        resultText = `
          <p><strong>Name:</strong> ${data.fullName}</p>
          <p><strong>Class:</strong> ${data.class}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          <p><strong>Issue Date:</strong> ${data.issueDate}</p>
          <p><strong>Expiry Date:</strong> ${data.expiryDate}</p>
        `;
      }
      resultDiv.innerHTML = resultText;

      // Log verification attempt
      db.collection("verifications").add({
        licenseNumber,
        requestingOrg,
        country,
        email,
        purpose,
        result: doc.exists ? "License found" : "License not found",
        verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .catch(error => showAlert("Error verifying license: " + error.message, "error"));
}

// === Page Hooks ===
window.onload = function() {
  const page = window.location.pathname.split("/").pop();
  if (page === "dashboard.html") loadDashboardData();
};

// Expose globally
window.loginUser = loginUser;
window.signOutUser = signOutUser;
window.addLicense = addLicense;
window.verifyLicense = verifyLicense;
