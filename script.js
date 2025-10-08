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

/* === i18n === */
const i18nResources = { /* (keep your translations exactly as before) */ };
i18next.use(i18nextBrowserLanguageDetector).init(
  { resources: i18nResources, fallbackLng: "en" },
  () => {
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
function showMsg(text, ok=false) {
  const el = document.getElementById("msg");
  if (el) {
    el.textContent = text;
    el.style.color = ok ? "green" : "red";
  } else alert(text);
}
function getPage() { return (window.location.pathname.split("/").pop() || "").toLowerCase(); }

/* ==========================================================
   AUTH
   ========================================================== */
async function loginUser(e){
  if (e) e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    if (!cred.user.emailVerified) {
      await cred.user.sendEmailVerification();
      showMsg(i18next.t("verifyEmailFirst"));
      await auth.signOut();
      return;
    }

    const roleDoc = await db.collection("roles").doc(email).get();
    const role = roleDoc.exists ? roleDoc.data().role : "verifier";

    if (role === "admin") {
      showMsg(i18next.t("adminWelcome"), true);
      setTimeout(()=> window.location.href="dashboard.html", 600);
    } else {
      showMsg(i18next.t("loginSuccess"), true);
      setTimeout(()=> window.location.href="verify.html", 600);
    }
  } catch(err) { showMsg("❌ " + err.message); }
}

function signOutUser(){ auth.signOut().then(()=> window.location.href="index.html"); }

async function resetPassword(){
  const email = document.getElementById("email")?.value.trim() || prompt("Enter your email:");
  if (!email) return;
  try {
    await auth.sendPasswordResetEmail(email);
    alert("Password reset email sent!");
  } catch(err){ alert("Error: " + err.message); }
}

/* === Auth Gate === */
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
  const adminOnly = document.getElementById("navVerificationRequests");
  if (adminOnly) adminOnly.style.display = (role === "admin") ? "block" : "none";
  if (role !== "admin" && adminPages.includes(page)) window.location.href = "verify.html";
});

/* ==========================================================
   DASHBOARD & LICENSES
   ========================================================== */
function initLicenseListener(){
  const table = document.getElementById("licensesTable");
  if (!table) return;
  const tbody = table.querySelector("tbody");

  db.collection("licenses").orderBy("licenseNumber").onSnapshot(snapshot=>{
    tbody.innerHTML = "";
    if (snapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='7'>No licenses</td></tr>";
      return;
    }
    let total=0, active=0, suspended=0, expired=0;
    snapshot.forEach(doc=>{
      const d = doc.data(); total++;
      const s = String(d.status || "").toLowerCase();
      if (s.startsWith("act")) active++;
      else if (s.startsWith("sus")) suspended++;
      else if (s.startsWith("exp")) expired++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.licenseNumber}</td>
        <td contenteditable="true" data-field="fullName">${d.fullName || ""}</td>
        <td><select data-field="class">
          <option ${d.class==="Class A"?"selected":""}>Class A</option>
          <option ${d.class==="Class B"?"selected":""}>Class B</option>
          <option ${d.class==="Class C"?"selected":""}>Class C</option>
        </select></td>
        <td><input type="date" data-field="issueDate" value="${d.issueDate||""}"></td>
        <td><input type="date" data-field="expiryDate" value="${d.expiryDate||""}"></td>
        <td><select data-field="status">
          <option ${d.status==="Active"?"selected":""}>Active</option>
          <option ${d.status==="Suspended"?"selected":""}>Suspended</option>
          <option ${d.status==="Expired"?"selected":""}>Expired</option>
        </select></td>
        <td><button class="inline btn-edit" onclick="saveLicenseRow('${d.licenseNumber}', this)">Save</button></td>`;
      tbody.appendChild(tr);
    });
    document.getElementById("totalLicenses").textContent = total;
    document.getElementById("activeLicenses").textContent = active;
    document.getElementById("suspendedLicenses").textContent = suspended;
    document.getElementById("expiredLicenses").textContent = expired;
  });
}

async function saveLicenseRow(licenseNumber, btn){
  try {
    const tr = btn.closest("tr");
    const payload = {};
    tr.querySelectorAll("[data-field]").forEach(el=>{
      const key = el.getAttribute("data-field");
      payload[key] = (el.tagName === "TD") ? el.textContent.trim() : el.value;
    });
    await db.collection("licenses").doc(licenseNumber).set(payload, { merge:true });
    showMsg("✅ License updated", true);
  } catch(err){ showMsg("❌ " + err.message); }
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
    form.reset(); showMsg("✅ License added", true);
  } catch(err){ showMsg("❌ Error adding license: " + err.message); }
}

/* ==========================================================
   VERIFICATION & ANALYTICS
   ========================================================== */
async function verifyLicense(e){
  if (e) e.preventDefault();
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
      licenseNumber, requestingOrg: org || "", country: country || "",
      email: auth.currentUser?.email || "", purpose: purpose || "",
      result: resultText,
      verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      verifiedBy: auth.currentUser?.uid || ""
    });

    if(resultEl){
      resultEl.style.display = "block";
      resultEl.innerHTML = `
        <h3>${found?"✅ License Found":"❌ License Not Found"}</h3>
        <p><strong>License #:</strong> ${licenseNumber}</p>
        ${found?`
          <p><strong>Full Name:</strong> ${d.fullName||"N/A"}</p>
          <p><strong>Class:</strong> ${d.class||"N/A"}</p>
          <p><strong>Issue:</strong> ${d.issueDate||"N/A"}</p>
          <p><strong>Expiry:</strong> ${d.expiryDate||"N/A"}</p>
          <p><strong>Status:</strong> ${d.status||"N/A"}</p>`:""}
        <hr>
        <p><strong>Organization:</strong> ${org||"—"}</p>
        <p><strong>Country:</strong> ${country||"—"}</p>
        <p><strong>Purpose:</strong> ${purpose||"—"}</p>`;
    }
    if(nextContainer){
      nextContainer.style.display="block";
      document.getElementById("verifyNextBtn").onclick=()=>{
        document.getElementById("verifyForm").reset();
        resultEl.style.display="none";
        nextContainer.style.display="none";
      };
    }
    showMsg(`✅ ${resultText}`, true);
  } catch(err){ console.error(err); showMsg("❌ Error: "+err.message); }
}

function initVerificationListener(){
  const tbody = document.getElementById("verificationLogs");
  const totalEl=document.getElementById("totalVerifications");
  const okEl=document.getElementById("successfulVerifications");
  const failEl=document.getElementById("failedVerifications");
  if(!tbody && !totalEl) return;

  db.collection("verifications").orderBy("verifiedAt","desc").onSnapshot(snapshot=>{
    let total=0, success=0, fail=0;
    if(tbody) tbody.innerHTML="";
    if(snapshot.empty){
      if(tbody) tbody.innerHTML="<tr><td colspan='5'>No verifications yet</td></tr>";
    }else{
      snapshot.forEach(doc=>{
        const d=doc.data(); total++;
        const res=(d.result||"").toLowerCase();
        if(res.includes("not found")||res.includes("fail")) fail++; else success++;
        if(tbody){
          const tr=document.createElement("tr");
          tr.innerHTML=`
            <td>${d.licenseNumber}</td>
            <td>${d.requestingOrg||""}</td>
            <td>${d.country||""}</td>
            <td>${d.result||""}</td>
            <td>${d.verifiedAt?d.verifiedAt.toDate().toLocaleString():""}</td>`;
          tbody.appendChild(tr);
        }
      });
    }
    if(totalEl) totalEl.textContent=total;
    if(okEl) okEl.textContent=success;
    if(failEl) failEl.textContent=fail;
  });
}

/* ==========================================================
   USERS & REQUESTS
   ========================================================== */
function initUserListener(){
  const tbody=document.getElementById("usersTable");
  if(!tbody) return;

  db.collection("users").onSnapshot(async snapshot=>{
    const rolesSnap=await db.collection("roles").get();
    const roles={}; rolesSnap.forEach(r=>roles[r.id]=(r.data().role||"verifier"));
    tbody.innerHTML="";
    if(snapshot.empty){
      tbody.innerHTML="<tr><td colspan='5'>No users</td></tr>";
      return;
    }
    snapshot.forEach(doc=>{
      const u=doc.data(); const role=roles[u.email]||u.role||"verifier";
      const tr=document.createElement("tr");
      tr.innerHTML=`
        <td contenteditable data-field="fullName">${u.fullName||""}</td>
        <td>${u.email}</td>
        <td><select data-field="role"><option ${role==="verifier"?"selected":""}>verifier</option><option ${role==="admin"?"selected":""}>admin</option></select></td>
        <td><select data-field="status"><option ${u.status==="approved"?"selected":""}>approved</option><option ${u.status==="pending"?"selected":""}>pending</option><option ${u.status==="disabled"?"selected":""}>disabled</option></select></td>
        <td><button class="btn-edit inline" onclick="updateUserRow('${u.email}',this)">Update</button>
        <button class="btn-delete inline" onclick="deleteUser('${u.email}')">Delete</button></td>`;
      tbody.appendChild(tr);
    });
  });
}

async function addNewUser(e){
  e.preventDefault();
  const name=document.getElementById("newUserName").value.trim();
  const email=document.getElementById("newUserEmail").value.trim();
  const role=document.getElementById("newUserRole").value;
  if(!name||!email) return showMsg("⚠️ Name & Email required");
  try{
    await db.collection("users").doc(email).set({fullName:name,email,status:"approved",approved:true});
    await db.collection("roles").doc(email).set({role});
    showMsg("✅ User added",true);
    e.target.reset();
  }catch(err){ showMsg("❌ "+err.message); }
}

async function updateUserRow(email,btn){
  const tr=btn.closest("tr");
  const updates={};
  tr.querySelectorAll("[data-field]").forEach(el=>{updates[el.dataset.field]=(el.tagName==="TD")?el.textContent.trim():el.value;});
  await db.collection("users").doc(email).set({fullName:updates.fullName,status:updates.status,approved:(updates.status==="approved")},{merge:true});
  await db.collection("roles").doc(email).set({role:updates.role},{merge:true});
  showMsg("✅ User updated",true);
}
async function deleteUser(email){
  if(!confirm(`Delete ${email}?`)) return;
  await db.collection("users").doc(email).delete();
  await db.collection("roles").doc(email).delete();
  showMsg("🗑️ User deleted",true);
}

function initRequestListener(){
  const tbody=document.getElementById("requestsTable");
  if(!tbody) return;
  db.collection("requests").orderBy("submittedAt","desc").onSnapshot(snapshot=>{
    tbody.innerHTML="";
    if(snapshot.empty){
      tbody.innerHTML="<tr><td colspan='7'>No requests</td></tr>"; return;
    }
    snapshot.forEach(doc=>{
      const r=doc.data();
      const tr=document.createElement("tr");
      tr.innerHTML=`
        <td>${r.fullName||""}</td><td>${r.email||""}</td><td>${r.organization||""}</td>
        <td>${r.phone||""}</td><td>${r.purpose||""}</td><td>${r.status||"pending"}</td>
        <td><button class="btn-edit inline" onclick="approveRequest('${doc.id}','${r.email}','${r.fullName}','${r.organization}','${r.phone}')">Approve</button>
        <button class="btn-delete inline" onclick="rejectRequest('${doc.id}')">Reject</button></td>`;
      tbody.appendChild(tr);
    });
  });
}

async function approveRequest(id,email,fullName,organization,phone){
  await db.collection("requests").doc(id).update({status:"approved"});
  await db.collection("users").doc(email).set({fullName,email,organization,phone,status:"approved",approved:true},{merge:true});
  await db.collection("roles").doc(email).set({role:"verifier"},{merge:true});
  showMsg(`✅ ${fullName} approved`,true);
}
async function rejectRequest(id){
  await db.collection("requests").doc(id).update({status:"rejected"});
  showMsg("🚫 Request rejected");
}

/* ==========================================================
   PAGE AUTO INIT
   ========================================================== */
document.addEventListener("DOMContentLoaded",()=>{
  const page=getPage();
  if(page==="dashboard.html") initLicenseListener();
  if(page==="analytics.html") initVerificationListener();
  if(page==="users.html"){
    initUserListener();
    const form=document.getElementById("addUserForm");
    if(form) form.addEventListener("submit",addNewUser);
  }
  if(page==="verification_requests.html"||page==="requests.html") initRequestListener();
});

/* === Expose Globals === */
window.loginUser=loginUser;
window.signOutUser=signOutUser;
window.resetPassword=resetPassword;
window.verifyLicense=verifyLicense;
window.addLicense=addLicense;
window.saveLicenseRow=saveLicenseRow;
window.addNewUser=addNewUser;
window.updateUserRow=updateUserRow;
window.deleteUser=deleteUser;
window.approveRequest=approveRequest;
window.rejectRequest=rejectRequest;
