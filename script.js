/* ==========================================================
   GDLVS – Unified Frontend Core (Auth, i18n, Realtime Sync)
   ========================================================== */

/* === Firebase Initialization === */
const firebaseConfig = {
  apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.appspot.com",
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

/* === i18n (placeholders used in HTML) === */
const i18nResources = {
  en: { translation: {
    // core
    login:"Login", logout:"Logout", verify:"Verify", dashboard:"Dashboard",
    addLicense:"Add License", verificationPortal:"Verification", analytics:"Analytics",
    userManagement:"User Management", verificationRequests:"Verification Requests",
    requestAccess:"Request Access", accessRequests:"Access Requests",
    backToDashboard:"Back to Dashboard",
    // placeholders
    emailPlaceholder:"Email", passwordPlaceholder:"Password",
    fullNamePlaceholder:"Full Name", organizationPlaceholder:"Organization / Company / Agency",
    phonePlaceholder:"Phone Number", purposePlaceholder:"Purpose of access...",
    // messages
    welcomeTitle:"Welcome",
    welcomeMessage:"Welcome to the Gabon Driver’s License Verification System (GDLVS) — a secure platform designed to verify the authenticity of Gabonese driver’s license IDs.",
    verifyEmailFirst:"⚠️ Please verify your email before logging in. Verification link has been resent.",
    notApprovedYet:"⏳ Your account is not approved yet. Please wait for administrator approval.",
    loginSuccess:"✅ Login successful. Redirecting...",
    adminWelcome:"✅ Welcome Admin! Redirecting…",
    forgotPassword:"Forgot Password?", noAccount:"Don’t have an account?",
    requestAccessHere:"Request access here",
    submitRequest:"Submit Request", approvalNotice:"Note: Your request will be reviewed by the administrator before you can access the system.",
    // analytics
    totalLicenses:"Total Licenses", activeLicenses:"Active Licenses",
    licensesList:"Licenses", licenseNumber:"License Number",
    fullName:"Full Name", class:"Class",
    issueDate:"Issue Date", expiryDate:"Expiry Date",
    status:"Status", action:"Action",
    organization:"Organization", country:"Country", purpose:"Purpose",
    date:"Date", result:"Result", requestedAt:"Requested At",
    totalVerifications:"Total Verifications", successfulVerifications:"Successful",
    failedVerifications:"Failed", recentVerifications:"Recent Verifications",
  }},
  fr: { translation: {
    login:"Connexion", logout:"Déconnexion", verify:"Vérifier", dashboard:"Tableau de bord",
    addLicense:"Ajouter un permis", verificationPortal:"Vérification", analytics:"Analytique",
    userManagement:"Gestion des utilisateurs", verificationRequests:"Demandes de vérification",
    requestAccess:"Demande d’accès", accessRequests:"Demandes d’accès",
    backToDashboard:"Retour au tableau de bord",
    emailPlaceholder:"Email", passwordPlaceholder:"Mot de passe",
    fullNamePlaceholder:"Nom complet", organizationPlaceholder:"Organisation / Société / Agence",
    phonePlaceholder:"Numéro de téléphone", purposePlaceholder:"But d’accès…",
    welcomeTitle:"Bienvenue",
    welcomeMessage:"Bienvenue sur le système GDLVS — une plateforme sécurisée conçue pour vérifier l’authenticité des permis de conduire gabonais.",
    verifyEmailFirst:"⚠️ Veuillez vérifier votre e-mail avant de vous connecter. Un lien de vérification a été renvoyé.",
    notApprovedYet:"⏳ Votre compte n’est pas encore approuvé. Veuillez patienter.",
    loginSuccess:"✅ Connexion réussie. Redirection…",
    adminWelcome:"✅ Bienvenue Admin ! Redirection…",
    forgotPassword:"Mot de passe oublié ?", noAccount:"Vous n’avez pas de compte ?",
    requestAccessHere:"Demander l’accès ici",
    submitRequest:"Soumettre la demande", approvalNotice:"Remarque : votre demande sera examinée par l’administrateur avant d’accéder au système.",
    totalLicenses:"Nombre total de permis", activeLicenses:"Permis actifs",
    licensesList:"Permis", licenseNumber:"Numéro de permis",
    fullName:"Nom complet", class:"Catégorie",
    issueDate:"Date d’émission", expiryDate:"Date d’expiration",
    status:"Statut", action:"Action",
    organization:"Organisation", country:"Pays", purpose:"But",
    date:"Date", result:"Résultat", requestedAt:"Demandé le",
    totalVerifications:"Vérifications totales", successfulVerifications:"Réussies",
    failedVerifications:"Échouées", recentVerifications:"Vérifications récentes",
  }},
  ja: { translation: {
    login:"ログイン", logout:"ログアウト", verify:"照合", dashboard:"ダッシュボード",
    addLicense:"免許を追加", verificationPortal:"照合", analytics:"分析",
    userManagement:"ユーザー管理", verificationRequests:"照合リクエスト",
    requestAccess:"アクセス申請", accessRequests:"アクセス申請",
    backToDashboard:"ダッシュボードに戻る",
    emailPlaceholder:"メール", passwordPlaceholder:"パスワード",
    fullNamePlaceholder:"氏名", organizationPlaceholder:"組織 / 会社 / 機関",
    phonePlaceholder:"電話番号", purposePlaceholder:"アクセス目的…",
    welcomeTitle:"ようこそ",
    welcomeMessage:"GDLVS はガボン運転免許証の真正性を確認するための安全なプラットフォームです。",
    verifyEmailFirst:"⚠️ ログイン前にメール確認が必要です。確認リンクを再送しました。",
    notApprovedYet:"⏳ アカウントは未承認です。管理者の承認をお待ちください。",
    loginSuccess:"✅ ログイン成功。リダイレクト中…",
    adminWelcome:"✅ 管理者としてログイン。リダイレクト中…",
    forgotPassword:"パスワードをお忘れですか？", noAccount:"アカウントがありませんか？",
    requestAccessHere:"こちらから申請", submitRequest:"申請を送信",
    approvalNotice:"注：アクセス前に、管理者が申請を審査します。",
    totalLicenses:"総免許数", activeLicenses:"有効な免許",
    licensesList:"免許一覧", licenseNumber:"免許番号",
    fullName:"氏名", class:"区分",
    issueDate:"発行日", expiryDate:"有効期限",
    status:"ステータス", action:"操作",
    organization:"機関", country:"国", purpose:"目的",
    date:"日付", result:"結果", requestedAt:"要求日時",
    totalVerifications:"照合総数", successfulVerifications:"成功",
    failedVerifications:"失敗", recentVerifications:"最近の照合",
  }}
};

i18next.use(i18nextBrowserLanguageDetector).init(
  { resources: i18nResources, fallbackLng: "en" },
  function () {
    if (typeof jqueryI18next !== "undefined") {
      jqueryI18next.init(i18next, $, { useOptionsAttr: true });
      $("body").localize();
    }
    auth.useDeviceLanguage();
    auth.languageCode = i18next.language || "en";
  }
);

/* === Language Switcher === */
document.addEventListener("DOMContentLoaded", () => {
  const switcher = document.getElementById("languageSwitcher");
  if (switcher) {
    switcher.addEventListener("change", function () {
      i18next.changeLanguage(this.value, () => $("body").localize());
      auth.languageCode = i18next.language;
    });
  }
});

/* === Helpers === */
function showMsg(text, ok=false){
  const el = document.getElementById("msg");
  if (el) { el.textContent = text; el.style.color = ok ? "green" : "red"; }
  else { alert(text); }
}
function getPage() {
  return (window.location.pathname.split("/").pop() || "").toLowerCase();
}

/* ==========================================================
   AUTH
   ========================================================== */
async function loginUser(e){
  if (e) e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try{
    const cred = await auth.signInWithEmailAndPassword(email, password);

    if (!cred.user.emailVerified) {
      await cred.user.sendEmailVerification();
      showMsg(i18next.t("verifyEmailFirst"));
      await auth.signOut();
      return;
    }

    // Admin decides access; you add verifiers manually.
    const roleDoc = await db.collection("roles").doc(email).get();
    const role = roleDoc.exists ? roleDoc.data().role : "verifier";

    if (role === "admin") {
      showMsg(i18next.t("adminWelcome"), true);
      setTimeout(()=> window.location.href="dashboard.html", 600);
    } else {
      showMsg(i18next.t("loginSuccess"), true);
      setTimeout(()=> window.location.href="verify.html", 600);
    }
  }catch(err){
    showMsg("❌ " + err.message);
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

/* === Auth Gate: route protection per page === */
auth.onAuthStateChanged(async (user)=>{
  const page = getPage();
  const adminPages = ["dashboard.html","add_licenses.html","analytics.html","users.html","verification_requests.html","requests.html"];

  if (!user) {
    if (adminPages.includes(page) || page === "verify.html") window.location.href="index.html";
    return;
  }
  if (!user.emailVerified) {
    showMsg(i18next.t("verifyEmailFirst"));
    await auth.signOut();
    return;
  }

  const roleDoc = await db.collection("roles").doc(user.email).get();
  const role = roleDoc.exists ? roleDoc.data().role : "verifier";

  // Toggle admin-only nav item (if present)
  const adminOnly = document.getElementById("navVerificationRequests");
  if (adminOnly) adminOnly.style.display = (role === "admin") ? "block" : "none";

  // Hard blocks
  if (role !== "admin" && adminPages.includes(page)) {
    window.location.href = "verify.html";
  }
});

/* ==========================================================
   DASHBOARD & LICENSES – REALTIME
   ========================================================== */
function initLicenseListener(){
  const table = document.getElementById("licensesTable");
  if (!table) return;
  const tbody = table.querySelector("tbody");

  db.collection("licenses").orderBy("licenseNumber").onSnapshot((snapshot) => {
    tbody.innerHTML = "";
    if (snapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='7'>No licenses</td></tr>";
      return;
    }
    let total=0, active=0, suspended=0, expired=0;

    snapshot.forEach(doc=>{
      const d = doc.data();
      total++;
      const s = String(d.status || "").toLowerCase();
      if (s.startsWith("act")) active++;
      else if (s.startsWith("sus")) suspended++;
      else if (s.startsWith("exp")) expired++;

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
        <td><button class="inline btn-edit" onclick="saveLicenseRow('${d.licenseNumber}', this)">Save</button></td>
      `;
      tbody.appendChild(tr);
    });

    // update cards if present
    const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.textContent = val; };
    set("totalLicenses", total);
    set("activeLicenses", active);
    set("suspendedLicenses", suspended);
    set("expiredLicenses", expired);
  });
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
  }catch(err){ showMsg("❌ " + err.message); }
}

async function addLicense(){
  const form = document.getElementById("addLicenseForm");
  if (!form) return;
  const data = {
    licenseNumber: form.licenseNumber.value.trim(),
    fullName: form.fullName.value.trim(),
    class: form.licenseClass.value,
    issueDate: form.issueDate.value,
    expiryDate: form.expiryDate.value,
    status: "Active"
  };
  if (!data.licenseNumber) return showMsg("⚠️ License number required");

  try {
    await db.collection("licenses").doc(data.licenseNumber).set(data);
    showMsg("✅ License added successfully", true);
    form.reset();
  } catch (err) {
    showMsg("❌ Error adding license: " + err.message);
  }
}

/* ==========================================================
   VERIFICATION – WRITE LOG + LIVE ANALYTICS
   ========================================================== */
async function verifyLicense(e){
  if(e) e.preventDefault();

  const licenseNumber = document.getElementById("verifyLicenseNumber")?.value.trim();
  const org = document.getElementById("verifyOrg")?.value.trim();
  const country = document.getElementById("verifyCountry")?.value.trim();
  const purpose = document.getElementById("verifyPurpose")?.value.trim();
  const resultEl = document.getElementById("verifyResult");
  const nextContainer = document.getElementById("verifyNextContainer");

  if(!licenseNumber){ showMsg("⚠️ License number required"); return; }

  try{
    const docRef = await db.collection("licenses").doc(licenseNumber).get();
    const found = docRef.exists;
    const d = docRef.data() || {};
    const resultText = found ? "License found" : "License not found";

    await db.collection("verifications").add({
      licenseNumber,
      requestingOrg: org || "",
      country: country || "",
      email: auth.currentUser?.email || "",
      purpose: purpose || "",
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
          document.getElementById("verifyForm")?.reset();
          if (resultEl) resultEl.style.display = "none";
          nextContainer.style.display = "none";
          document.getElementById("verifyLicenseNumber")?.focus();
        };
      }
    }

    showMsg(`✅ ${resultText}`, true);
  }catch(err){
    console.error("verifyLicense error:", err);
    showMsg("❌ Error verifying license: " + err.message);
  }
}

/* === Analytics (live list + counters) === */
function initVerificationListener(){
  const tbody = document.getElementById("verificationLogs");
  const totalEl = document.getElementById("totalVerifications");
  const okEl = document.getElementById("successfulVerifications");
  const failEl = document.getElementById("failedVerifications");
  if (!tbody && !totalEl) return;

  db.collection("verifications").orderBy("verifiedAt","desc")
    .limit(50).onSnapshot((snapshot)=>{
      let total=0, success=0, fail=0;
      if (tbody) tbody.innerHTML = "";

      if (snapshot.empty) {
        if (tbody) tbody.innerHTML = "<tr><td colspan='5'>No verifications yet</td></tr>";
      } else {
        snapshot.forEach(doc=>{
          const d = doc.data(); total++;
          if ((d.result||"").toLowerCase().includes("found")) success++; else fail++;
          if (tbody) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${d.licenseNumber}</td>
              <td>${d.requestingOrg || ""}</td>
              <td>${d.country || ""}</td>
              <td>${d.result || ""}</td>
              <td>${d.verifiedAt ? d.verifiedAt.toDate().toLocaleString() : ""}</td>
            `;
            tbody.appendChild(tr);
          }
        });
      }
      if (totalEl) totalEl.textContent = total;
      if (okEl) okEl.textContent = success;
      if (failEl) failEl.textContent = fail;
    });
}

/* ==========================================================
   USERS – REALTIME (Admin)
   ========================================================== */
function initUserListener(){
  const tbody = document.getElementById("usersTable");
  if (!tbody) return;

  db.collection("users").onSnapshot(async (snapshot) => {
    // Preload roles map
    const rolesSnap = await db.collection("roles").get();
    const roles = {};
    rolesSnap.forEach(r => roles[r.id] = (r.data().role || "verifier"));

    tbody.innerHTML = "";
    if (snapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='5'>No users found</td></tr>";
      return;
    }

    snapshot.forEach((doc) => {
      const u = doc.data();
      const role = roles[u.email] || u.role || "verifier";
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
          <button class="btn-edit inline" onclick="updateUserRow('${u.email}', this)">Update</button>
          <button class="btn-delete inline" onclick="deleteUser('${u.email}')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
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
      fullName: updates.fullName || "",
      status: updates.status || "pending",
      approved: (updates.status === "approved")
    }, { merge: true });

    await db.collection("roles").doc(email).set({ role: updates.role || "verifier" }, { merge: true });

    showMsg("✅ User updated", true);
  }catch(err){ console.error("updateUserRow error:", err); showMsg("❌ " + err.message); }
}

async function deleteUser(email){
  if(!confirm(`Are you sure you want to delete ${email}?`)) return;
  try{
    await db.collection("users").doc(email).delete();
    await db.collection("roles").doc(email).delete();
    showMsg("🗑️ User deleted", true);
  }catch(err){ console.error("deleteUser error:", err); showMsg("❌ " + err.message); }
}

/* Filters */
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

/* Export CSV */
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

/* ==========================================================
   ACCESS REQUESTS – REALTIME (Admin)
   ========================================================== */
function initRequestListener(){
  const wrapper = document.getElementById("requestsTable");
  const tbody = wrapper ? wrapper.querySelector("tbody") : null;
  if (!tbody) return;

  db.collection("requests").orderBy("submittedAt","desc").onSnapshot((snapshot)=>{
    tbody.innerHTML = "";
    if (snapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='7'>No requests found.</td></tr>";
      return;
    }

    snapshot.forEach(doc=>{
      const r = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.fullName || ""}</td>
        <td>${r.email || ""}</td>
        <td>${r.organization || ""}</td>
        <td>${r.phone || ""}</td>
        <td>${r.purpose || ""}</td>
        <td>${r.status || "pending"}</td>
        <td>
          <button class="btn-edit inline" onclick="approveRequest('${doc.id}','${r.email}','${r.fullName}','${r.organization}','${r.phone}')">Approve</button>
          <button class="btn-delete inline" onclick="rejectRequest('${doc.id}')">Reject</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

async function approveRequest(id, email, fullName, organization, phone) {
  try {
    await db.collection("requests").doc(id).update({ status: "approved" });

    await db.collection("users").doc(email).set({
      fullName: fullName || "",
      email,
      organization: organization || "",
      phone: phone || "",
      status: "approved",
      approved: true
    }, { merge: true });

    await db.collection("roles").doc(email).set({ role: "verifier" }, { merge: true });

    showMsg(`✅ ${fullName} approved and added as verifier`, true);
  } catch (err) {
    console.error("approveRequest error:", err);
    showMsg("❌ " + err.message);
  }
}

async function rejectRequest(id) {
  try {
    await db.collection("requests").doc(id).update({ status: "rejected" });
    showMsg("🚫 Request rejected");
  } catch (err) {
    console.error("rejectRequest error:", err);
    showMsg("❌ " + err.message);
  }
}

/* ==========================================================
   PAGE AUTO-INIT
   ========================================================== */
document.addEventListener("DOMContentLoaded", ()=>{
  const page = getPage();
  if (page === "dashboard.html") initLicenseListener();
  if (page === "add_licenses.html") {/* no listener needed; uses addLicense() */}
  if (page === "analytics.html") initVerificationListener();
  if (page === "users.html") initUserListener();
  if (page === "verification_requests.html") initVerificationListener();
  if (page === "requests.html") initRequestListener();
});

/* === Expose for inline HTML handlers === */
window.loginUser = loginUser;
window.signOutUser = signOutUser;
window.resetPassword = resetPassword;

window.verifyLicense = verifyLicense;
window.addLicense = addLicense;
window.saveLicenseRow = saveLicenseRow;

window.filterUsers = filterUsers;
window.filterLicenses = filterLicenses;
window.filterAnalytics = filterAnalytics;

window.exportTableToCSV = exportTableToCSV;

window.updateUserRow = updateUserRow;
window.deleteUser = deleteUser;

window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;
