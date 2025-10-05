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
const resources = {
  en: { translation: {
    login: "Login", logout: "Logout", signUp: "Sign Up",
    dashboard: "Dashboard", addLicense: "Add License",
    verificationPortal: "Verification", analytics: "Analytics",
    userManagement: "User Management", verificationRequests: "Verification Requests",
    totalLicenses: "Total Licenses", activeLicenses: "Active Licenses",
    licensesList: "Licenses", licenseNumber: "License Number",
    fullName: "Full Name", class: "Class",
    issueDate: "Issue Date", expiryDate: "Expiry Date",
    status: "Status", action: "Action", email: "Email", role: "Role",
    verify: "Verify", approvalNotice: "Note: Your account must be approved by an administrator before you can use the verification system.",
    organization: "Organization", country: "Country", purpose: "Purpose"
  }},
  fr: { translation: {
    login: "Connexion", logout: "Déconnexion", signUp: "Créer un compte",
    dashboard: "Tableau de bord", addLicense: "Ajouter un permis",
    verificationPortal: "Vérification", analytics: "Analytique",
    userManagement: "Gestion des utilisateurs", verificationRequests: "Demandes de vérification",
    totalLicenses: "Nombre total de permis", activeLicenses: "Permis actifs",
    licensesList: "Permis", licenseNumber: "Numéro de permis",
    fullName: "Nom complet", class: "Catégorie",
    issueDate: "Date d’émission", expiryDate: "Date d’expiration",
    status: "Statut", action: "Action", email: "Email", role: "Rôle",
    verify: "Vérifier", approvalNotice: "Remarque : votre compte doit être approuvé par un administrateur avant utilisation.",
    organization: "Organisation", country: "Pays", purpose: "But"
  }},
  ja: { translation: {
    login: "ログイン", logout: "ログアウト", signUp: "サインアップ",
    dashboard: "ダッシュボード", addLicense: "免許を追加",
    verificationPortal: "照合", analytics: "分析",
    userManagement: "ユーザー管理", verificationRequests: "照合リクエスト",
    totalLicenses: "総免許数", activeLicenses: "有効な免許",
    licensesList: "免許一覧", licenseNumber: "免許番号",
    fullName: "氏名", class: "区分",
    issueDate: "発行日", expiryDate: "有効期限",
    status: "ステータス", action: "操作", email: "メール", role: "ロール",
    verify: "照合", approvalNotice: "注意：アカウントは管理者の承認後に利用できます。",
    organization: "機関", country: "国", purpose: "目的"
  }}
};

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
async function loginUser(e) {
  if (e) e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);

    if (!cred.user.emailVerified) {
      showMsg("⚠️ Please verify your email before logging in. Verification link resent.");
      await cred.user.sendEmailVerification();
      await auth.signOut();
      return;
    }

    const userDoc = await db.collection("users").doc(email).get();
    const status = userDoc.exists ? userDoc.data().status : "pending";
    const roleDoc = await db.collection("roles").doc(email).get();
    const role = roleDoc.exists ? roleDoc.data().role : "verifier";

    if (status !== "approved") {
      showMsg("⏳ Your account is not approved yet. Please wait for administrator approval.");
      await auth.signOut();
      return;
    }

    if (role === "admin") {
      showMsg("✅ Welcome Admin! Redirecting...", true);
      setTimeout(() => (window.location.href = "dashboard.html"), 1000);
    } else {
      showMsg("✅ Login successful. Redirecting...", true);
      setTimeout(() => (window.location.href = "verify.html"), 1000);
    }
  } catch (err) {
    showMsg("❌ Login failed: " + err.message);
    console.error("Login error:", err);
  }
}

// === Logout ===
function signOutUser() {
  auth.signOut().then(() => (window.location.href = "index.html"));
}

// === Signup: New User ===
async function signupUser(e) {
  e.preventDefault();
  const fullName = document.getElementById("signupFullName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection("roles").doc(email).set({ email, role: "verifier" });
    await db.collection("users").doc(email).set({
      email, fullName, role: "verifier", status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await cred.user.updateProfile({ displayName: fullName });
    await cred.user.sendEmailVerification();

    showMsg("✅ Account created! Verify email. Your account must be approved by an administrator.", true);
    await auth.signOut();
    setTimeout(() => (window.location.href = "index.html"), 3000);
  } catch (err) {
    console.error("Signup error:", err);
    showMsg("❌ Signup failed: " + err.message);
  }
}

// === Role-based Access Control ===
auth.onAuthStateChanged(async (user) => {
  const currentPage = window.location.pathname.split("/").pop();
  const adminPages = ["dashboard.html", "add_licenses.html", "analytics.html", "users.html", "verification_requests.html"];

  if (!user) {
    if (adminPages.includes(currentPage)) window.location.href = "index.html";
    return;
  }
  if (!user.emailVerified) {
    showMsg("⚠️ Please verify your email before using the platform.");
    await auth.signOut();
    return;
  }

  const userDoc = await db.collection("users").doc(user.email).get();
  const status = userDoc.exists ? userDoc.data().status : "pending";
  const roleDoc = await db.collection("roles").doc(user.email).get();
  const role = roleDoc.exists ? roleDoc.data().role : "verifier";

  if (status !== "approved") {
    showMsg("⏳ Your account is not approved yet.");
    await auth.signOut();
    return;
  }

  const navRequests = document.getElementById("navVerificationRequests");
  if (navRequests) navRequests.style.display = (role === "admin") ? "block" : "none";

  if (role === "admin") {
    if (currentPage === "dashboard.html") { loadDashboardData?.(); loadLicensesTable?.(); }
    if (currentPage === "analytics.html") loadAnalyticsData?.();
    if (currentPage === "users.html") loadUsersData?.();
    if (currentPage === "verification_requests.html") loadVerificationRequests?.();
  } else {
    if (adminPages.includes(currentPage)) window.location.href = "verify.html";
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
    showMsg("⚠️ All fields are required"); return;
  }
  db.collection("licenses").doc(licenseNumber).set({
    licenseNumber, fullName, class: licenseClass,
    issueDate, expiryDate, status: "Active",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    createdBy: auth.currentUser ? auth.currentUser.uid : null
  })
  .then(() => { showMsg("✅ License added!", true); document.getElementById("addLicenseForm").reset(); })
  .catch(err => { showMsg("❌ Error adding license: " + err.message); });
}

// === Dashboard Data ===
async function loadDashboardData() {
  try {
    const snapshot = await db.collection("licenses").get();
    let total = 0, active = 0;
    snapshot.forEach(doc => { total++; if (doc.data().status === "Active") active++; });
    document.getElementById("totalLicenses").innerText = total;
    document.getElementById("activeLicenses").innerText = active;
  } catch (err) { console.error("Dashboard load error:", err); }
}

// === License Table (Admin Inline Edit) ===
async function loadLicensesTable() {
  const tbody = document.querySelector("#licensesTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";
  try {
    const snap = await db.collection("licenses").orderBy("licenseNumber").get();
    tbody.innerHTML = "";
    if (snap.empty) { tbody.innerHTML = "<tr><td colspan='7'>No licenses</td></tr>"; return; }
    snap.forEach(doc => {
      const d = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.licenseNumber}</td>
        <td contenteditable="true" data-field="fullName">${d.fullName || ""}</td>
        <td>
          <select data-field="class">
            <option ${d.class==="Class A"?"selected":""}>Class A</option>
            <option ${d.class==="Class B"?"selected":""}>Class B</option>
            <option ${d.class==="Class C"?"selected":""}>Class C</option>
          </select>
        </td>
        <td><input type="date" data-field="issueDate" value="${d.issueDate || ""}"></td>
        <td><input type="date" data-field="expiryDate" value="${d.expiryDate || ""}"></td>
        <td>
          <select data-field="status">
            <option ${d.status==="Active"?"selected":""}>Active</option>
            <option ${d.status==="Suspended"?"selected":""}>Suspended</option>
            <option ${d.status==="Expired"?"selected":""}>Expired</option>
          </select>
        </td>
        <td><button class="inline" onclick="saveLicenseRow('${d.licenseNumber}', this)">Save</button></td>`;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error("loadLicensesTable error:", err); }
}
async function saveLicenseRow(licenseNumber, btn) {
  try {
    const tr = btn.closest("tr");
    const payload = {};
    tr.querySelectorAll("[data-field]").forEach(el => {
      const key = el.getAttribute("data-field");
      payload[key] = (el.tagName === "TD") ? el.textContent.trim() : el.value;
    });
    await db.collection("licenses").doc(licenseNumber).update(payload);
    showMsg("✅ License updated", true);
  } catch (err) { console.error("saveLicenseRow error:", err); }
}

// === Verify License (Instant Result) ===
async function verifyLicense(e) {
  if (e) e.preventDefault();

  const licenseNumber = document.getElementById("verifyLicenseNumber").value.trim();
  const requestingOrg = document.getElementById("verifyOrg")?.value.trim() || "";
  const country = document.getElementById("verifyCountry")?.value.trim() || "";
  const purpose = document.getElementById("verifyPurpose")?.value.trim() || "";
  const resultEl = document.getElementById("verifyResult");

  if (!licenseNumber) { showMsg("⚠️ License number required"); return; }

  try {
    // lookup license doc
    const docRef = await db.collection("licenses").doc(licenseNumber).get();
    const found = docRef.exists;
    const resultText = found ? "License found" : "License not found";

    // Save verification request for analytics / admin
    await db.collection("verifications").add({
      licenseNumber,
      requestingOrg,
      country,
      email: auth.currentUser?.email || "",
      purpose,
      result: resultText,
      verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      verifiedBy: auth.currentUser?.uid || ""
    });

    // Build details display
    let detailsHtml = `<h3>${resultText}</h3>
      <p><strong>License #:</strong> ${licenseNumber}</p>`;

    if (found) {
      const d = docRef.data() || {};
      // Show license fields if present in DB
      detailsHtml += `
        <p><strong>Full name:</strong> ${d.fullName || "—"}</p>
        <p><strong>Class:</strong> ${d.class || "—"}</p>
        <p><strong>Issue date:</strong> ${d.issueDate || "—"}</p>
        <p><strong>Expiry date:</strong> ${d.expiryDate || "—"}</p>
        <p><strong>Status:</strong> ${d.status || "—"}</p>`;
    }

    // Show requesting details (even if license not found)
    detailsHtml += `
      <hr>
      <p><strong>Requesting organization:</strong> ${requestingOrg || "—"}</p>
      <p><strong>Country:</strong> ${country || "—"}</p>
      <p><strong>Purpose:</strong> ${purpose || "—"}</p>`;

    // Add a Verify Next button so user can immediately verify another license
    detailsHtml += `
      <div style="margin-top:16px;">
        <button id="verifyNextBtn" class="inline" type="button"><i class="fas fa-plus"></i> Verify Next</button>
      </div>`;

    // Display
    if (resultEl) {
      resultEl.style.display = "block";
      resultEl.innerHTML = detailsHtml;
      resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    showMsg(`✅ ${resultText}`, true);

    // Attach handler to Verify Next
    setTimeout(() => {
      const btn = document.getElementById("verifyNextBtn");
      if (btn) {
        btn.addEventListener("click", () => {
          // Reset form fields but keep language or other UI intact
          const form = document.getElementById("verifyForm");
          if (form) form.reset();

          // Hide result panel
          if (resultEl) {
            resultEl.style.display = "none";
            resultEl.innerHTML = "";
          }

          // focus license input for quicker next verification
          const input = document.getElementById("verifyLicenseNumber");
          if (input) {
            input.focus();
            // small UX: select text so user can type new quickly (if browser supports)
            input.select && input.select();
          }
        }, { once: true });
      }
    }, 50);

  } catch (err) {
    console.error("verifyLicense error:", err);
    showMsg("❌ Error verifying license: " + err.message);
  }
}


// === Export CSV with Date ===
function exportTableToCSV(tableId, baseFilename) {
  const table = document.getElementById(tableId);
  if (!table) return;

  let csv = [];
  const rows = table.querySelectorAll("tr");
  rows.forEach(row => {
    let cols = row.querySelectorAll("th, td");
    let rowData = [];
    cols.forEach(col => rowData.push(`"${col.innerText}"`));
    csv.push(rowData.join(","));
  });

  const today = new Date().toISOString().split("T")[0];
  const filename = `${baseFilename}_${today}.csv`;

  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// === Expose globally ===
window.loginUser = loginUser;
window.signupUser = signupUser;
window.signOutUser = signOutUser;
window.addLicense = addLicense;
window.loadDashboardData = loadDashboardData;
window.loadLicensesTable = loadLicensesTable;
window.saveLicenseRow = saveLicenseRow;
window.verifyLicense = verifyLicense;
window.loadAnalyticsData = loadAnalyticsData;
window.loadVerificationRequests = loadVerificationRequests;
window.loadUsersData = loadUsersData;
window.addNewUser = addNewUser;
window.updateUserRow = updateUserRow;
window.deleteUser = deleteUser;
window.filterUsers = filterUsers;
window.filterLicenses = filterLicenses;
window.filterRequests = filterRequests;
window.filterAnalytics = filterAnalytics;
window.exportTableToCSV = exportTableToCSV;
