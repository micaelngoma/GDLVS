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


// === Signup ===
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
  const adminPages = [
    "dashboard.html",
    "add_license.html",
    "analytics.html",
    "users.html",
    "verification_requests.html"
  ];

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

  // Auto-load data depending on page
  switch (currentPage) {
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

  // Restrict verifier access to admin-only pages
  if (role !== "admin" && adminPages.includes(currentPage)) {
    if (currentPage !== "verify.html") window.location.href = "verify.html";
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
      showMsg("✅ License added!", true);
      document.getElementById("addLicenseForm").reset();
      loadDashboardData();
      loadLicensesTable();
    })
    .catch((err) => {
      showMsg("❌ Error adding license: " + err.message);
    });
}


// === Dashboard Data ===
async function loadDashboardData() {
  try {
    const snapshot = await db.collection("licenses").get();
    let total = 0,
      active = 0;
    snapshot.forEach((doc) => {
      total++;
      if (doc.data().status === "Active") active++;
    });
    const totalEl = document.getElementById("totalLicenses");
    const activeEl = document.getElementById("activeLicenses");
    if (totalEl) totalEl.innerText = total;
    if (activeEl) activeEl.innerText = active;
  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}


// === Licenses Table ===
async function loadLicensesTable() {
  const tbody = document.querySelector("#licensesTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";
  try {
    const snap = await db.collection("licenses").orderBy("licenseNumber").get();
    tbody.innerHTML = "";
    if (snap.empty) {
      tbody.innerHTML = "<tr><td colspan='7'>No licenses</td></tr>";
      return;
    }
    snap.forEach((doc) => {
      const d = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.licenseNumber}</td>
        <td contenteditable="true" data-field="fullName">${d.fullName || ""}</td>
        <td>
          <select data-field="class">
            <option ${d.class === "Class A" ? "selected" : ""}>Class A</option>
            <option ${d.class === "Class B" ? "selected" : ""}>Class B</option>
            <option ${d.class === "Class C" ? "selected" : ""}>Class C</option>
          </select>
        </td>
        <td><input type="date" data-field="issueDate" value="${d.issueDate || ""}"></td>
        <td><input type="date" data-field="expiryDate" value="${d.expiryDate || ""}"></td>
        <td>
          <select data-field="status">
            <option ${d.status === "Active" ? "selected" : ""}>Active</option>
            <option ${d.status === "Suspended" ? "selected" : ""}>Suspended</option>
            <option ${d.status === "Expired" ? "selected" : ""}>Expired</option>
          </select>
        </td>
        <td><button class="inline" onclick="saveLicenseRow('${d.licenseNumber}', this)">Save</button></td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("loadLicensesTable error:", err);
  }
}

async function saveLicenseRow(licenseNumber, btn) {
  try {
    const tr = btn.closest("tr");
    const payload = {};
    tr.querySelectorAll("[data-field]").forEach((el) => {
      const key = el.getAttribute("data-field");
      payload[key] = el.tagName === "TD" ? el.textContent.trim() : el.value;
    });
    await db.collection("licenses").doc(licenseNumber).update(payload);
    showMsg("✅ License updated", true);
  } catch (err) {
    console.error("saveLicenseRow error:", err);
  }
}


// === Verify License ===
async function verifyLicense(e) {
  if (e) e.preventDefault();
  const licenseNumber = document.getElementById("verifyLicenseNumber").value.trim();
  const requestingOrg = document.getElementById("verifyOrg")?.value.trim() || "";
  const country = document.getElementById("verifyCountry")?.value.trim() || "";
  const purpose = document.getElementById("verifyPurpose")?.value.trim() || "";
  const resultEl = document.getElementById("verifyResult");
  if (!licenseNumber) {
    showMsg("⚠️ License number required");
    return;
  }

  try {
    const doc = await db.collection("licenses").doc(licenseNumber).get();
    const found = doc.exists;
    const result = found ? "License found" : "License not found";

    await db.collection("verifications").add({
      licenseNumber,
      requestingOrg,
      country,
      email: auth.currentUser?.email || "",
      purpose,
      result,
      verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      verifiedBy: auth.currentUser?.uid || ""
    });

    if (resultEl) {
      resultEl.style.display = "block";
      resultEl.innerHTML = `
        <h3>${result}</h3>
        <p><strong>License #:</strong> ${licenseNumber}</p>
        <p><strong>Organization:</strong> ${requestingOrg}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>`;
    }

    showMsg(`✅ ${result}`, true);
  } catch (err) {
    console.error("verifyLicense error:", err);
  }
}


// === Analytics Data ===
async function loadAnalyticsData() {
  try {
    const snapshot = await db.collection("verifications").orderBy("verifiedAt", "desc").limit(10).get();
    let total = 0,
      success = 0,
      fail = 0;
    const tbody = document.getElementById("verificationLogs");
    if (!tbody) return;
    tbody.innerHTML = "";
    snapshot.forEach((doc) => {
      const d = doc.data();
      total++;
      if (d.result === "License found") success++;
      else fail++;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.licenseNumber}</td>
        <td>${d.requestingOrg || ""}</td>
        <td>${d.country || ""}</td>
        <td>${d.result || ""}</td>
        <td>${d.verifiedAt ? new Date(d.verifiedAt.seconds * 1000).toLocaleString() : ""}</td>`;
      tbody.appendChild(tr);
    });
    document.getElementById("totalVerifications").innerText = total;
    document.getElementById("successfulVerifications").innerText = success;
    document.getElementById("failedVerifications").innerText = fail;
  } catch (err) {
    console.error("Analytics load error:", err);
  }
}


// === Verification Requests (Admin) ===
async function loadVerificationRequests() {
  try {
    const snapshot = await db.collection("verifications").orderBy("verifiedAt", "desc").get();
    const tbody = document.querySelector("#requestsTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (snapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='7'>No verification requests</td></tr>";
      return;
    }
    snapshot.forEach((doc) => {
      const d = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.licenseNumber || ""}</td>
        <td>${d.requestingOrg || ""}</td>
        <td>${d.country || ""}</td>
        <td>${d.email || ""}</td>
        <td>${d.purpose || ""}</td>
        <td>${d.result || ""}</td>
        <td>${d.verifiedAt ? new Date(d.verifiedAt.seconds * 1000).toLocaleString() : ""}</td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Load requests error:", err);
  }
}


// === User Management ===
async function loadUsersData() {
  try {
    const usersSnap = await db.collection("users").get();
    const rolesSnap = await db.collection("roles").get();
    const roleMap = {};
    rolesSnap.forEach((doc) => (roleMap[doc.id] = doc.data().role || "verifier"));
    const tbody = document.getElementById("usersTable").querySelector("tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (usersSnap.empty) {
      tbody.innerHTML = "<tr><td colspan='5'>No users found</td></tr>";
      return;
    }
    usersSnap.forEach((doc) => {
      const u = doc.data();
      const role = roleMap[u.email] || u.role || "verifier";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.fullName || ""}</td>
        <td>${u.email}</td>
        <td>${role}</td>
        <td>${u.status || "pending"}</td>
        <td>
          <button class="inline" onclick="approveUser('${u.email}')">Approve</button>
          <button class="inline" onclick="disableUser('${u.email}')">Disable</button>
          <button class="inline" onclick="promoteUser('${u.email}')">Promote</button>
          <button class="inline" onclick="demoteUser('${u.email}')">Demote</button>
          <button class="inline" onclick="deleteUser('${u.email}')">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("User load error:", err);
  }
}

async function approveUser(email) {
  await db.collection("users").doc(email).update({ status: "approved" });
  showMsg("✅ User approved", true);
  loadUsersData();
}
async function disableUser(email) {
  await db.collection("users").doc(email).update({ status: "disabled" });
  showMsg("✅ User disabled", true);
  loadUsersData();
}
async function promoteUser(email) {
  await db.collection("roles").doc(email).update({ role: "admin" });
  showMsg("✅ User promoted to admin", true);
  loadUsersData();
}
async function demoteUser(email) {
  await db.collection("roles").doc(email).update({ role: "verifier" });
  showMsg("✅ User demoted to verifier", true);
  loadUsersData();
}
async function deleteUser(email) {
  await db.collection("users").doc(email).delete();
  await db.collection("roles").doc(email).delete();
  showMsg("🗑️ User deleted", true);
  loadUsersData();
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
window.approveUser = approveUser;
window.disableUser = disableUser;
window.promoteUser = promoteUser;
window.demoteUser = demoteUser;
window.deleteUser = deleteUser;
