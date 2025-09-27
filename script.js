// === Firebase Setup ===
const firebaseConfig = {
  apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.appspot.com",   // ✅ FIXED
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// === i18n init (keep translations as before) ===
const resources = { /* translations here */ };
i18next.use(i18nextBrowserLanguageDetector).init(
  { resources, fallbackLng: "en" },
  function () {
    jqueryI18next.init(i18next, $, { useOptionsAttr: true });
    $("body").localize();
  }
);

document.addEventListener("DOMContentLoaded", () => {
  const switcher = document.getElementById("languageSwitcher");
  if (switcher) {
    switcher.addEventListener("change", function () {
      i18next.changeLanguage(this.value, () => $("body").localize());
    });
  }
});

// === Utility: Message Alerts ===
function showMsg(text, ok = false) {
  const el = document.getElementById("msg");
  if (el) {
    el.textContent = text;
    el.style.color = ok ? "green" : "red";
  } else {
    alert(text);
  }
}

// === Authentication ===
function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(async (cred) => {
      const token = await cred.user.getIdTokenResult();
      const role = token.claims.role || "verifier";

      console.log("Logged in as:", cred.user.email, "with role:", role);

      if (role === "admin") {
        showMsg("✅ Login successful, redirecting to Dashboard...", true);
        window.location.href = "dashboard.html";
      } else {
        showMsg("✅ Login successful, redirecting to Verification Portal...", true);
        window.location.href = "verify.html";
      }
    })
    .catch(err => {
      let msg;
      switch (err.code) {
        case "auth/invalid-email":
          msg = "⚠️ Please enter a valid email address.";
          break;
        case "auth/user-disabled":
          msg = "⚠️ This account has been disabled. Contact support.";
          break;
        case "auth/user-not-found":
          msg = "❌ No account found with this email.";
          break;
        case "auth/wrong-password":
          msg = "❌ Incorrect password. Please try again.";
          break;
        default:
          msg = "❌ Login failed. Please check your credentials.";
      }
      showMsg(msg);
      console.error("Login error:", err.code, err.message);
    });
}

function signOutUser() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// === Role-based Access Control ===
auth.onAuthStateChanged(async (user) => {
  const currentPage = window.location.pathname.split("/").pop();
  const adminPages = ["dashboard.html", "add_licenses.html", "analytics.html", "users.html"];

  if (!user) {
    if (adminPages.includes(currentPage)) {
      window.location.href = "index.html";
    }
    return;
  }

  const token = await user.getIdTokenResult();
  const role = token.claims.role || "verifier";

  console.log("AuthStateChanged →", user.email, "role:", role);

  if (role === "admin") {
    if (currentPage === "dashboard.html") loadDashboardData?.();
    if (currentPage === "analytics.html") loadAnalyticsData?.();
    if (currentPage === "users.html") loadUsersData?.();
  } else {
    if (adminPages.includes(currentPage)) {
      window.location.href = "verify.html";
    }
  }
});

// === License Management ===
function addLicense() {
  const licenseNumber = document.getElementById("licenseNumber").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const licenseClass = document.getElementById("licenseClass").value;
  const issueDate = document.getElementById("issueDate").value;
  const expiryDate = document.getElementById("expiryDate").value;

  if (!licenseNumber || !fullName || !licenseClass || !issueDate || !expiryDate) {
    showMsg("⚠️ All fields are required");
    return;
  }

  db.collection("licenses").doc(licenseNumber).set({
    licenseNumber,
    fullName,
    class: licenseClass,
    issueDate,
    expiryDate,
    status: "Active",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    createdBy: auth.currentUser ? auth.currentUser.uid : null
  })
  .then(() => {
    showMsg("✅ License added successfully!", true);
    document.getElementById("addLicenseForm").reset();
  })
  .catch(err => {
    if (err.code === "permission-denied") {
      showMsg("❌ Permission denied. Only ADMIN can add licenses.");
    } else {
      showMsg(`❌ Error adding license: ${err.message}`);
    }
    console.error("Add license error:", err);
  });
}

// === License Verification ===
function verifyLicense() {
  const number = document.getElementById("verifyLicenseNumber").value.trim();
  const org = document.getElementById("requestingOrg")?.value.trim();
  const country = document.getElementById("country")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const purpose = document.getElementById("purpose")?.value.trim();

  if (!number) {
    showMsg("⚠️ Please enter a license number");
    return;
  }

  db.collection("licenses").doc(number).get()
    .then(doc => {
      const div = document.getElementById("verificationResult");
      if (!div) return;

      if (!doc.exists) {
        div.innerHTML = "<p style='color:red;'>❌ License not found</p>";
      } else {
        const d = doc.data();
        div.innerHTML = `
          <p><b>Name:</b> ${d.fullName}</p>
          <p><b>Class:</b> ${d.class}</p>
          <p><b>Status:</b> ${d.status}</p>
          <p><b>Issue Date:</b> ${d.issueDate}</p>
          <p><b>Expiry Date:</b> ${d.expiryDate}</p>`;
      }

      // log verification
      db.collection("verifications").add({
        licenseNumber: number,
        requestingOrg: org || "",
        country: country || "",
        email: email || "",
        purpose: purpose || "",
        result: doc.exists ? "License found" : "Not found",
        verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
        verifiedBy: auth.currentUser ? auth.currentUser.uid : "anonymous"
      }).catch(err => console.error("Log verification error:", err));
    })
    .catch(err => {
      showMsg(`❌ Error verifying license: ${err.message}`);
      console.error("Verify license error:", err);
    });
}

// === Dashboard Data ===
async function loadDashboardData() {
  try {
    const snapshot = await db.collection("licenses").get();
    let total = 0, active = 0;

    snapshot.forEach(doc => {
      total++;
      if (doc.data().status === "Active") active++;
    });

    document.getElementById("totalLicenses").innerText = total;
    document.getElementById("activeLicenses").innerText = active;
  } catch (err) {
    console.error("Dashboard load error:", err);
    showMsg("❌ Failed to load dashboard data");
  }
}

// === Analytics Data ===
async function loadAnalyticsData() {
  try {
    const snapshot = await db.collection("verifications")
      .orderBy("verifiedAt", "desc")
      .limit(10)
      .get();

    let total = 0, success = 0, fail = 0;
    const tbody = document.getElementById("verificationLogs");
    if (!tbody) return;
    tbody.innerHTML = "";

    snapshot.forEach(doc => {
      const d = doc.data();
      total++;
      if (d.result === "License found") success++; else fail++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.licenseNumber}</td>
        <td>${d.requestingOrg || ""}</td>
        <td>${d.country || ""}</td>
        <td>${d.result}</td>
        <td>${d.verifiedAt ? d.verifiedAt.toDate().toLocaleString() : ""}</td>`;
      tbody.appendChild(tr);
    });

    document.getElementById("totalVerifications").innerText = total;
    document.getElementById("successfulVerifications").innerText = success;
    document.getElementById("failedVerifications").innerText = fail;
  } catch (err) {
    console.error("Analytics load error:", err);
    showMsg("❌ Failed to load analytics");
  }
}

// === User Management ===
async function loadUsersData() {
  try {
    const snapshot = await db.collection("roles").get();
    const tbody = document.getElementById("usersTable");
    if (!tbody) return;
    tbody.innerHTML = "";

    snapshot.forEach(doc => {
      const d = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.email}</td>
        <td>${d.role}</td>
        <td>
          <button onclick="promoteUser('${doc.id}')">Promote</button>
          <button onclick="demoteUser('${doc.id}')">Demote</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("User load error:", err);
    showMsg("❌ Failed to load users");
  }
}

// === Placeholder Promote/Demote ===
function promoteUser(uid) {
  showMsg(`⚠️ Promote function not yet implemented for ${uid}`);
}
function demoteUser(uid) {
  showMsg(`⚠️ Demote function not yet implemented for ${uid}`);
}

// === Expose globally ===
window.loginUser = loginUser;
window.signOutUser = signOutUser;
window.addLicense = addLicense;
window.verifyLicense = verifyLicense;
window.loadDashboardData = loadDashboardData;
window.loadAnalyticsData = loadAnalyticsData;
window.loadUsersData = loadUsersData;
