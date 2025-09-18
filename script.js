// === Firebase Setup (GDLVS) ===
var firebaseConfig = {
  apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.appspot.com",
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// === i18n Translations (EN, FR, JA) ===
const resources = {
  en: {
    translation: {
      "login": "Login",
      "logout": "Logout",
      "signup": "Sign Up",
      "dashboard": "Dashboard",
      "addLicense": "Add License",
      "verificationPortal": "Verification Portal",
      "analytics": "Analytics",
      "userManagement": "User Management",
      "licenseNumber": "License Number",
      "fullName": "Full Name",
      "class": "Class",
      "issueDate": "Issue Date",
      "expiryDate": "Expiry Date",
      "totalLicenses": "Total Licenses",
      "activeLicenses": "Active Licenses",
      "organization": "Requesting Organization",
      "country": "Country",
      "purpose": "Purpose of Verification",
      "verify": "Verify License",
      "totalVerifications": "Total Verifications",
      "successfulVerifications": "Successful",
      "failedVerifications": "Failed",
      "recentVerifications": "Recent Verifications",
      "userManagementDesc": "Admins can view and update user roles",
      "email": "Email",
      "role": "Role",
      "actions": "Actions",
      "result": "Result",
      "date": "Date"
    }
  },
  fr: {
    translation: {
      "login": "Connexion",
      "logout": "Déconnexion",
      "signup": "Créer un Compte",
      "dashboard": "Tableau de bord",
      "addLicense": "Ajouter un permis",
      "verificationPortal": "Portail de vérification",
      "analytics": "Analytique",
      "userManagement": "Gestion des utilisateurs",
      "licenseNumber": "Numéro de permis",
      "fullName": "Nom complet",
      "class": "Classe",
      "issueDate": "Date d’émission",
      "expiryDate": "Date d’expiration",
      "totalLicenses": "Nombre total de permis",
      "activeLicenses": "Permis actifs",
      "organization": "Organisation requérante",
      "country": "Pays",
      "purpose": "But de la vérification",
      "verify": "Vérifier le permis",
      "totalVerifications": "Nombre total de vérifications",
      "successfulVerifications": "Réussies",
      "failedVerifications": "Échouées",
      "recentVerifications": "Vérifications récentes",
      "userManagementDesc": "Les administrateurs peuvent consulter et mettre à jour les rôles",
      "email": "E-mail",
      "role": "Rôle",
      "actions": "Actions",
      "result": "Résultat",
      "date": "Date"
    }
  },
  ja: {
    translation: {
      "login": "ログイン",
      "logout": "ログアウト",
      "signup": "新規登録",
      "dashboard": "ダッシュボード",
      "addLicense": "免許を追加",
      "verificationPortal": "確認ポータル",
      "analytics": "分析",
      "userManagement": "ユーザー管理",
      "licenseNumber": "免許番号",
      "fullName": "氏名",
      "class": "クラス",
      "issueDate": "発行日",
      "expiryDate": "有効期限",
      "totalLicenses": "総免許数",
      "activeLicenses": "有効免許",
      "organization": "申請組織",
      "country": "国",
      "purpose": "確認の目的",
      "verify": "免許を確認する",
      "totalVerifications": "総確認数",
      "successfulVerifications": "成功",
      "failedVerifications": "失敗",
      "recentVerifications": "最近の確認",
      "userManagementDesc": "管理者はユーザーの役割を表示および更新できます",
      "email": "メール",
      "role": "役割",
      "actions": "操作",
      "result": "結果",
      "date": "日付"
    }
  }
};

// === Init i18n ===
i18next.use(i18nextBrowserLanguageDetector).init({
  resources,
  fallbackLng: "en",
  debug: false
}, function() {
  jqueryI18next.init(i18next, $, { useOptionsAttr: true });
  $("body").localize();
});

// === Language Switcher ===
document.addEventListener("DOMContentLoaded", () => {
  const switcher = document.getElementById("languageSwitcher");
  if (switcher) {
    switcher.addEventListener("change", function() {
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
  }
}

// === Authentication ===
function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => showMsg("Login successful, redirecting...", true))
    .catch(err => showMsg(err.message));
}

function signUpUser() {
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => showMsg("Account created. Awaiting role assignment.", true))
    .catch(err => showMsg(err.message));
}

function signOutUser() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// === Role-based Page Access ===
auth.onAuthStateChanged(async (user) => {
  const currentPage = window.location.pathname.split("/").pop();
  const adminPages = ["dashboard.html", "add_license.html", "analytics.html", "users.html"];

  if (!user) {
    if (adminPages.includes(currentPage)) {
      window.location.href = "index.html";
    }
    return;
  }

  const token = await user.getIdTokenResult();
  const role = token.claims.role || "verifier"; // default = verifier

  if (role === "admin") {
    if (currentPage === "index.html") {
      window.location.href = "dashboard.html";
    }
    if (currentPage === "dashboard.html") {
      loadDashboardData();
    }
    if (currentPage === "analytics.html") {
      loadAnalyticsData();
    }
    if (currentPage === "users.html") {
      loadUsersData();
    }
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
    showMsg("All fields required");
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
  }).then(() => {
    showMsg("License added successfully!", true);
    document.getElementById("addLicenseForm").reset();
  }).catch(err => showMsg(err.message));
}

// === Dashboard Data ===
function loadDashboardData() {
  db.collection("licenses").get().then(snapshot => {
    document.getElementById("totalLicenses").innerText = snapshot.size;
    let active = 0;
    snapshot.forEach(doc => {
      if (doc.data().status === "Active") active++;
    });
    document.getElementById("activeLicenses").innerText = active;
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
    showMsg("Please enter a license number");
    return;
  }

  db.collection("licenses").doc(number).get().then(doc => {
    const div = document.getElementById("verificationResult");
    if (!div) return;

    if (!doc.exists) {
      div.innerHTML = "<p style='color:red;'>License not found</p>";
    } else {
      const d = doc.data();
      div.innerHTML = `
        <p><b>Name:</b> ${d.fullName}</p>
        <p><b>Class:</b> ${d.class}</p>
        <p><b>Status:</b> ${d.status}</p>
        <p><b>Issue Date:</b> ${d.issueDate}</p>
        <p><b>Expiry Date:</b> ${d.expiryDate}</p>`;
    }

    db.collection("verifications").add({
      licenseNumber: number,
      requestingOrg: org || "",
      country: country || "",
      email: email || "",
      purpose: purpose || "",
      result: doc.exists ? "License found" : "Not found",
      verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      verifiedBy: auth.currentUser ? auth.currentUser.uid : "anonymous"
    });
  });
}

// === Analytics Data ===
function loadAnalyticsData() {
  const logsRef = db.collection("verifications").orderBy("verifiedAt", "desc").limit(10);
  logsRef.get().then(snapshot => {
    let total = 0, success = 0, fail = 0;
    const tbody = document.getElementById("verificationLogs");
    tbody.innerHTML = "";

    snapshot.forEach(doc => {
      const d = doc.data();
      total++;
      if (d.result === "License found") success++; else fail++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.licenseNumber}</td>
        <td>${d.requestingOrg}</td>
        <td>${d.country}</td>
        <td>${d.result}</td>
        <td>${d.verifiedAt ? d.verifiedAt.toDate().toLocaleString() : ""}</td>`;
      tbody.appendChild(tr);
    });

    document.getElementById("totalVerifications").innerText = total;
    document.getElementById("successfulVerifications").innerText = success;
    document.getElementById("failedVerifications").innerText = fail;
  });
}

// === User Management (Placeholder) ===
// ⚠️ NOTE: For security, listing users requires Firebase Admin SDK via Cloud Function
// Here we just show a placeholder table
function loadUsersData() {
  const tbody = document.getElementById("usersTable");
  tbody.innerHTML = `
    <tr>
      <td>admin@example.com</td>
      <td>Admin</td>
      <td><button disabled>Promote</button> <button disabled>Demote</button></td>
    </tr>
    <tr>
      <td>verifier@example.com</td>
      <td>Verifier</td>
      <td><button disabled>Promote</button> <button disabled>Demote</button></td>
    </tr>
  `;
}

// === Expose functions globally ===
window.loginUser = loginUser;
window.signUpUser = signUpUser;
window.signOutUser = signOutUser;
window.addLicense = addLicense;
window.verifyLicense = verifyLicense;
