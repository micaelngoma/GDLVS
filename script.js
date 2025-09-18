// === Firebase setup ===
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

// === Approved Admin Emails ===
var ADMIN_EMAILS = ["m.ngoma1988@gmail.com", "ngomamicaelc@gmail.com"];

// === Translations ===
const resources = {
  en: {
    translation: {
      "title": "GDLVS",
      "login": "Login",
      "logout": "Logout",
      "email": "Email",
      "password": "Password",
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
      "verify": "Verify",
      "totalLicenses": "Total Licenses",
      "activeLicenses": "Active Licenses",
      "todayVerifications": "Today’s Verifications",
      "successRate": "Success Rate",
      "recentRequests": "Recent Verification Requests",
      "organization": "Organization",
      "country": "Country",
      "status": "Status",
      "date": "Date"
    }
  },
  fr: {
    translation: {
      "title": "Système GDLVS",
      "login": "Connexion",
      "logout": "Déconnexion",
      "email": "E-mail",
      "password": "Mot de passe",
      "dashboard": "Tableau de Bord",
      "addLicense": "Ajouter un Permis",
      "verificationPortal": "Portail de Vérification",
      "analytics": "Analytique",
      "userManagement": "Gestion des Utilisateurs",
      "licenseNumber": "Numéro de Permis",
      "fullName": "Nom Complet",
      "class": "Catégorie",
      "issueDate": "Date d’Émission",
      "expiryDate": "Date d’Expiration",
      "verify": "Vérifier",
      "totalLicenses": "Nombre Total",
      "activeLicenses": "Permis Actifs",
      "todayVerifications": "Vérifications Aujourd’hui",
      "successRate": "Taux de Succès",
      "recentRequests": "Requêtes Récentes",
      "organization": "Organisation",
      "country": "Pays",
      "status": "Statut",
      "date": "Date"
    }
  },
  ja: {
    translation: {
      "title": "ガボン免許検証システム",
      "login": "ログイン",
      "logout": "ログアウト",
      "email": "メール",
      "password": "パスワード",
      "dashboard": "ダッシュボード",
      "addLicense": "免許を追加",
      "verificationPortal": "検証ポータル",
      "analytics": "分析",
      "userManagement": "ユーザー管理",
      "licenseNumber": "免許番号",
      "fullName": "氏名",
      "class": "クラス",
      "issueDate": "発行日",
      "expiryDate": "有効期限",
      "verify": "確認する",
      "totalLicenses": "総免許数",
      "activeLicenses": "有効免許数",
      "todayVerifications": "本日の検証数",
      "successRate": "成功率",
      "recentRequests": "最近の検証",
      "organization": "組織",
      "country": "国",
      "status": "ステータス",
      "date": "日付"
    }
  }
};

// === Initialize i18next ===
i18next.use(i18nextBrowserLanguageDetector).init({
  resources,
  fallbackLng: "en",
  debug: false
}, function() {
  jqueryI18next.init(i18next, $, { useOptionsAttr: true });
  $("body").localize();
});

document.addEventListener("DOMContentLoaded", () => {
  const switcher = document.getElementById("languageSwitcher");
  if (switcher) {
    switcher.addEventListener("change", function() {
      i18next.changeLanguage(this.value, () => $("body").localize());
    });
  }
});

// === Utility Alert ===
function showAlert(message, type = "error") {
  const el = document.getElementById("msg") || document.createElement("div");
  el.className = "alert " + (type === "success" ? "success" : "error");
  el.textContent = message;
  document.body.prepend(el);
  setTimeout(() => el.remove(), 4000);
}

// === Authentication ===
function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) {
    showAlert("Enter email & password");
    return;
  }
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => showAlert(err.message));
}

function signOutUser() {
  auth.signOut()
    .then(() => window.location.href = "index.html")
    .catch(err => showAlert(err.message));
}

// Restrict protected pages
auth.onAuthStateChanged(user => {
  const page = window.location.pathname.split("/").pop();
  const protectedPages = ["dashboard.html", "add_license.html", "analytics.html", "user_management.html"];
  if (!user && protectedPages.includes(page)) {
    window.location.href = "index.html";
  }
  if (user && page === "add_license.html" && !ADMIN_EMAILS.includes(user.email)) {
    alert("You don’t have permission to add licenses.");
    window.location.href = "dashboard.html";
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
    showAlert("Please fill all fields");
    return;
  }

  const ref = db.collection("licenses").doc(licenseNumber);
  ref.get().then(docSnap => {
    if (docSnap.exists) {
      showAlert("License already exists!");
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
  }).then(() => {
    showAlert("License added successfully!", "success");
    document.getElementById("addLicenseForm").reset();
  }).catch(err => showAlert(err.message));
}

// === Verification ===
function verifyLicense() {
  const licenseNumber = document.getElementById("verifyLicenseNumber").value.trim();
  const requestingOrg = document.getElementById("requestingOrg").value.trim();
  const country = document.getElementById("country").value.trim();
  const email = document.getElementById("email").value.trim();
  const purpose = document.getElementById("purpose").value.trim();

  if (!licenseNumber) {
    showAlert("Enter a license number");
    return;
  }

  db.collection("licenses").doc(licenseNumber).get()
    .then(doc => {
      const resultDiv = document.getElementById("verificationResult");
      let html = "";
      if (!doc.exists) {
        html = "<p>License not found.</p>";
      } else {
        const data = doc.data();
        html = `
          <p><strong>Name:</strong> ${data.fullName}</p>
          <p><strong>Class:</strong> ${data.class}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          <p><strong>Issue Date:</strong> ${data.issueDate}</p>
          <p><strong>Expiry Date:</strong> ${data.expiryDate}</p>
        `;
      }
      resultDiv.innerHTML = html;

      // Log verification
      db.collection("verifications").add({
        licenseNumber,
        requestingOrg,
        country,
        email,
        purpose,
        result: doc.exists ? "Found" : "Not found",
        verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .catch(err => showAlert(err.message));
}

// === Dashboard Data ===
function loadDashboardData() {
  let todayCount = 0, successCount = 0;
  db.collection("licenses").get().then(snapshot => {
    const total = snapshot.size;
    let active = 0;
    snapshot.forEach(doc => {
      if (doc.data().status === "Active") active++;
    });
    document.getElementById("totalLicenses").innerText = total;
    document.getElementById("activeLicenses").innerText = active;
  });

  db.collection("verifications").orderBy("verifiedAt", "desc").limit(5).get().then(snapshot => {
    const tbody = document.querySelector("#recentRequestsTable tbody");
    tbody.innerHTML = "";
    snapshot.forEach(doc => {
      const d = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.licenseNumber}</td>
        <td>${d.requestingOrg || "-"}</td>
        <td>${d.country || "-"}</td>
        <td>${d.result}</td>
        <td>${d.verifiedAt?.toDate().toLocaleString() || ""}</td>
      `;
      tbody.appendChild(tr);
      if (d.result === "Found") successCount++;
      if (d.verifiedAt?.toDate().toDateString() === new Date().toDateString()) todayCount++;
    });
    document.getElementById("todayVerifications").innerText = todayCount;
    const rate = snapshot.size ? Math.round((successCount / snapshot.size) * 100) : 0;
    document.getElementById("successRate").innerText = rate + "%";

    drawStatusChart(successCount, snapshot.size - successCount);
  });
}

// === Chart.js ===
function drawStatusChart(success, failed) {
  const ctx = document.getElementById("statusChart");
  if (!ctx) return;
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Success", "Failed"],
      datasets: [{
        data: [success, failed],
        backgroundColor: ["#2ecc71", "#e74c3c"]
      }]
    }
  });
}

// === Analytics Page ===
function loadAnalytics() {
  db.collection("licenses").get().then(snapshot => {
    let classes = {};
    snapshot.forEach(doc => {
      const c = doc.data().class || "Unknown";
      classes[c] = (classes[c] || 0) + 1;
    });

    new Chart(document.getElementById("licenseClassChart"), {
      type: "bar",
      data: {
        labels: Object.keys(classes),
        datasets: [{
          label: "Licenses per Class",
          data: Object.values(classes),
          backgroundColor: "#3498db"
        }]
      }
    });
  });

  db.collection("verifications").get().then(snapshot => {
    let found = 0, notFound = 0;
    snapshot.forEach(doc => {
      if (doc.data().result === "Found") found++;
      else notFound++;
    });

    new Chart(document.getElementById("verificationResultsChart"), {
      type: "pie",
      data: {
        labels: ["Found", "Not Found"],
        datasets: [{
          data: [found, notFound],
          backgroundColor: ["#2ecc71", "#e74c3c"]
        }]
      }
    });
  });
}

// === Page Loader ===
window.onload = function() {
  const page = window.location.pathname.split("/").pop();
  if (page === "dashboard.html") loadDashboardData();
  if (page === "analytics.html") loadAnalytics();
};

// Expose globally
window.loginUser = loginUser;
window.signOutUser = signOutUser;
window.addLicense = addLicense;
window.verifyLicense = verifyLicense;
