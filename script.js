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

// === Utility ===
function showMsg(text, ok = false) {
  const el = document.getElementById("msg");
  if (el) {
    el.textContent = text;
    el.style.color = ok ? "green" : "red";
  } else alert(text);
}

// === Authentication ===
async function loginUser(e) {
  if (e) e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    if (!cred.user.emailVerified) {
      showMsg("⚠️ Verify your email before logging in. Link resent.");
      await cred.user.sendEmailVerification();
      await auth.signOut();
      return;
    }

    const userDoc = await db.collection("users").doc(email).get();
    const roleDoc = await db.collection("roles").doc(email).get();
    const status = userDoc.exists ? userDoc.data().status : "pending";
    const role = roleDoc.exists ? roleDoc.data().role : "verifier";

    if (status !== "approved") {
      showMsg("⏳ Your account is not approved yet.");
      await auth.signOut();
      return;
    }

    if (role === "admin") {
      showMsg("✅ Welcome Admin! Redirecting...", true);
      setTimeout(() => (window.location.href = "dashboard.html"), 1000);
    } else {
      showMsg("✅ Login successful! Redirecting...", true);
      setTimeout(() => (window.location.href = "verify.html"), 1000);
    }
  } catch (err) {
    console.error(err);
    showMsg("❌ Login failed: " + err.message);
  }
}

function signOutUser() {
  auth.signOut().then(() => (window.location.href = "index.html"));
}

async function signupUser(e) {
  e.preventDefault();
  const fullName = document.getElementById("signupFullName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection("roles").doc(email).set({ email, role: "verifier" });
    await db.collection("users").doc(email).set({
      email,
      fullName,
      role: "verifier",
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    await cred.user.updateProfile({ displayName: fullName });
    await cred.user.sendEmailVerification();
    showMsg("✅ Account created! Please verify your email.", true);
    await auth.signOut();
    setTimeout(() => (window.location.href = "index.html"), 3000);
  } catch (err) {
    console.error(err);
    showMsg("❌ Signup failed: " + err.message);
  }
}

// === Access Control ===
auth.onAuthStateChanged(async (user) => {
  const page = window.location.pathname.split("/").pop();
  const adminPages = [
    "dashboard.html",
    "add_license.html",
    "analytics.html",
    "users.html",
    "verification_requests.html"
  ];

  if (!user) {
    if (adminPages.includes(page)) window.location.href = "index.html";
    return;
  }

  const userDoc = await db.collection("users").doc(user.email).get();
  const roleDoc = await db.collection("roles").doc(user.email).get();
  const status = userDoc.exists ? userDoc.data().status : "pending";
  const role = roleDoc.exists ? roleDoc.data().role : "verifier";

  if (!user.emailVerified || status !== "approved") {
    await auth.signOut();
    window.location.href = "index.html";
    return;
  }

  switch (page) {
    case "dashboard.html":
      loadDashboardData();
      loadLicensesTable();
      break;
    case "analytics.html":
      loadAnalyticsData();
      break;
    case "users.html":
      loadUsersData();
      break;
    case "verification_requests.html":
      loadVerificationRequests();
      break;
  }

  if (role !== "admin" && adminPages.includes(page))
    if (page !== "verify.html") window.location.href = "verify.html";
});

// === License Management ===
function addLicense() {
  const licenseNumber = document.getElementById("licenseNumber").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const licenseClass = document.getElementById("licenseClass").value;
  const issueDate = document.getElementById("issueDate").value;
  const expiryDate = document.getElementById("expiryDate").value;
  if (!licenseNumber || !fullName || !licenseClass || !issueDate || !expiryDate)
    return showMsg("⚠️ All fields are required");

  db.collection("licenses").doc(licenseNumber).set({
    licenseNumber,
    fullName,
    class: licenseClass,
    issueDate,
    expiryDate,
    status: "Active",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    createdBy: auth.currentUser?.email || ""
  })
    .then(() => {
      showMsg("✅ License added!", true);
      document.getElementById("addLicenseForm").reset();
      loadDashboardData();
      loadLicensesTable();
    })
    .catch(err => showMsg("❌ Error: " + err.message));
}

// === Dashboard ===
async function loadDashboardData() {
  try {
    const snapshot = await db.collection("licenses").get();
    let total = snapshot.size, active = 0;
    snapshot.forEach(doc => {
      if (doc.data().status === "Active") active++;
    });
    document.getElementById("totalLicenses").innerText = total;
    document.getElementById("activeLicenses").innerText = active;
  } catch {
    document.getElementById("licensesTable").innerHTML = "<tr><td colspan='7' style='color:red'>Failed to load data</td></tr>";
  }
}

// === Users ===
async function loadUsersData() {
  const tbody = document.querySelector("#usersTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";
  try {
    const users = await db.collection("users").get();
    const roles = await db.collection("roles").get();
    const map = {};
    roles.forEach(r => (map[r.id] = r.data().role));
    tbody.innerHTML = "";
    users.forEach(doc => {
      const u = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.fullName}</td>
        <td>${u.email}</td>
        <td>${map[u.email] || "verifier"}</td>
        <td>${u.status}</td>
        <td>
          <button onclick="approveUser('${u.email}')">Approve</button>
          <button onclick="disableUser('${u.email}')">Disable</button>
          <button onclick="promoteUser('${u.email}')">Promote</button>
          <button onclick="demoteUser('${u.email}')">Demote</button>
          <button onclick="deleteUser('${u.email}')">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
    tbody.innerHTML = "<tr><td colspan='5' style='color:red'>Failed to load users</td></tr>";
  }
}

// === Add New User (Admin) ===
async function addNewUser() {
  const name = document.getElementById("newUserName").value.trim();
  const email = document.getElementById("newUserEmail").value.trim();
  const role = document.getElementById("newUserRole").value;
  const status = document.getElementById("newUserStatus").value;
  if (!name || !email || !role)
    return showMsg("⚠️ All fields required");

  await db.collection("users").doc(email).set({
    email,
    fullName: name,
    status,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  await db.collection("roles").doc(email).set({ email, role });
  showMsg("✅ User added!", true);
  loadUsersData();
}

// === Admin User Controls ===
async function approveUser(email) { await db.collection("users").doc(email).update({ status: "approved" }); loadUsersData(); }
async function disableUser(email) { await db.collection("users").doc(email).update({ status: "disabled" }); loadUsersData(); }
async function promoteUser(email) { await db.collection("roles").doc(email).update({ role: "admin" }); loadUsersData(); }
async function demoteUser(email) { await db.collection("roles").doc(email).update({ role: "verifier" }); loadUsersData(); }
async function deleteUser(email) {
  await db.collection("users").doc(email).delete();
  await db.collection("roles").doc(email).delete();
  loadUsersData();
}

// === Expose Globally ===
window.loginUser = loginUser;
window.signupUser = signupUser;
window.signOutUser = signOutUser;
window.addLicense = addLicense;
window.loadDashboardData = loadDashboardData;
window.loadLicensesTable = loadDashboardData;
window.loadUsersData = loadUsersData;
window.approveUser = approveUser;
window.disableUser = disableUser;
window.promoteUser = promoteUser;
window.demoteUser = demoteUser;
window.deleteUser = deleteUser;
window.addNewUser = addNewUser;
