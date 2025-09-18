// === Firebase setup ===
var firebaseConfig = {
  apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.firebasestorage.app",
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff"
};

// Initialize Firebase (avoid double init)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
var auth = firebase.auth();
var db = firebase.firestore();

// === Admin email list ===
var ADMIN_EMAILS = ["m.ngoma1988@gmail.com", "ngomamicaelc@gmail.com"];

// === Multilingual Resources ===
const resources = {
  en: {
    translation: {
      "title": "Gabon License Verifier",
      "home": "Home",
      "login": "Login",
      "logout": "Logout",
      "email": "Email",
      "password": "Password",
      "licenseNumber": "License Number",
      "requestingOrganization": "Requesting Organization",
      "country": "Country",
      "purpose": "Purpose of Verification",
      "verifyLicence": "Verify Licence",
      "dashboard": "Dashboard",
      "addLicense": "Add License",
      "verificationPortal": "Verification Portal",
      "analytics": "Analytics",
      "userManagement": "User Management",
      "totalLicenses": "Total Licenses",
      "activeLicenses": "Active Licenses"
    }
  },
  fr: {
    translation: {
      "title": "Vérificateur de Permis du Gabon",
      "home": "Accueil",
      "login": "Connexion",
      "logout": "Déconnexion",
      "email": "E-mail",
      "password": "Mot de passe",
      "licenseNumber": "Numéro de Permis",
      "requestingOrganization": "Organisation Requérante",
      "country": "Pays",
      "purpose": "But de la Vérification",
      "verifyLicence": "Vérifier le Permis",
      "dashboard": "Tableau de Bord",
      "addLicense": "Ajouter un Permis",
      "verificationPortal": "Portail de Vérification",
      "analytics": "Analytique",
      "userManagement": "Gestion des Utilisateurs",
      "totalLicenses": "Nombre Total de Permis",
      "activeLicenses": "Permis Actifs"
    }
  },
  ja: {
    translation: {
      "title": "ガボン運転免許確認システム",
      "home": "ホーム",
      "login": "ログイン",
      "logout": "ログアウト",
      "email": "メールアドレス",
      "password": "パスワード",
      "licenseNumber": "免許番号",
      "requestingOrganization": "申請組織",
      "country": "国",
      "purpose": "確認の目的",
      "verifyLicence": "免許を確認する",
      "dashboard": "ダッシュボード",
      "addLicense": "免許を追加",
      "verificationPortal": "確認ポータル",
      "analytics": "分析",
      "userManagement": "ユーザー管理",
      "totalLicenses": "総免許数",
      "activeLicenses": "有効な免許"
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

// === Language Switcher ===
document.addEventListener("DOMContentLoaded", () => {
  const switcher = document.getElementById("languageSwitcher");
  if (switcher) {
    switcher.addEventListener("change", function() {
      i18next.changeLanguage(this.value, () => $("body").localize());
    });
  }
});

// === Utility: Alerts ===
function showAlert(message, type = "error") {
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert " + (type === "success" ? "success" : "error");
  alertDiv.innerText = message;
  document.body.prepend(alertDiv);
  setTimeout(() => alertDiv.remove(), 4000);
}

// === Authentication ===
function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(error => showAlert(error.message, "error"));
}

function signOutUser() {
  auth.signOut()
    .then(() => window.location.href = "index.html")
    .catch(error => showAlert(error.message, "error"));
}

// === Restrict Pages ===
auth.onAuthStateChanged(user => {
  const currentPage = window.location.pathname.split("/").pop();
  const protectedPages = ["dashboard.html", "add_license.html"];

  if (!user && protectedPages.includes(currentPage)) {
    window.location.href = "index.html";
    return;
  }

  if (user && currentPage === "add_license.html" && !ADMIN_EMAILS.includes(user.email)) {
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
    .catch(error => showAlert("Error verifying license:
