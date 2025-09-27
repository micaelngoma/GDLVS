// === Firebase Setup ===
const firebaseConfig = {
  apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.appspot.com",
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// === i18n init ===
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

// === Authentication: Login ===
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

// === Signup: New User ===
async function signupUser(e) {
  e.preventDefault();

  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);

    // Save default role (verifier) in Firestore
    await db.collection("roles").doc(email).set({
      email,
      role: "verifier"
    });

    alert("✅ Account created! You can now log in.");
    window.location.href = "index.html";
  } catch (err) {
    console.error("Signup error:", err);
    alert("❌ Signup failed: " + err.message);
  }
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

    if (snapshot.empty) {
      tbody.innerHTML = `<tr><td colspan="3">No users found</td></tr>`;
      return;
    }

    snapshot.forEach(doc => {
      const d = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.email || doc.id}</td>
        <td>${d.role || "verifier"}</td>
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

async function promoteUser(uid) {
  try {
    await db.collection("roles").doc(uid).update({ role: "admin" });
    showMsg("✅ User promoted to admin", true);
    loadUsersData();
  } catch (err) {
    console.error("Promote error:", err);
    showMsg("❌ Failed to promote user");
  }
}

async function demoteUser(uid) {
  try {
    await db.collection("roles").doc(uid).update({ role: "verifier" });
    showMsg("✅ User demoted to verifier", true);
    loadUsersData();
  } catch (err) {
    console.error("Demote error:", err);
    showMsg("❌ Failed to demote user");
  }
}

// === Expose globally ===
window.loginUser = loginUser;
window.signupUser = signupUser;
window.signOutUser = signOutUser;
window.addLicense = addLicense;
window.loadDashboardData = loadDashboardData;
window.loadAnalyticsData = loadAnalyticsData;
window.loadUsersData = loadUsersData;
window.promoteUser = promoteUser;
window.demoteUser = demoteUser;
