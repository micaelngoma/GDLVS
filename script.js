// === Firebase Config ===
var firebaseConfig = {
  apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.appspot.com",
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// === Admin Emails ===
const ADMIN_EMAILS = ["m.ngoma1988@gmail.com", "ngomamicaelc@gmail.com"];

// === Multilingual Resources ===
const resources = {
  en: {
    translation: {
      "title": "Gabon License Verifier",
      "login": "Login",
      "logout": "Logout",
      "email": "Email",
      "password": "Password",
      "dashboard": "Dashboard",
      "addLicense": "Add License",
      "licenseManagement": "License Management",
      "verificationPortal": "Verification Portal",
      "analytics": "Analytics",
      "logs": "Logs",
      "backups": "Backups",
      "backupLogs": "Backup Logs",
      "licenseNumber": "License Number",
      "fullName": "Full Name",
      "class": "Class",
      "issueDate": "Issue Date",
      "expiryDate": "Expiry Date",
      "status": "Status",
      "recentVerifications": "Recent Verification Requests"
    }
  },
  fr: {
    translation: {
      "title": "Vérificateur de Permis du Gabon",
      "login": "Connexion",
      "logout": "Déconnexion",
      "email": "E-mail",
      "password": "Mot de passe",
      "dashboard": "Tableau de Bord",
      "addLicense": "Ajouter un Permis",
      "licenseManagement": "Gestion des Permis",
      "verificationPortal": "Portail de Vérification",
      "analytics": "Analytique",
      "logs": "Journaux",
      "backups": "Sauvegardes",
      "backupLogs": "Journaux de Sauvegarde",
      "licenseNumber": "Numéro de Permis",
      "fullName": "Nom Complet",
      "class": "Classe",
      "issueDate": "Date d'Émission",
      "expiryDate": "Date d'Expiration",
      "status": "Statut",
      "recentVerifications": "Vérifications Récentes"
    }
  },
  ja: {
    translation: {
      "title": "ガボン運転免許確認システム",
      "login": "ログイン",
      "logout": "ログアウト",
      "email": "メールアドレス",
      "password": "パスワード",
      "dashboard": "ダッシュボード",
      "addLicense": "免許を追加",
      "licenseManagement": "免許管理",
      "verificationPortal": "確認ポータル",
      "analytics": "分析",
      "logs": "ログ",
      "backups": "バックアップ",
      "backupLogs": "バックアップログ",
      "licenseNumber": "免許番号",
      "fullName": "氏名",
      "class": "区分",
      "issueDate": "発行日",
      "expiryDate": "有効期限",
      "status": "状態",
      "recentVerifications": "最近の確認"
    }
  }
};

// === Initialize i18next ===
i18next.use(i18nextBrowserLanguageDetector).init({
  resources,
  fallbackLng: "en",
  debug: false
}, function () {
  jqueryI18next.init(i18next, $, { useOptionsAttr: true });
  $("body").localize();
});

// === Language Switcher ===
document.addEventListener("DOMContentLoaded", () => {
  const switcher = document.getElementById("languageSwitcher");
  if (switcher) {
    switcher.addEventListener("change", function () {
      i18next.changeLanguage(this.value, () => $("body").localize());
    });
  }
});

// === Alerts ===
function showAlert(message, type = "error") {
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert " + (type === "success" ? "success" : "error");
  alertDiv.innerText = message;
  document.body.prepend(alertDiv);
  setTimeout(() => alertDiv.remove(), 4000);
}

// === Auth Functions ===
function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showAlert("Enter email and password", "error");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(error => showAlert(error.message, "error"));
}

function signOutUser() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// === Restrict Pages ===
auth.onAuthStateChanged(user => {
  const currentPage = window.location.pathname.split("/").pop();
  const protectedPages = ["dashboard.html", "add_license.html", "analytics.html", "logs.html", "backups.html", "backupLogs.html"];

  if (!user && protectedPages.includes(currentPage)) {
    window.location.href = "index.html";
  }

  if (user) {
    const emailField = document.getElementById("dbUserEmail");
    if (emailField) emailField.textContent = user.email;

    if (currentPage === "add_license.html" && !ADMIN_EMAILS.includes(user.email)) {
      alert("Only admins can access license management.");
      window.location.href = "dashboard.html";
    }
  }
});

// === Dashboard Stats ===
function loadDashboardStats() {
  db.collection("licenses").get().then(snapshot => {
    document.getElementById("totalLicenses").innerText = snapshot.size;
    let activeCount = 0;
    snapshot.forEach(doc => { if (doc.data().status === "Active") activeCount++; });
    document.getElementById("activeLicenses").innerText = activeCount;
  });

  const today = new Date().toISOString().split("T")[0];
  db.collection("verifications").where("date", "==", today).get().then(snapshot => {
    document.getElementById("todaysVerifications").innerText = snapshot.size;
  });

  db.collection("verifications").get().then(snapshot => {
    let found = 0;
    snapshot.forEach(doc => { if (doc.data().result === "License found") found++; });
    const rate = snapshot.size > 0 ? ((found / snapshot.size) * 100).toFixed(1) : 0;
    document.getElementById("successRate").innerText = rate + "%";
  });
}

// === Add License ===
function addLicense() {
  const licenseNumber = document.getElementById("licenseNumber").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const licenseClass = document.getElementById("licenseClass").value;
  const issueDate = document.getElementById("issueDate").value;
  const expiryDate = document.getElementById("expiryDate").value;

  if (!licenseNumber || !fullName || !licenseClass || !issueDate || !expiryDate) {
    showAlert("Fill all fields", "error");
    return;
  }

  const ref = db.collection("licenses").doc(licenseNumber);
  ref.get().then(docSnap => {
    if (docSnap.exists) {
      showAlert("License already exists!", "error");
      return;
    }
    return ref.set({
      licenseNumber, fullName, class: licenseClass, status: "Active",
      issueDate, expiryDate,
      addedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.currentUser ? auth.currentUser.email : null
    });
  })
    .then(() => {
      showAlert("License added successfully!", "success");
      document.getElementById("addLicenseForm").reset();
    })
    .catch(error => showAlert("Error: " + error.message, "error"));
}

// === License Search ===
function searchLicenses() {
  const query = document.getElementById("searchBox").value.toLowerCase();
  const rows = document.querySelectorAll("#licenseTable tr");
  rows.forEach(r => {
    const text = r.textContent.toLowerCase();
    r.style.display = text.includes(query) ? "" : "none";
  });
}

// === Verification ===
function verifyLicense() {
  const licenseNumber = document.getElementById("verifyLicenseNumber").value.trim();
  const requestingOrg = document.getElementById("requestingOrg")?.value.trim();
  const country = document.getElementById("country")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const purpose = document.getElementById("purpose")?.value.trim();

  if (!licenseNumber) {
    showAlert("Enter license number", "error");
    return;
  }

  db.collection("licenses").doc(licenseNumber).get()
    .then(doc => {
      const resultDiv = document.getElementById("verificationResult");
      let resultText = "";
      let resultValue = "License not found";

      if (!doc.exists) {
        resultText = "<p>❌ License not found</p>";
      } else {
        const data = doc.data();
        resultText = `
          <p><strong>Name:</strong> ${data.fullName}</p>
          <p><strong>Class:</strong> ${data.class}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          <p><strong>Expiry:</strong> ${data.expiryDate}</p>`;
        resultValue = "License found";
      }
      resultDiv.innerHTML = resultText;

      db.collection("verifications").add({
        licenseNumber, requestingOrg, country, email, purpose,
        result: resultValue,
        date: new Date().toISOString().split("T")[0],
        verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .catch(error => showAlert("Error: " + error.message, "error"));
}

// === Page Hooks ===
window.onload = function () {
  const page = window.location.pathname.split("/").pop();
  if (page === "dashboard.html") {
    loadDashboardStats();
  }
};
