// =================== Firebase Setup ===================
var firebaseConfig = {
  apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.appspot.com",
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db   = firebase.firestore();

// Capstone: admin emails (UI gating only; server-side rules already enforce)
var ADMIN_EMAILS = ["m.ngoma1988@gmail.com", "ngomamicaelc@gmail.com"];

// =================== Common Helpers ===================
function showAlert(message, type = "error") {
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert " + (type === "success" ? "success" : "error");
  alertDiv.innerText = message;
  document.body.prepend(alertDiv);
  setTimeout(() => alertDiv.remove(), 3500);
}
function fmtDate(ts) {
  try {
    if (!ts) return "—";
    if (typeof ts.toDate === "function") return ts.toDate().toLocaleString();
    return new Date(ts).toLocaleString();
  } catch { return "—"; }
}

// =================== Auth Guard (basic) ===================
auth.onAuthStateChanged(user => {
  const page = location.pathname.split("/").pop();

  // Protect these pages
  const protectedPages = ["dashboard.html","add_license.html","analytics.html","logs.html","backups.html","backupLogs.html"];
  if (!user && protectedPages.includes(page)) {
    location.href = "index.html";
    return;
  }

  // Admin-only page protection (client-side convenience; rules still protect server)
  if (user && page === "add_license.html" && !ADMIN_EMAILS.includes(user.email)) {
    alert("You don’t have permission to access License Management.");
    location.href = "dashboard.html";
    return;
  }

  // Put user email in sidebar (when present)
  const emailSlots = ["currentUserEmail","lmCurrentUserEmail","anCurrentUserEmail"];
  emailSlots.forEach(id => { const el=document.getElementById(id); if (el && user) el.textContent=user.email; });

  // Page hooks
  if (user) {
    if (page === "dashboard.html") {
      loadDashboardStats();
      loadRecentVerifications();
    }
    if (page === "analytics.html") {
      loadAnalytics();
    }
    if (page === "add_license.html") {
      loadLicenseList(); // list table
    }
  }
});

function signOutUser(){
  auth.signOut().then(()=>location.href="index.html");
}

// =================== Auth (Login from index.html) ===================
function loginUser() {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;
  if (!email || !password) return showAlert("Please enter email and password.");
  auth.signInWithEmailAndPassword(email, password)
    .then(()=> location.href = "dashboard.html")
    .catch(err=> showAlert(err.message));
}
window.loginUser = loginUser;
window.signOutUser = signOutUser;

// =================== License Management ===================
function addLicense() {
  const licenseNumber = document.getElementById("licenseNumber").value.trim();
  const fullName      = document.getElementById("fullName").value.trim();
  const licenseClass  = document.getElementById("licenseClass").value;
  const issueDate     = document.getElementById("issueDate").value;
  const expiryDate    = document.getElementById("expiryDate").value;
  const status        = document.getElementById("statusSelect")?.value || "Active";

  if (!licenseNumber || !fullName || !licenseClass || !issueDate || !expiryDate) {
     showAlert("Please fill in all fields."); return;
  }

  const ref = db.collection("licenses").doc(licenseNumber);
  ref.get().then(snap=>{
    if (snap.exists) { showAlert("License already exists!"); return Promise.reject("exists"); }
    return ref.set({
      licenseNumber, fullName, class: licenseClass, status,
      issueDate, expiryDate,
      addedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.currentUser ? auth.currentUser.email : null
    });
  }).then(()=>{
    showAlert("License added successfully!", "success");
    document.getElementById("addLicenseForm").reset();
    loadLicenseList();
  }).catch(err=>{ if (err!=="exists") showAlert("Error adding license: "+err); });
}
window.addLicense = addLicense;

// Table state for filters
let _licensesCache = [];
function loadLicenseList(){
  db.collection("licenses").orderBy("licenseNumber").get().then(snap=>{
    _licensesCache = snap.docs.map(d=>({ id:d.id, ...d.data() }));
    renderLicenseRows(_licensesCache);
  });
}
function renderLicenseRows(rows){
  const tb = document.getElementById("licenseTable");
  if (!tb) return;
  if (!rows.length) { tb.innerHTML = `<tr><td colspan="6" class="muted">No licenses found.</td></tr>`; return; }
  tb.innerHTML = rows.map(r=>`
    <tr>
      <td>${r.licenseNumber || r.id}</td>
      <td>${r.fullName || "—"}</td>
      <td><span class="badge">${r.class || "—"}</span></td>
      <td>${r.status === "Expired" ? `<span class="badge" style="background:#fff1f2;color:#b91c1c">Expired</span>` :
                                      `<span class="badge" style="background:#ecfdf5;color:#166534">Active</span>`}</td>
      <td>${r.issueDate || "—"}</td>
      <td>${r.expiryDate || "—"}</td>
    </tr>
  `).join("");
}
function filterLicenseList(){
  const q = document.getElementById("licenseSearch").value.trim().toLowerCase();
  const st = document.getElementById("filterStatus").value;
  const cls = document.getElementById("filterClass").value;
  const filtered = _licensesCache.filter(r=>{
    const textMatch = (r.licenseNumber||"").toLowerCase().includes(q) || (r.fullName||"").toLowerCase().includes(q);
    const statusOk = !st || (r.status===st);
    const classOk  = !cls || (r.class===cls);
    return textMatch && statusOk && classOk;
  });
  renderLicenseRows(filtered);
}
window.filterLicenseList = filterLicenseList;

// =================== Public Verification (verify.html uses this) ===================
function verifyLicense() {
  const licenseNumber = document.getElementById("verifyLicenseNumber").value.trim();
  const requestingOrg = document.getElementById("requestingOrg")?.value.trim();
  const country       = document.getElementById("country")?.value.trim();
  const email         = document.getElementById("email")?.value.trim();
  const purpose       = document.getElementById("purpose")?.value.trim();

  if (!licenseNumber) return showAlert("Please enter a license number.");

  db.collection("licenses").doc(licenseNumber).get().then(doc=>{
    const div = document.getElementById("verificationResult");
    let html="";
    if (!doc.exists){
      html = `<p><b>Status:</b> Not Found</p>`;
    } else {
      const d = doc.data();
      html = `
        <p><b>Name:</b> ${d.fullName}</p>
        <p><b>Class:</b> ${d.class}</p>
        <p><b>Status:</b> ${d.status}</p>
        <p><b>Issue Date:</b> ${d.issueDate}</p>
        <p><b>Expiry Date:</b> ${d.expiryDate}</p>
      `;
    }
    div.innerHTML = html;

    // Log verification (admins can read logs; collection write allowed to admins per rules.
    // If anonymous users must log, relax rules; for capstone we keep write by admins via server actions)
    db.collection("verifications").add({
      licenseNumber, requestingOrg, country, email, purpose,
      result: doc.exists ? "Verified" : "Not Found",
      verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(()=>{/* ignore if rules block non-admin; UI still works */});
  }).catch(err=>showAlert("Error verifying: "+err));
}
window.verifyLicense = verifyLicense;

// =================== Dashboard ===================
function loadDashboardStats(){
  const lastEl = document.getElementById("lastUpdated");
  if (lastEl) lastEl.textContent = new Date().toLocaleTimeString();

  // Total + Active + expired check
  db.collection("licenses").get().then(snap=>{
    const total = snap.size;
    let active = 0, expired = 0;
    const today = new Date().toISOString().slice(0,10);
    snap.forEach(doc=>{
      const d = doc.data();
      if (d.status === "Active") active++;
      if (d.expiryDate && d.expiryDate < today) expired++;
    });

    setText("kpiTotal", total);
    setText("kpiActive", active);
    setText("statTotal", total);
    setWidth("barActive", total ? Math.round((active/total)*100) : 0);

    const alertExpired = document.getElementById("alertExpired");
    if (alertExpired) alertExpired.textContent = `${expired} Expired License(s)`;
  });

  // Today verifications + success rate last 7 days
  const startOfToday = new Date(); startOfToday.setHours(0,0,0,0);
  const sevenDaysAgo = new Date(Date.now()-6*24*60*60*1000); sevenDaysAgo.setHours(0,0,0,0);

  db.collection("verifications").where("verifiedAt",">=", firebase.firestore.Timestamp.fromDate(sevenDaysAgo)).get().then(snap=>{
    let todayCount = 0, success=0, total=0;
    snap.forEach(doc=>{
      total++;
      const d = doc.data();
      if (d.result === "Verified" || d.result === "License found") success++;
      if (d.verifiedAt && d.verifiedAt.toDate() >= startOfToday) todayCount++;
    });

    setText("kpiToday", todayCount);
    setText("statVerifications", total);

    const rate = total? Math.round((success/total)*100) : 0;
    setText("kpiSuccess", rate + "%");
    setWidth("barSuccess", rate);
  });
}
function loadRecentVerifications(){
  db.collection("verifications").orderBy("verifiedAt","desc").limit(15).get().then(snap=>{
    const rows = snap.docs.map(d=>({ id:d.id, ...d.data() }));
    _recentCache = rows;
    renderRecent(rows);
  });
}
let _recentCache = [];
function renderRecent(rows){
  const tb = document.getElementById("recentTable");
  if (!tb) return;
  if (!rows.length){ tb.innerHTML = `<tr><td colspan="5" class="muted">No recent requests.</td></tr>`; return; }
  tb.innerHTML = rows.map(r=>`
    <tr>
      <td>${r.licenseNumber || "—"}</td>
      <td>${r.requestingOrg || "—"}</td>
      <td>${r.country || "—"}</td>
      <td>${r.result === "Verified" || r.result === "License found" ? 
        '<span class="badge" style="background:#ecfdf5;color:#166534">Verified</span>' :
        (r.result === "Expired" ? '<span class="badge" style="background:#fff7ed;color:#9a3412">Expired</span>' :
        '<span class="badge" style="background:#fef2f2;color:#991b1b">Not Found</span>')}</td>
      <td>${fmtDate(r.verifiedAt)}</td>
    </tr>
  `).join("");
}
function filterRecentVerifications(){
  const q = document.getElementById("recentSearch").value.trim().toLowerCase();
  const filtered = _recentCache.filter(r =>
    (r.licenseNumber||"").toLowerCase().includes(q) ||
    (r.requestingOrg||"").toLowerCase().includes(q) ||
    (r.country||"").toLowerCase().includes(q)
  );
  renderRecent(filtered);
}
window.filterRecentVerifications = filterRecentVerifications;

function setText(id,val){ const el=document.getElementById(id); if(el) el.textContent=val; }
function setWidth(id,p){ const el=document.getElementById(id); if(el) el.style.width = Math.max(0,Math.min(100,p))+"%"; }

// =================== Analytics ===================
function loadAnalytics(){
  Promise.all([
    db.collection("licenses").get(),
    db.collection("verifications").get()
  ]).then(([licSnap, verSnap])=>{
    // License statuses
    let active=0, expired=0;
    const today = new Date().toISOString().slice(0,10);
    licSnap.forEach(d=>{
      const x=d.data();
      if (x.expiryDate && x.expiryDate < today) expired++; else active++;
    });

    // Classes
    const classesCount = {"Class A":0,"Class B":0,"Class C":0,"Class D":0};
    licSnap.forEach(d=>{ const c=d.data().class; if (classesCount[c]!=null) classesCount[c]++; });

    // Verification results
    let verified=0, notFound=0, other=0;
    verSnap.forEach(d=>{
      const r=d.data().result;
      if (r==="Verified" || r==="License found") verified++;
      else if (r==="Not Found") notFound++;
      else other++;
    });

    // Draw charts
    drawPie("chartStatus",
      ["Active","Expired"],
      [active,expired]
    );
    drawBar("chartClasses",
      Object.keys(classesCount),
      Object.values(classesCount)
    );
    drawBar("chartResults",
      ["Verified","Not Found","Other"],
      [verified,notFound,other]
    );
  });
}
function drawPie(canvasId, labels, data){
  const ctx = document.getElementById(canvasId);
  if (!ctx || !window.Chart) return;
  new Chart(ctx, {
    type:"doughnut",
    data:{ labels, datasets:[{ data }]},
    options:{ responsive:true, plugins:{ legend:{ position:"bottom"} } }
  });
}
function drawBar(canvasId, labels, data){
  const ctx = document.getElementById(canvasId);
  if (!ctx || !window.Chart) return;
  new Chart(ctx, {
    type:"bar",
    data:{ labels, datasets:[{ data }]},
    options:{ responsive:true, plugins:{ legend:{ display:false } } }
  });
}
