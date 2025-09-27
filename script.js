const firebaseConfig = {
  apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.firebasestorage.app",
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// i18n init (keep translations as before)
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

function showMsg(text, ok = false) {
  const el = document.getElementById("msg");
  if (el) {
    el.textContent = text;
    el.style.color = ok ? "green" : "red";
  } else {
    alert(text);
  }
}

// Auth
function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      showMsg("Login successful, redirecting...", true);
      window.location.href = "dashboard.html";
    })
    .catch(err => showMsg(err.message));
}

function signOutUser() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// Role access
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

  if (role !== "admin" && adminPages.includes(currentPage)) {
    window.location.href = "verify.html";
  }
});

// Add license, verify, analytics functions remain same...
window.loginUser = loginUser;
window.signOutUser = signOutUser;
