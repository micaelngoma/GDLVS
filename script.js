// === Firebase setup (gdlvs-system) ===
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

// [CHANGED] Removed ADMIN_EMAILS from frontend to avoid leaking who is admin.
// Access is enforced in Firestore Rules by whitelisted emails only.

// === Multilingual Resources ===
const resources = {
  en: { translation: {
    "title": "Gabon License Verifier",
    "home": "Home",
    "login": "Login",
    "signup": "Sign Up",
    "logout": "Logout",
    "email": "Email",
    "password": "Password",
    "licenseNumber": "License Number",
    "organization": "Requesting Organization",    // [CHANGED] wording
    "country": "Country",
    "purpose": "Purpose of Verification",
    "verify": "Verify Licence",                   // [CHANGED] UK spelling per request
    "dashboard": "Dashboard",
    "addLicense": "Add License",
    "verificationPortal": "Verification Portal",
    "totalLicenses": "Total Licenses",
    "activeLicenses": "Active Licenses",
    "fullName": "Full Name",
    "class": "Class",
    "issueDate": "Issue Date",
    "expiryDate": "Expiry Date"
  }},
  fr: { translation: {
    "title": "Vérificateur de Permis du Gabon",
    "home": "Accueil",
    "login": "Connexion",
    "signup": "Créer un Compte",
    "logout": "Déconnexion",
    "email": "E-mail",
    "password": "Mot de passe",
    "licenseNumber": "Numéro de Permis",
    "organization": "Organisation Requérante",   // [CHANGED]
    "country": "Pays",
    "purpose": "But de la Vérification",
    "verify": "Vérifier le Permis",              // [CHANGED] closest FR copy
    "dashboard": "Tableau de Bord",
    "addLicense": "Ajouter un Permis",
    "verificationPortal": "Portail de Vérification",
    "totalLicenses": "Nombre Total de Permis",
    "activeLicenses": "Permis Actifs",
    "fullName": "Nom Complet",
    "class": "Catégorie",
    "issueDate": "Date de Délivrance",
    "expiryDate": "Date d’Expiration"
  }},
  ja: { translation: {
    "title": "ガボン運転免許確認システム",
    "home": "ホーム",
    "login": "ログイン",
    "signup": "新規登録",
    "logout": "ログアウト",
    "email": "メールアドレス",
    "password": "パスワード",
    "licenseNumber": "免許番号",
    "organization": "申請組織",                 // [CHANGED]
    "country": "国",
    "purpose": "確認の目的",
    "verify": "免許を確認する",                 // [CHANGED]
    "dashboard": "ダッシュボード",
    "addLicense": "免許を追加",
    "verificationPortal": "確認ポータル",
    "totalLicenses": "総免許数",
    "activeLicenses": "有効な免許",
    "fullName": "氏名",
    "class": "区分",
    "issueDate": "交付日",
    "expiryDate": "有効期限"
  }}
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
function showAlert(message, type = "error", targetId) {
  const id = targetId || (location.pathname.endsWith('verify.html') ? 'alertVerify'
             : location.pathname.endsWith('add_licence.html') ? 'alertAdd'
             : 'alertAuth');
  const el = document.getElementById(id);
  if (!el) return alert(message);
  el.style.display = 'block';
  el.className = 'alert ' + (type === 'success' ? 'success' : '');
  el.textContent = message;
  setTimeout(()=> { el.style.display='none'; }, 4500);
}

// === Authentication helpers ===
// Enforce auth on protected pages
auth.onAuthStateChanged(user => {
  const page = window.location.pathname.split("/").pop();
  const protectedPages = ["dashboard.html", "add_licence.html"];
  if (!user && protectedPages.includes(page)) {
    window.location.href = "index.html";
    return;
  }
  if(user && !user.emailVerified){
    showAlert("Please verify your email to access protected pages.", "error");
  }
});

function signOutUser() {
  auth.signOut()
    .then(() => window.location.href = "index.html")
    .catch(error => showAlert(error.message, "error"));
}

// === Dashboard ===
function loadDashboardData() {
  // Only counts accessible to authenticated users
  db.collection("licenses").get().then(snapshot => {
    const total = snapshot.size;
    let activeCount = 0;
    snapshot.forEach(doc => { if (doc.data().status === "Active") activeCount++; });
    const t = document.getElementById("totalLicenses");
    const a = document.getElementById("activeLicenses");
    if (t) t.innerText = total;
    if (a) a.innerText = activeCount;
  }).catch(e=> showAlert(e.message));
}

// === Add License ===
// [CHANGED] Writes full doc to /licenses, and public minimal doc to /license_public
function addLicense() {
  const licenseNumber = document.getElementById("licenseNumber").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const licenseClass = document.getElementById("licenseClass").value;
  const issueDate = document.getElementById("issueDate").value;
  const expiryDate = document.getElementById("expiryDate").value;

  if (!licenseNumber || !fullName || !licenseClass || !issueDate || !expiryDate) {
    showAlert("Please fill in all fields.");
    return;
  }

  const ref = db.collection("licenses").doc(licenseNumber);
  ref.get().then(docSnap => {
    if (docSnap.exists) {
      showAlert("License already exists!");
      return Promise.reject(new Error("exists"));
    }
    // Full record (private)
    const data = {
      licenseNumber,
      fullName,
      class: licenseClass,
      status: "Active",
      issueDate,
      expiryDate,
      addedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.currentUser ? auth.currentUser.email : null
    };
    // Public minimal record (no PII)
    const publicData = {
      licenseNumber,
      status: "Active",
      expiryDate
    };
    return Promise.all([
      ref.set(data),
      db.collection("license_public").doc(licenseNumber).set(publicData)
    ]);
  })
  .then(() => {
    showAlert("License added successfully!", "success");
    document.getElementById("addLicenseForm").reset();
  })
  .catch(error => { if(error.message!=="exists") showAlert("Error adding license: " + error.message); });
}

// === Verification (Public) ===
// [CHANGED] Public reads only from license_public.
// [CHANGED] Added cooldown to mitigate brute force.
let lastVerifyTime = 0;
function verifyLicense() {
  const now = Date.now();
  if (now - lastVerifyTime < 4000) {
    showAlert("Please wait a moment before trying again.");
    return;
  }
  lastVerifyTime = now;

  const licenseNumber = document.getElementById("verifyLicenseNumber").value.trim();
  const requestingOrg = document.getElementById("requestingOrg")?.value.trim();
  const country = document.getElementById("country")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const purpose = document.getElementById("purpose")?.value.trim();

  if (!licenseNumber) {
    showAlert("Please enter a license number.");
    return;
  }

  // Only public minimal info
  db.collection("license_public").doc(licenseNumber).get()
    .then(doc => {
      const resultDiv = document.getElementById("verificationResult");
      if (!resultDiv) return;

      let html = "";
      if (!doc.exists) {
        html = "<p class='result-invalid'>❌ License not found.</p>";
      } else {
        const d = doc.data();
        const isExpired = d.expiryDate && new Date(d.expiryDate) < new Date();
        html = `
          <p class='${isExpired ? "result-invalid":"result-valid"}'>
            ${isExpired ? "⚠️ Licence expired" : "✅ Licence is valid"}
          </p>
          <p><strong>Status:</strong> ${d.status}</p>
          ${d.expiryDate ? `<p><strong>Expiry Date:</strong> ${d.expiryDate}</p>` : ""}
          <p style="color:#6b7b8c">For detailed record, authorized agencies must sign in.</p>
        `;
      }
      resultDiv.innerHTML = html;

      // Log verification attempt (no secrets)
      db.collection("verifications").add({
        licenseNumber,
        requestingOrg: requestingOrg || null,
        country: country || null,
        email: email || null,
        purpose: purpose || null,
        result: doc.exists ? "FOUND_PUBLIC" : "NOT_FOUND",
        verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(()=>{ /* ignore logging errors in public portal */ });
    })
    .catch(error => showAlert("Error verifying license: " + error.message));
}

// === Page Hooks ===
window.onload = function() {
  const page = window.location.pathname.split("/").pop();
  if (page === "dashboard.html") loadDashboardData();
};

// Expose globally for inline handlers
window.signOutUser = signOutUser;
window.addLicense = addLicense;
window.verifyLicense = verifyLicense;
