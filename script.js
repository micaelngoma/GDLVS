// === Firebase setup (gdlvs-system) ===
var firebaseConfig = {
  apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.firebasestorage.app",
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
var auth = firebase.auth();
var db = firebase.firestore();

// === Helper: Sanitize Input ===
function sanitize(input) {
  if (!input) return "";
  return input.replace(/[<>{}()$;]/g, "").trim();
}

// === Helper: Alerts ===
function showAlert(message, type = "error") {
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert " + (type === "success" ? "success" : "error");
  alertDiv.innerText = message;
  document.body.prepend(alertDiv);
  setTimeout(() => alertDiv.remove(), 4000);
}

// === Authentication Functions ===
function loginUser() {
  const email = sanitize(document.getElementById("email").value);
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showAlert("Please enter email and password.", "error");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(error => showAlert(error.message, "error"));
}

function signOutUser() {
  auth.signOut()
    .then(() => window.location.href = "index.html")
    .catch(error => showAlert(error.message, "error"));
}

// === Restrict Pages by Role ===
auth.onAuthStateChanged(async user => {
  const currentPage = window.location.pathname.split("/").pop();
  const protectedPages = ["dashboard.html", "add_license.html"];

  if (!user && protectedPages.includes(currentPage)) {
    window.location.href = "index.html";
    return;
  }

  if (user) {
    const token = await user.getIdTokenResult();
    const role = token.claims.role || "none";

    // Restrict add_license.html to admins only
    if (currentPage === "add_license.html" && role !== "admin") {
      alert("You don’t have permission to add licenses.");
      window.location.href = "dashboard.html";
    }

    // Restrict dashboard.html to authenticated users
    if (currentPage === "dashboard.html" && role === "none") {
      alert("Unauthorized access.");
      window.location.href = "index.html";
    }
  }
});

// === License Management ===
function addLicense() {
  const licenseNumber = sanitize(document.getElementById("licenseNumber").value);
  const fullName = sanitize(document.getElementById("fullName").value);
  const licenseClass = sanitize(document.getElementById("licenseClass").value);
  const issueDate = sanitize(document.getElementById("issueDate").value);
  const expiryDate = sanitize(document.getElementById("expiryDate").value);

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
      createdBy: auth.currentUser ? auth.currentUser.uid : null
    });
  })
  .then(() => {
    showAlert("License added successfully!", "success");
    document.getElementById("addLicenseForm").reset();
  })
  .catch(error => showAlert("Error adding license: " + error.message, "error"));
}

// === Dashboard ===
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

// === Verification ===
function verifyLicense() {
  const licenseNumber = sanitize(document.getElementById("verifyLicenseNumber").value);
  const requestingOrg = sanitize(document.getElementById("requestingOrg")?.value);
  const country = sanitize(document.getElementById("country")?.value);
  const email = sanitize(document.getElementById("email")?.value);
  const purpose = sanitize(document.getElementById("purpose")?.value);

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

      db.collection("verifications").add({
        licenseNumber,
        requestingOrg,
        country,
        email,
        purpose,
        result: doc.exists ? "License found" : "License not found",
        verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
        requestedBy: auth.currentUser ? auth.currentUser.uid : "external"
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
