/* ===========================================
   GDLVS SYSTEM CORE SCRIPT
   Two-Way Sync (Realtime Firestore Updates)
   =========================================== */

/* === Firebase Initialization (Web v8) === */
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

/* === i18n (minimal demo, extend if needed) === */
i18next.use(i18nextBrowserLanguageDetector).init(
  {
    resources: {
      en: { translation: {
        welcomeTitle: "Welcome",
        welcomeMessage: "Welcome to the Gabon Driver’s License Verification System (GDLVS)—a secure platform designed to verify the authenticity of Gabonese driver’s license IDs.",
        login: "Login", logout: "Logout", verify: "Verify", requestAccessHere: "Request access here",
        noAccount: "Don’t have an account?",
        forgotPassword: "Forgot Password?",
        requestAccess: "Request Access",
        fullNamePlaceholder: "Full Name",
        emailPlaceholder: "Email",
        passwordPlaceholder: "Password",
        organizationPlaceholder: "Organization / Company / Agency",
        phonePlaceholder: "Phone Number",
        purposePlaceholder: "Purpose of access..."
      }},
      fr: { translation: {
        welcomeTitle: "Bienvenue",
        welcomeMessage: "Bienvenue sur le Système Gabonais de Vérification des Permis de Conduire (GDLVS) — une plateforme sécurisée pour vérifier l’authenticité des permis gabonais.",
        login: "Connexion", logout: "Déconnexion", verify: "Vérifier", requestAccessHere: "Demander l’accès ici",
        noAccount: "Vous n’avez pas de compte ?",
        forgotPassword: "Mot de passe oublié ?",
        requestAccess: "Demander l’accès",
        fullNamePlaceholder: "Nom complet",
        emailPlaceholder: "Email",
        passwordPlaceholder: "Mot de passe",
        organizationPlaceholder: "Organisation / Société / Agence",
        phonePlaceholder: "Numéro de téléphone",
        purposePlaceholder: "But de l’accès..."
      }},
      ja: { translation: {
        welcomeTitle: "ようこそ",
        welcomeMessage: "ガボン運転免許証照合システム（GDLVS）へようこそ。ガボン運転免許IDの真正性を照合するための安全なプラットフォームです。",
        login: "ログイン", logout: "ログアウト", verify: "照合", requestAccessHere: "アクセス申請はこちら",
        noAccount: "アカウントがありませんか？",
        forgotPassword: "パスワードをお忘れですか？",
        requestAccess: "アクセス申請",
        fullNamePlaceholder: "氏名",
        emailPlaceholder: "メール",
        passwordPlaceholder: "パスワード",
        organizationPlaceholder: "所属 / 会社 / 機関",
        phonePlaceholder: "電話番号",
        purposePlaceholder: "利用目的..."
      }}
    },
    fallbackLng: "en"
  },
  function () {
    if (typeof jqueryI18next !== "undefined") {
      jqueryI18next.init(i18next, $, { useOptionsAttr: true });
      $("body").localize();
    }
    auth.useDeviceLanguage();
  }
);

/* === Helpers === */
function showMsg(text, ok=false){
  const el = document.getElementById("msg");
  if(el){ el.textContent = text; el.className = ok ? "success" : "error"; }
  else { alert(text); }
}

/* === Auth === */
async function loginUser(e){
  e?.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try{
    const cred = await auth.signInWithEmailAndPassword(email, password);
    if(!cred.user.emailVerified){
      await cred.user.sendEmailVerification();
      showMsg("⚠️ Verify your email before login.");
      await auth.signOut();
      return;
    }

    // Role-based redirect
    const roleDoc = await db.collection("roles").doc(email).get();
    const role = roleDoc.exists ? roleDoc.data().role : "verifier";

    if(role === "admin"){
      showMsg("✅ Welcome Admin!", true);
      setTimeout(()=> window.location.href="dashboard.html", 600);
    } else {
      showMsg("✅ Welcome Verifier!", true);
      setTimeout(()=> window.location.href="verify.html", 600);
    }
  }catch(err){
    showMsg("❌ " + err.message);
  }
}

function signOutUser(){ auth.signOut().then(()=> window.location.href="index.html"); }

async function resetPassword(){
  const email = (document.getElementById("email")?.value || "").trim() || prompt("Enter your email to reset password:");
  if(!email) return;
  try{
    await auth.sendPasswordResetEmail(email);
    alert("Password reset email sent!");
  }catch(err){ alert("Error: " + err.message); }
}

/* === Auth Guards (per page) === */
auth.onAuthStateChanged(async (user)=>{
  const page = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const adminPages = ["dashboard.html","add_licenses.html","analytics.html","users.html","verification_requests.html","requests.html"];

  if(!user){
    if (adminPages.includes(page) || page==="verify.html") window.location.href="index.html";
    return;
  }
  if(!user.emailVerified){
    showMsg("⚠️ Email verification required.");
    await auth.signOut();
    return;
  }

  // Status & role
  const userDoc = await db.collection("users").doc(user.email).get();
  const status = userDoc.exists ? (userDoc.data().status || "pending") : "pending";
  const roleDoc = await db.collection("roles").doc(user.email).get();
  const role = roleDoc.exists ? roleDoc.data().role : "verifier";

  if(status !== "approved" && page !== "dashboard.html"){ // allow admin to fix statuses from dashboard if needed
    showMsg("⏳ Your account is not approved yet.");
    await auth.signOut();
    return;
  }

  // Show/Hide nav items
  const navRequests = document.getElementById("navVerificationRequests");
  if (navRequests) navRequests.style.display = (role === "admin") ? "block" : "none";

  // Page init
  if(role === "admin"){
    if(page === "dashboard.html"){ initCounters(); initLicenseListener(); }
    if(page === "add_licenses.html"){ /* form only */ }
    if(page === "analytics.html"){ initVerificationListener(); }
    if(page === "users.html"){ initUserListener(); }
    if(page === "verification_requests.html"){ initVerificationAdminList(); }
    if(page === "requests.html"){ initRequestListener(); }
  } else {
    if (adminPages.includes(page)) window.location.href = "verify.html";
    if (page === "verify.html") { /* verifier form only */ }
  }
});

/* ===========================================
   🔁 TWO-WAY SYNC: REALTIME FIRESTORE UPDATES
   =========================================== */

/* === Dashboard counters === */
async function initCounters(){
  try{
    const snap = await db.collection("licenses").get();
    let total=0, active=0, suspended=0, expired=0;
    snap.forEach(doc=>{
      total++;
      const s = (doc.data().status || "").toLowerCase();
      if (s.startsWith("act")) active++;
      else if (s.startsWith("sus")) suspended++;
      else if (s.startsWith("exp")) expired++;
    });
    const set=(id,val)=>{ const el=document.getElementById(id); if(el) el.textContent = val; };
    set("totalLicenses", total);
    set("activeLicenses", active);
    set("suspendedLicenses", suspended);
    set("expiredLicenses", expired);
  }catch(err){ console.error(err); }
}

/* === Live License Table === */
function initLicenseListener(){
  const tbody = document.querySelector("#licensesTable tbody");
  if(!tbody) return;
  db.collection("licenses").orderBy("licenseNumber").onSnapshot((snapshot)=>{
    tbody.innerHTML = "";
    if (snapshot.empty){
      tbody.innerHTML = "<tr><td colspan='7'>No licenses</td></tr>";
      return;
    }
    snapshot.forEach(doc=>{
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
        <td><button class="inline" onclick="saveLicenseRow('${d.licenseNumber}', this)">Save</button></td>
      `;
      tbody.appendChild(tr);
    });
  });
}

/* === Save License (row) === */
async function saveLicenseRow(licenseNumber, btn){
  const tr = btn.closest("tr");
  const payload = {};
  tr.querySelectorAll("[data-field]").forEach(el=>{
    const key = el.getAttribute("data-field");
    payload[key] = (el.tagName === "TD") ? el.textContent.trim() : el.value;
  });
  try{
    await db.collection("licenses").doc(licenseNumber).set(payload, { merge:true });
    showMsg("✅ License updated", true);
    initCounters();
  }catch(err){ showMsg("❌ "+err.message); }
}

/* === Add License (form) === */
async function addLicense(){
  const f = document.getElementById("addLicenseForm");
  const data = {
    licenseNumber: f.licenseNumber.value.trim(),
    fullName: f.fullName.value.trim(),
    class: f.licenseClass.value,
    issueDate: f.issueDate.value,
    expiryDate: f.expiryDate.value,
    status: "Active"
  };
  if(!data.licenseNumber){ showMsg("⚠️ License number required"); return; }
  try{
    await db.collection("licenses").doc(data.licenseNumber).set(data, { merge:true });
    f.reset();
    showMsg("✅ License saved", true);
  }catch(err){ showMsg("❌ "+err.message); }
}

/* === Verify License (verifier form) === */
async function verifyLicense(e){
  e?.preventDefault();

  const licenseNumber = document.getElementById("verifyLicenseNumber").value.trim();
  const org = document.getElementById("verifyOrg").value.trim();
  const country = document.getElementById("verifyCountry").value.trim();
  const purpose = document.getElementById("verifyPurpose").value.trim();
  const resultEl = document.getElementById("verifyResult");
  const nextContainer = document.getElementById("verifyNextContainer");

  if(!licenseNumber){ showMsg("⚠️ License number required"); return; }

  try{
    const docRef = await db.collection("licenses").doc(licenseNumber).get();
    const found = docRef.exists;
    const d = docRef.data() || {};
    const resultText = found ? "License found" : "License not found";

    // Log verification
    await db.collection("verifications").add({
      licenseNumber,
      requestingOrg: org,
      country,
      email: auth.currentUser?.email || "",
      purpose,
      result: resultText,
      verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      verifiedBy: auth.currentUser?.uid || ""
    });

    if(resultEl){
      resultEl.style.display = "block";
      resultEl.innerHTML = `
        <h3>${found ? "✅ License Found" : "❌ License Not Found"}</h3>
        <p><strong>License #:</strong> ${licenseNumber}</p>
        ${found ? `
          <p><strong>Full Name:</strong> ${d.fullName || "N/A"}</p>
          <p><strong>Class:</strong> ${d.class || "N/A"}</p>
          <p><strong>Issue Date:</strong> ${d.issueDate || "N/A"}</p>
          <p><strong>Expiry Date:</strong> ${d.expiryDate || "N/A"}</p>
          <p><strong>Status:</strong> ${d.status || "N/A"}</p>
        ` : ""}
        <hr>
        <p><strong>Organization:</strong> ${org || "—"}</p>
        <p><strong>Country:</strong> ${country || "—"}</p>
        <p><strong>Purpose:</strong> ${purpose || "—"}</p>
      `;
    }

    if(nextContainer){
      nextContainer.style.display = "block";
      const btn = document.getElementById("verifyNextBtn");
      if(btn){
        btn.onclick = ()=>{
          document.getElementById("verifyForm").reset();
          if(resultEl) resultEl.style.display = "none";
          nextContainer.style.display = "none";
          document.getElementById("verifyLicenseNumber").focus();
        };
      }
    }

    showMsg(`✅ ${resultText}`, true);
  }catch(err){
    console.error(err);
    showMsg("❌ Error verifying license: " + err.message);
  }
}

/* === Analytics (recent verifications live) === */
function initVerificationListener(){
  const tbody = document.getElementById("verificationLogs");
  if(!tbody) return;

  db.collection("verifications").orderBy("verifiedAt","desc").limit(20).onSnapshot(snapshot=>{
    tbody.innerHTML = "";
    if(snapshot.empty){
      tbody.innerHTML = "<tr><td colspan='5'>No verifications</td></tr>";
      return;
    }
    let total=0, success=0, fail=0;
    snapshot.forEach(doc=>{
      const d = doc.data(); total++;
      if ((d.result||"").toLowerCase().includes("found")) success++; else fail++;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.licenseNumber}</td>
        <td>${d.requestingOrg || ""}</td>
        <td>${d.country || ""}</td>
        <td>${d.result || ""}</td>
        <td>${d.verifiedAt ? d.verifiedAt.toDate().toLocaleString() : ""}</td>
      `;
      tbody.appendChild(tr);
    });
    const set=(id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=val; };
    set("totalVerifications", total);
    set("successfulVerifications", success);
    set("failedVerifications", fail);
  });
}

/* === Verification Requests (admin history) === */
function initVerificationAdminList(){
  const tbody = document.getElementById("requestsTable");
  if(!tbody) return;
  db.collection("verifications").orderBy("verifiedAt","desc").onSnapshot(snapshot=>{
    tbody.innerHTML = "";
    if(snapshot.empty){
      tbody.innerHTML = "<tr><td colspan='7'>No verification logs</td></tr>";
      return;
    }
    snapshot.forEach(doc=>{
      const d = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.licenseNumber || ""}</td>
        <td>${d.requestingOrg || ""}</td>
        <td>${d.country || ""}</td>
        <td>${d.email || ""}</td>
        <td>${d.purpose || ""}</td>
        <td>${d.result || ""}</td>
        <td>${d.verifiedAt ? d.verifiedAt.toDate().toLocaleString() : ""}</td>
      `;
      tbody.appendChild(tr);
    });
  });
}

/* === Users (live) === */
function initUserListener(){
  const tbody = document.getElementById("usersTable");
  if(!tbody) return;

  // Load roles first (to show role)
  Promise.all([db.collection("users").get(), db.collection("roles").get()])
    .then(([usersSnap, rolesSnap])=>{
      const roleMap = {};
      rolesSnap.forEach(doc => roleMap[doc.id] = (doc.data().role || "verifier"));

      // Then realtime users
      db.collection("users").onSnapshot((snapshot)=>{
        tbody.innerHTML = "";
        if(snapshot.empty){
          tbody.innerHTML = "<tr><td colspan='5'>No users</td></tr>";
          return;
        }
        snapshot.forEach(doc=>{
          const u = doc.data();
          const role = roleMap[u.email] || u.role || "verifier";
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td contenteditable="true" data-field="fullName">${u.fullName || ""}</td>
            <td>${u.email}</td>
            <td>
              <select data-field="role" onchange="updateUserRow('${u.email}', this.closest('tr'))">
                <option ${role==="verifier"?"selected":""}>verifier</option>
                <option ${role==="admin"?"selected":""}>admin</option>
              </select>
            </td>
            <td>
              <select data-field="status" onchange="updateUserRow('${u.email}', this.closest('tr'))">
                <option ${u.status==="approved"?"selected":""}>approved</option>
                <option ${u.status==="pending"?"selected":""}>pending</option>
                <option ${u.status==="disabled"?"selected":""}>disabled</option>
              </select>
            </td>
            <td>
              <button class="inline" onclick="deleteUser('${u.email}')">Delete</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      });
    });
}

async function updateUserRow(email, tr){
  const updates = {};
  tr.querySelectorAll("[data-field]").forEach(el=>{
    const key = el.getAttribute("data-field");
    updates[key] = (el.tagName === "TD") ? el.textContent.trim() : el.value;
  });
  try{
    await db.collection("users").doc(email).set({
      fullName: updates.fullName || undefined,
      status: updates.status || undefined,
      approved: updates.status === "approved"
    }, { merge:true });

    if(updates.role){
      await db.collection("roles").doc(email).set({ role: updates.role }, { merge:true });
    }

    showMsg("✅ User updated", true);
  }catch(err){ showMsg("❌ "+err.message); }
}

async function deleteUser(email){
  if(!confirm(`Delete ${email}?`)) return;
  try{
    await db.collection("users").doc(email).delete();
    await db.collection("roles").doc(email).delete();
    showMsg("🗑️ User deleted", true);
  }catch(err){ showMsg("❌ "+err.message); }
}

/* === Access Requests (admin live) === */
function initRequestListener(){
  const tbody = document.querySelector("#requestsTable tbody");
  if(!tbody) return;

  db.collection("requests").orderBy("submittedAt","desc").onSnapshot((snapshot)=>{
    tbody.innerHTML = "";
    if (snapshot.empty){
      tbody.innerHTML = "<tr><td colspan='7'>No access requests</td></tr>";
      return;
    }
    snapshot.forEach(doc=>{
      const r = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.fullName}</td>
        <td>${r.email}</td>
        <td>${r.organization}</td>
        <td>${r.phone}</td>
        <td>${r.purpose}</td>
        <td>${r.status}</td>
        <td>
          <button class="inline" onclick="approveRequest('${doc.id}','${r.email}','${r.fullName}','${r.organization}','${r.phone}')">Approve</button>
          <button class="inline" onclick="rejectRequest('${doc.id}')">Reject</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

async function approveRequest(id, email, fullName, organization, phone){
  try{
    await db.collection("requests").doc(id).update({ status: "approved" });
    await db.collection("users").doc(email).set({
      fullName, email, organization, phone,
      status: "approved", role: "verifier",
      approvedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge:true });
    await db.collection("roles").doc(email).set({ role: "verifier" }, { merge:true });
    showMsg(`✅ ${fullName} approved as verifier`, true);
  }catch(err){ showMsg("❌ "+err.message); }
}

async function rejectRequest(id){
  try{
    await db.collection("requests").doc(id).update({ status: "rejected" });
    showMsg("🚫 Request rejected");
  }catch(err){ showMsg("❌ "+err.message); }
}

/* === Filters & CSV === */
function filterUsers(){
  const q = (document.getElementById("userSearch")?.value || "").toLowerCase();
  document.querySelectorAll("#usersTable tr").forEach(r=>{
    r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}
function filterLicenses(){
  const q = (document.getElementById("licenseSearch")?.value || "").toLowerCase();
  document.querySelectorAll("#licensesTable tbody tr").forEach(r=>{
    r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}
function filterAnalytics(){
  const q = (document.getElementById("analyticsSearch")?.value || "").toLowerCase();
  document.querySelectorAll("#verificationLogs tr").forEach(r=>{
    r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}
function filterRequests(){
  const q = (document.getElementById("requestSearch")?.value || "").toLowerCase();
  document.querySelectorAll("#requestsTable tbody tr").forEach(r=>{
    r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}

function exportTableToCSV(tableId, baseFilename){
  const table = document.getElementById(tableId);
  if(!table) return;

  const rows = table.querySelectorAll("tr");
  const csv = [];
  rows.forEach(row=>{
    const cols = row.querySelectorAll("th, td");
    const rowData = [];
    cols.forEach(col=> rowData.push(`"${col.innerText.replace(/"/g,'""')}"`));
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

/* === Expose === */
window.loginUser = loginUser;
window.signOutUser = signOutUser;
window.resetPassword = resetPassword;
window.addLicense = addLicense;
window.saveLicenseRow = saveLicenseRow;
window.verifyLicense = verifyLicense;

window.updateUserRow = updateUserRow;
window.deleteUser = deleteUser;

window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;

window.filterUsers = filterUsers;
window.filterLicenses = filterLicenses;
window.filterAnalytics = filterAnalytics;
window.filterRequests = filterRequests;

window.exportTableToCSV = exportTableToCSV;

/* === Language switcher === */
document.addEventListener("DOMContentLoaded", () => {
  const switcher = document.getElementById("languageSwitcher");
  if (switcher) {
    switcher.addEventListener("change", function () {
      i18next.changeLanguage(this.value, () => $("body").localize());
      auth.languageCode = i18next.language;
    });
  }
});
