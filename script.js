/* ========== Firebase (keep your config) ========== */
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

/* ========== i18n ========== */
const resources = {
  en: { translation: {
    login:"Login", logout:"Logout", signUp:"Sign Up",
    dashboard:"Dashboard", addLicense:"Add License",
    verificationPortal:"Verification", analytics:"Analytics",
    userManagement:"User Management", verificationRequests:"Verification Requests",
    totalLicenses:"Total Licenses", activeLicenses:"Active Licenses",
    licensesList:"Licenses", licenseNumber:"License Number",
    fullName:"Full Name", class:"Class",
    issueDate:"Issue Date", expiryDate:"Expiry Date",
    status:"Status", action:"Action", email:"Email", role:"Role",
    verify:"Verify", organization:"Organization", country:"Country", purpose:"Purpose",
    date:"Date", result:"Result", requestedAt:"Requested At",
    analyticsDesc:"Verification statistics and system insights",
    totalVerifications:"Total Verifications", successfulVerifications:"Successful",
    failedVerifications:"Failed",

    verifyEmailFirst:"⚠️ Please verify your email before logging in. Verification link has been resent.",
    notApprovedYet:"⏳ Your account is not approved yet. Please wait for administrator approval.",
    loginSuccess:"✅ Login successful. Redirecting...",
    adminWelcome:"✅ Welcome Admin! Redirecting..."
  }},
  fr: { translation: {
    login:"Connexion", logout:"Déconnexion", signUp:"Créer un compte",
    dashboard:"Tableau de bord", addLicense:"Ajouter un permis",
    verificationPortal:"Vérification", analytics:"Analytique",
    userManagement:"Gestion des utilisateurs", verificationRequests:"Demandes de vérification",
    totalLicenses:"Nombre total de permis", activeLicenses:"Permis actifs",
    licensesList:"Permis", licenseNumber:"Numéro de permis",
    fullName:"Nom complet", class:"Catégorie",
    issueDate:"Date d’émission", expiryDate:"Date d’expiration",
    status:"Statut", action:"Action", email:"Email", role:"Rôle",
    verify:"Vérifier", organization:"Organisation", country:"Pays", purpose:"But",
    date:"Date", result:"Résultat", requestedAt:"Demandé le",
    analyticsDesc:"Statistiques de vérification et informations système",
    totalVerifications:"Vérifications totales", successfulVerifications:"Réussies",
    failedVerifications:"Échouées",

    verifyEmailFirst:"⚠️ Veuillez vérifier votre e-mail avant de vous connecter. Un lien de vérification a été renvoyé.",
    notApprovedYet:"⏳ Votre compte n’est pas encore approuvé. Veuillez attendre l’approbation de l’administrateur.",
    loginSuccess:"✅ Connexion réussie. Redirection…",
    adminWelcome:"✅ Bienvenue Admin ! Redirection…"
  }},
  ja: { translation: {
    login:"ログイン", logout:"ログアウト", signUp:"サインアップ",
    dashboard:"ダッシュボード", addLicense:"免許を追加",
    verificationPortal:"照合", analytics:"分析",
    userManagement:"ユーザー管理", verificationRequests:"照合リクエスト",
    totalLicenses:"総免許数", activeLicenses:"有効な免許",
    licensesList:"免許一覧", licenseNumber:"免許番号",
    fullName:"氏名", class:"区分",
    issueDate:"発行日", expiryDate:"有効期限",
    status:"ステータス", action:"操作", email:"メール", role:"ロール",
    verify:"照合", organization:"機関", country:"国", purpose:"目的",
    date:"日付", result:"結果", requestedAt:"要求日時",
    analyticsDesc:"照合の統計とシステムインサイト",
    totalVerifications:"照合総数", successfulVerifications:"成功",
    failedVerifications:"失敗",

    verifyEmailFirst:"⚠️ ログイン前にメール確認が必要です。確認リンクを再送しました。",
    notApprovedYet:"⏳ アカウントはまだ承認されていません。管理者の承認をお待ちください。",
    loginSuccess:"✅ ログイン成功。リダイレクト中…",
    adminWelcome:"✅ 管理者としてログイン。リダイレクト中…"
  }}
};

i18next.use(i18nextBrowserLanguageDetector).init(
  { resources, fallbackLng: "en" },
  function () {
    jqueryI18next.init(i18next, $, { useOptionsAttr: true });
    $("body").localize();
    auth.useDeviceLanguage();
    auth.languageCode = i18next.language || "en";
  }
);

document.addEventListener("DOMContentLoaded", () => {
  const switcher = document.getElementById("languageSwitcher");
  if (switcher) {
    switcher.addEventListener("change", function () {
      i18next.changeLanguage(this.value, () => $("body").localize());
      auth.languageCode = i18next.language;
    });
  }
});

/* ========== Helpers ========== */
function showMsg(text, ok=false){
  const el = document.getElementById("msg");
  if(el){ el.textContent = text; el.style.color = ok ? "green" : "red"; }
  else { alert(text); }
}

/* ========== Auth ========== */
async function loginUser(e){
  if(e) e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try{
    const cred = await auth.signInWithEmailAndPassword(email, password);

    if(!cred.user.emailVerified){
      showMsg(i18next.t("verifyEmailFirst"));
      await cred.user.sendEmailVerification();
      await auth.signOut();
      return;
    }

    const userDoc = await db.collection("users").doc(email).get();
    const status = userDoc.exists ? userDoc.data().status : "pending";
    const roleDoc = await db.collection("roles").doc(email).get();
    const role = roleDoc.exists ? roleDoc.data().role : "verifier";

    if(status !== "approved"){
      showMsg(i18next.t("notApprovedYet"));
      await auth.signOut();
      return;
    }

    if(role === "admin"){
      showMsg(i18next.t("adminWelcome"), true);
      setTimeout(()=> window.location.href="dashboard.html", 600);
    } else {
      showMsg(i18next.t("loginSuccess"), true);
      setTimeout(()=> window.location.href="verify.html", 600);
    }
  }catch(err){
    showMsg("❌ " + err.message);
    console.error(err);
  }
}

function signOutUser(){
  auth.signOut().then(()=> window.location.href="index.html");
}

async function resetPassword(){
  const emailInput = document.getElementById("email");
  const email = (emailInput && emailInput.value.trim()) || prompt("Enter your email to reset password:");
  if(!email) return;
  try{
    await auth.sendPasswordResetEmail(email);
    alert("Password reset email sent!");
  }catch(err){ alert("Error resetting password: " + err.message); }
}

/* ========== Auth gate per page ========== */
auth.onAuthStateChanged(async (user)=>{
  const currentPage = (window.location.pathname.split("/").pop()||"").toLowerCase();
  const adminPages = ["dashboard.html","add_licenses.html","analytics.html","users.html","verification_requests.html"];

  if(!user){
    if (adminPages.includes(currentPage)) window.location.href="index.html";
    return;
  }
  if(!user.emailVerified){
    showMsg(i18next.t("verifyEmailFirst"));
    await auth.signOut();
    return;
  }

  const userDoc = await db.collection("users").doc(user.email).get();
  const status = userDoc.exists ? userDoc.data().status : "pending";
  const roleDoc = await db.collection("roles").doc(user.email).get();
  const role = roleDoc.exists ? roleDoc.data().role : "verifier";

  if(status !== "approved"){
    showMsg(i18next.t("notApprovedYet"));
    await auth.signOut();
    return;
  }

  const navRequests = document.getElementById("navVerificationRequests");
  if (navRequests) navRequests.style.display = (role === "admin") ? "block" : "none";

  if(role === "admin"){
    if(currentPage === "dashboard.html"){ loadDashboardData(); loadLicensesTable(); }
    if(currentPage === "analytics.html"){ loadAnalyticsData(); }
    if(currentPage === "users.html"){ loadUsersData(); }
    if(currentPage === "verification_requests.html"){ loadVerificationRequests(); }
  } else {
    if (adminPages.includes(currentPage)) window.location.href="verify.html";
  }
});

/* ========== Dashboard & Licenses ========== */
async function loadDashboardData(){
  try{
    const snap = await db.collection("licenses").get();
    let total=0, active=0, suspended=0, expired=0;

    snap.forEach(doc=>{
      total++;
      const s = String(doc.data().status || "").toLowerCase();
      // robust matching in case values are saved as short labels like "Ac", "Sus", etc.
      if (s.startsWith("act")) active++;
      else if (s.startsWith("sus")) suspended++;
      else if (s.startsWith("exp")) expired++;
    });

    const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.textContent = val; };
    set("totalLicenses", total);
    set("activeLicenses", active);
    set("suspendedLicenses", suspended);
    set("expiredLicenses", expired);
  }catch(err){ console.error("Dashboard load error:", err); }
}

async function loadLicensesTable(){
  const tbody = document.querySelector("#licensesTable tbody");
  if(!tbody) return;
  tbody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";
  try{
    const snap = await db.collection("licenses").orderBy("licenseNumber").get();
    tbody.innerHTML = "";
    if(snap.empty){ tbody.innerHTML = "<tr><td colspan='7'>No licenses</td></tr>"; return; }
    snap.forEach(doc=>{
      const d = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.licenseNumber}</td>
        <td contenteditable="true" data-field="fullName" style="min-width:180px">${d.fullName || ""}</td>
        <td>
          <select data-field="class" style="min-width:110px">
            <option ${d.class==="Class A"?"selected":""}>Class A</option>
            <option ${d.class==="Class B"?"selected":""}>Class B</option>
            <option ${d.class==="Class C"?"selected":""}>Class C</option>
          </select>
        </td>
        <td><input type="date" data-field="issueDate" value="${d.issueDate || ""}" style="min-width:140px"></td>
        <td><input type="date" data-field="expiryDate" value="${d.expiryDate || ""}" style="min-width:140px"></td>
        <td>
          <select data-field="status" style="min-width:140px">
            <option ${d.status==="Active"?"selected":""}>Active</option>
            <option ${d.status==="Suspended"?"selected":""}>Suspended</option>
            <option ${d.status==="Expired"?"selected":""}>Expired</option>
          </select>
        </td>
        <td><button class="inline" onclick="saveLicenseRow('${d.licenseNumber}', this)">Save</button></td>
      `;
      tbody.appendChild(tr);
    });
  }catch(err){ console.error("loadLicensesTable error:", err); }
}

async function saveLicenseRow(licenseNumber, btn){
  try{
    const tr = btn.closest("tr");
    const payload = {};
    tr.querySelectorAll("[data-field]").forEach(el=>{
      const key = el.getAttribute("data-field");
      payload[key] = (el.tagName === "TD") ? el.textContent.trim() : el.value;
    });
    await db.collection("licenses").doc(licenseNumber).set(payload, { merge:true });
    showMsg("✅ License updated", true);
    loadDashboardData?.();
  }catch(err){ console.error("saveLicenseRow error:", err); }
}

/* ========== Verification ========== */
async function verifyLicense(e){
  if(e) e.preventDefault();

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
    const resultText = found ? "License found" : "License not found";
    const d = docRef.data() || {};

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

    if (resultEl){
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
          resultEl.style.display = "none";
          nextContainer.style.display = "none";
          document.getElementById("verifyLicenseNumber").focus();
        };
      }
    }

    showMsg(`✅ ${resultText}`, true);
  }catch(err){
    console.error("verifyLicense error:", err);
    showMsg("❌ Error verifying license: " + err.message);
  }
}

/* ========== Verification Requests (Admin page) ========== */
async function loadVerificationRequests(){
  try{
    const snapshot = await db.collection("verifications").orderBy("verifiedAt","desc").get();
    const tbody = document.getElementById("requestsTable");
    if(!tbody) return;
    tbody.innerHTML = "";
    if (snapshot.empty){
      tbody.innerHTML = "<tr><td colspan='7'>No verification requests</td></tr>";
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
  }catch(err){ console.error("Load requests error:", err); }
}

/* ========== Analytics ========== */
async function loadAnalyticsData(){
  try{
    const snapshot = await db.collection("verifications").orderBy("verifiedAt", "desc").limit(10).get();
    let total=0, success=0, fail=0;
    const tbody = document.getElementById("verificationLogs");
    if (!tbody) return;
    tbody.innerHTML = "";
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
  }catch(err){ console.error("Analytics load error:", err); }
}

/* ========== Users ========== */
async function loadUsersData(){
  try{
    const usersSnap = await db.collection("users").get();
    const rolesSnap = await db.collection("roles").get();
    const roleMap = {};
    rolesSnap.forEach(doc => roleMap[doc.id] = (doc.data().role || "verifier"));

    const tbody = document.getElementById("usersTable");
    if(!tbody) return;
    tbody.innerHTML = "";
    if(usersSnap.empty){ tbody.innerHTML = "<tr><td colspan='6'>No users found</td></tr>"; return; }

    usersSnap.forEach(doc=>{
      const u = doc.data();
      const role = roleMap[u.email] || u.role || "verifier";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td contenteditable="true" data-field="fullName" style="min-width:180px">${u.fullName || ""}</td>
        <td>${u.email}</td>
        <td>
          <select data-field="role" style="min-width:130px">
            <option ${role==="verifier"?"selected":""}>verifier</option>
            <option ${role==="admin"?"selected":""}>admin</option>
          </select>
        </td>
        <td>
          <select data-field="status" style="min-width:130px">
            <option ${u.status==="approved"?"selected":""}>approved</option>
            <option ${u.status==="pending"?"selected":""}>pending</option>
            <option ${u.status==="disabled"?"selected":""}>disabled</option>
          </select>
        </td>
        <td>
          <button class="btn-edit" style="background:#27ae60;color:#fff" onclick="updateUserRow('${u.email}', this)">Update</button>
          <button class="btn-delete" style="background:#e74c3c;color:#fff" onclick="deleteUser('${u.email}')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }catch(err){ console.error("User load error:", err); }
}

async function updateUserRow(email, btn){
  try{
    const tr = btn.closest("tr");
    const updates = {};
    tr.querySelectorAll("[data-field]").forEach(el=>{
      const key = el.getAttribute("data-field");
      updates[key] = (el.tagName === "TD") ? el.textContent.trim() : el.value;
    });

    await db.collection("users").doc(email).set({
      fullName: updates.fullName,
      status: updates.status,
      approved: updates.status === "approved"
    }, { merge: true });

    await db.collection("roles").doc(email).set({ role: updates.role }, { merge: true });

    showMsg("✅ User updated", true);
    loadUsersData();
  }catch(err){ console.error("updateUserRow error:", err); }
}

async function deleteUser(email){
  if(!confirm(`Are you sure you want to delete ${email}?`)) return;
  try{
    await db.collection("users").doc(email).delete();
    await db.collection("roles").doc(email).delete();
    showMsg("🗑️ User deleted", true);
    loadUsersData();
  }catch(err){ console.error("deleteUser error:", err); }
}

/* ========== Filters & CSV ========== */
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

/* ========== Expose to DOM ========== */
window.loginUser = loginUser;
window.signOutUser = signOutUser;
window.resetPassword = resetPassword;

window.loadDashboardData = loadDashboardData;
window.loadLicensesTable = loadLicensesTable;
window.saveLicenseRow = saveLicenseRow;

window.verifyLicense = verifyLicense;

window.loadVerificationRequests = loadVerificationRequests;

window.loadAnalyticsData = loadAnalyticsData;

window.loadUsersData = loadUsersData;
window.updateUserRow = updateUserRow;
window.deleteUser = deleteUser;

window.filterUsers = filterUsers;
window.filterLicenses = filterLicenses;
window.filterAnalytics = filterAnalytics;

window.exportTableToCSV = exportTableToCSV;
