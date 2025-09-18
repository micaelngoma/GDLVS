// === Firebase Setup (GDLVS) ===
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";

// Config
const firebaseConfig = {
 apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.firebasestorage.app",
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// === i18n Translations (EN, FR, JA) ===
const resources = { /* keep your translations exactly as before */ };

// === Init i18n ===
i18next.use(i18nextBrowserLanguageDetector).init(
  {
    resources,
    fallbackLng: "en",
    debug: false
  },
  function () {
    jqueryI18next.init(i18next, $, { useOptionsAttr: true });
    $("body").localize();
  }
);

// === Language Switcher ===
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
async function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMsg("Login successful, redirecting...", true);
    window.location.href = "dashboard.html";
  } catch (err) {
    showMsg(err.message);
  }
}

async function signUpUser() {
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showMsg("Account created. Awaiting role assignment.", true);
  } catch (err) {
    showMsg(err.message);
  }
}

async function signOutUser() {
  await signOut(auth);
  window.location.href = "index.html";
}

// === Role-based Page Access ===
onAuthStateChanged(auth, async (user) => {
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
async function addLicense() {
  const licenseNumber = document.getElementById("licenseNumber").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const licenseClass = document.getElementById("licenseClass").value;
  const issueDate = document.getElementById("issueDate").value;
  const expiryDate = document.getElementById("expiryDate").value;

  if (!licenseNumber || !fullName || !licenseClass || !issueDate || !expiryDate) {
    showMsg("All fields required");
    return;
  }

  try {
    const ref = doc(db, "licenses", licenseNumber);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      showMsg("License already exists");
      return;
    }

    await setDoc(ref, {
      licenseNumber,
      fullName,
      class: licenseClass,
      issueDate,
      expiryDate,
      status: "Active",
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser ? auth.currentUser.uid : null
    });

    showMsg("License added successfully!", true);
    document.getElementById("addLicenseForm").reset();
  } catch (err) {
    showMsg(err.message);
  }
}

// === Dashboard Data ===
async function loadDashboardData() {
  const snapshot = await getDocs(collection(db, "licenses"));
  document.getElementById("totalLicenses").innerText = snapshot.size;
  let active = 0;
  snapshot.forEach((doc) => {
    if (doc.data().status === "Active") active++;
  });
  document.getElementById("activeLicenses").innerText = active;
}

// === License Verification ===
async function verifyLicense() {
  const number = document.getElementById("verifyLicenseNumber").value.trim();
  const org = document.getElementById("requestingOrg")?.value.trim();
  const country = document.getElementById("country")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const purpose = document.getElementById("purpose")?.value.trim();

  if (!number) {
    showMsg("Please enter a license number");
    return;
  }

  try {
    const ref = doc(db, "licenses", number);
    const snapshot = await getDoc(ref);
    const div = document.getElementById("verificationResult");

    if (!snapshot.exists()) {
      div.innerHTML = "<p style='color:red;'>License not found</p>";
    } else {
      const d = snapshot.data();
      div.innerHTML = `
        <p><b>Name:</b> ${d.fullName}</p>
        <p><b>Class:</b> ${d.class}</p>
        <p><b>Status:</b> ${d.status}</p>
        <p><b>Issue Date:</b> ${d.issueDate}</p>
        <p><b>Expiry Date:</b> ${d.expiryDate}</p>`;
    }

    await addDoc(collection(db, "verifications"), {
      licenseNumber: number,
      requestingOrg: org || "",
      country: country || "",
      email: email || "",
      purpose: purpose || "",
      result: snapshot.exists() ? "License found" : "Not found",
      verifiedAt: serverTimestamp(),
      verifiedBy: auth.currentUser ? auth.currentUser.uid : "anonymous"
    });
  } catch (err) {
    showMsg(err.message);
  }
}

// === Analytics Data ===
async function loadAnalyticsData() {
  const logsRef = query(collection(db, "verifications"), orderBy("verifiedAt", "desc"), limit(10));
  const snapshot = await getDocs(logsRef);

  let total = 0,
    success = 0,
    fail = 0;
  const tbody = document.getElementById("verificationLogs");
  tbody.innerHTML = "";

  snapshot.forEach((doc) => {
    const d = doc.data();
    total++;
    if (d.result === "License found") success++;
    else fail++;

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
}

// === User Management (Placeholder) ===
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
