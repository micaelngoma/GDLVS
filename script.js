/* =======================
   Firebase Setup
======================= */
const firebaseConfig = {
  apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.appspot.com",
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* =======================
   i18next Setup
======================= */
const resources = {
  en: {
    translation: {
      // Shared
      login: "Login",
      logout: "Logout",
      signUp: "Sign Up",
      dashboard: "Dashboard",
      addLicense: "Add License",
      verificationPortal: "Verification",
      analytics: "Analytics",
      userManagement: "User Management",
      verificationRequests: "Verification Requests",
      totalLicenses: "Total Licenses",
      activeLicenses: "Active Licenses",
      licensesList: "Licenses",
      licenseNumber: "License Number",
      fullName: "Full Name",
      class: "Class",
      issueDate: "Issue Date",
      expiryDate: "Expiry Date",
      status: "Status",
      action: "Action",
      email: "Email",
      role: "Role",
      verify: "Verify",
      organization: "Organization",
      country: "Country",
      purpose: "Purpose",
      date: "Date",
      result: "Result",
      requestedAt: "Requested At",

      // Index/Signup UI
      welcomeTitle: "Welcome",
      welcomeMessage:
        "Welcome to the Gabon Driver’s License Verification System — a secure platform designed to verify the authenticity of Gabonese driver’s license IDs.",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password",
      confirmPasswordPlaceholder: "Confirm Password",
      fullNamePlaceholder: "Full Name",
      organizationPlaceholder: "Organization / Company / Agency",
      phonePlaceholder: "Phone Number",
      createAccount: "Create an Account",
      noAccount: "Don’t have an account?",
      signupHere: "Sign up here",
      alreadyHave: "Already have an account?",
      loginHere: "Login here",
      forgotPassword: "Forgot Password?",

      approvalNotice:
        "Note: Your account must be approved by an administrator before you can use the verification system.",

      // Alerts / flows
      enterEmailForReset: "Enter your email to reset password:",
      resetEmailSent: "Password reset email sent!",
      resetError: "Error resetting password: ",
      verifyEmailFirst:
        "⚠️ Please verify your email before logging in. Verification link has been resent.",
      notApprovedYet:
        "⏳ Your account is not approved yet. Please wait for administrator approval.",
      loginSuccess: "✅ Login successful. Redirecting...",
      adminWelcome: "✅ Welcome Admin! Redirecting...",
      logoutSuccess: "You have been signed out.",
      // Signup alerts + email texts
      passwordsNoMatch: "Passwords do not match.",
      signupSuccessTitle: "✅ Account created!",
      signupSuccessBody:
        "Your account has been created. A verification email was sent. The administrator will review and approve your account within 72 hours.",
      signupThanksConfirm:
        "Thank you for signing up! Please check your email for confirmation.",
      adminEmailSubject: "New Verifier Signup Request",
      adminEmailBody:
        "A new verifier has registered and is pending approval.",
      userConfirmEmailSubject: "Account Creation Confirmation",
      userConfirmEmailBody72h:
        "Your account has been successfully created. It will be reviewed and approved by the administrator within 72 hours. You will be granted access once your request is approved.",
    },
  },
  fr: {
    translation: {
      // Shared
      login: "Connexion",
      logout: "Déconnexion",
      signUp: "Créer un compte",
      dashboard: "Tableau de bord",
      addLicense: "Ajouter un permis",
      verificationPortal: "Vérification",
      analytics: "Analytique",
      userManagement: "Gestion des utilisateurs",
      verificationRequests: "Demandes de vérification",
      totalLicenses: "Nombre total de permis",
      activeLicenses: "Permis actifs",
      licensesList: "Permis",
      licenseNumber: "Numéro de permis",
      fullName: "Nom complet",
      class: "Catégorie",
      issueDate: "Date d’émission",
      expiryDate: "Date d’expiration",
      status: "Statut",
      action: "Action",
      email: "Email",
      role: "Rôle",
      verify: "Vérifier",
      organization: "Organisation",
      country: "Pays",
      purpose: "But",
      date: "Date",
      result: "Résultat",
      requestedAt: "Demandé le",

      // Index/Signup UI
      welcomeTitle: "Bienvenue",
      welcomeMessage:
        "Bienvenue sur le Système de Vérification des Permis de Conduire du Gabon — une plateforme sécurisée conçue pour vérifier l’authenticité des permis de conduire gabonais.",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Mot de passe",
      confirmPasswordPlaceholder: "Confirmez le mot de passe",
      fullNamePlaceholder: "Nom complet",
      organizationPlaceholder: "Organisation / Entreprise / Agence",
      phonePlaceholder: "Numéro de téléphone",
      createAccount: "Créer un compte",
      noAccount: "Vous n’avez pas de compte ?",
      signupHere: "Inscrivez-vous ici",
      alreadyHave: "Vous avez déjà un compte ?",
      loginHere: "Connectez-vous ici",
      forgotPassword: "Mot de passe oublié ?",

      approvalNotice:
        "Remarque : votre compte doit être approuvé par un administrateur avant de pouvoir utiliser le système de vérification.",

      // Alerts / flows
      enterEmailForReset: "Entrez votre e-mail pour réinitialiser le mot de passe :",
      resetEmailSent: "E-mail de réinitialisation envoyé !",
      resetError: "Erreur de réinitialisation du mot de passe : ",
      verifyEmailFirst:
        "⚠️ Veuillez vérifier votre e-mail avant de vous connecter. Un lien de vérification a été renvoyé.",
      notApprovedYet:
        "⏳ Votre compte n’est pas encore approuvé. Veuillez attendre l’approbation de l’administrateur.",
      loginSuccess: "✅ Connexion réussie. Redirection…",
      adminWelcome: "✅ Bienvenue Admin ! Redirection…",
      logoutSuccess: "Vous avez été déconnecté.",
      // Signup alerts + email texts
      passwordsNoMatch: "Les mots de passe ne correspondent pas.",
      signupSuccessTitle: "✅ Compte créé !",
      signupSuccessBody:
        "Votre compte a été créé. Un e-mail de vérification a été envoyé. L’administrateur examinera et approuvera votre compte dans les 72 heures.",
      signupThanksConfirm:
        "Merci pour votre inscription ! Veuillez vérifier votre e-mail pour confirmation.",
      adminEmailSubject: "Nouvelle demande d’inscription de vérificateur",
      adminEmailBody:
        "Un nouveau vérificateur s’est inscrit et est en attente d’approbation.",
      userConfirmEmailSubject: "Confirmation de création de compte",
      userConfirmEmailBody72h:
        "Votre compte a été créé avec succès. Il sera examiné et approuvé par l’administrateur dans un délai de 72 heures. Vous aurez accès une fois votre demande approuvée.",
    },
  },
  ja: {
    translation: {
      // Shared
      login: "ログイン",
      logout: "ログアウト",
      signUp: "サインアップ",
      dashboard: "ダッシュボード",
      addLicense: "免許を追加",
      verificationPortal: "照合",
      analytics: "分析",
      userManagement: "ユーザー管理",
      verificationRequests: "照合リクエスト",
      totalLicenses: "総免許数",
      activeLicenses: "有効な免許",
      licensesList: "免許一覧",
      licenseNumber: "免許番号",
      fullName: "氏名",
      class: "区分",
      issueDate: "発行日",
      expiryDate: "有効期限",
      status: "ステータス",
      action: "操作",
      email: "メール",
      role: "ロール",
      verify: "照合",
      organization: "機関",
      country: "国",
      purpose: "目的",
      date: "日付",
      result: "結果",
      requestedAt: "要求日時",

      // Index/Signup UI
      welcomeTitle: "ようこそ",
      welcomeMessage:
        "ガボン運転免許証認証システムへようこそ。これは、ガボンの運転免許証の真正性を確認するために設計された安全なプラットフォームです。",
      emailPlaceholder: "メールアドレス",
      passwordPlaceholder: "パスワード",
      confirmPasswordPlaceholder: "パスワード（確認）",
      fullNamePlaceholder: "氏名",
      organizationPlaceholder: "所属（会社／省庁／機関）",
      phonePlaceholder: "電話番号",
      createAccount: "アカウント作成",
      noAccount: "アカウントをお持ちではありませんか？",
      signupHere: "こちらから登録",
      alreadyHave: "すでにアカウントをお持ちですか？",
      loginHere: "こちらからログイン",
      forgotPassword: "パスワードをお忘れですか？",

      approvalNotice:
        "注意：本システムを利用するには、管理者の承認が必要です。",

      // Alerts / flows
      enterEmailForReset: "パスワードリセット用のメールアドレスを入力してください：",
      resetEmailSent: "パスワードリセットメールを送信しました！",
      resetError: "パスワードリセットエラー：",
      verifyEmailFirst:
        "⚠️ ログイン前にメール確認が必要です。確認リンクを再送しました。",
      notApprovedYet:
        "⏳ アカウントはまだ承認されていません。管理者の承認をお待ちください。",
      loginSuccess: "✅ ログイン成功。リダイレクト中…",
      adminWelcome: "✅ 管理者としてログイン。リダイレクト中…",
      logoutSuccess: "サインアウトしました。",
      // Signup alerts + email texts
      passwordsNoMatch: "パスワードが一致しません。",
      signupSuccessTitle: "✅ アカウントを作成しました！",
      signupSuccessBody:
        "アカウントが作成されました。確認メールを送信しました。管理者が72時間以内に審査・承認します。",
      signupThanksConfirm:
        "ご登録ありがとうございます！確認のためメールをチェックしてください。",
      adminEmailSubject: "新しい認証担当者の登録申請",
      adminEmailBody:
        "新しい認証担当者が登録し、承認待ちです。",
      userConfirmEmailSubject: "アカウント作成の確認",
      userConfirmEmailBody72h:
        "アカウントが正常に作成されました。管理者によって72時間以内に確認および承認されます。リクエストが承認されるとアクセスが許可されます。",
    },
  },
};

i18next.use(i18nextBrowserLanguageDetector).init(
  { resources, fallbackLng: "en" },
  function () {
    jqueryI18next.init(i18next, $, { useOptionsAttr: true });
    $("body").localize();

    // Sync Auth email language with UI/browser
    auth.useDeviceLanguage();
    auth.languageCode = i18next.language || "en";
  }
);

// Language switcher
document.addEventListener("DOMContentLoaded", () => {
  const switcher = document.getElementById("languageSwitcher");
  if (switcher) {
    switcher.addEventListener("change", function () {
      i18next.changeLanguage(this.value, () => {
        $("body").localize();
        auth.languageCode = i18next.language;
      });
    });
  }
});

/* =======================
   Utilities
======================= */
function showMsg(text, ok = false) {
  const el = document.getElementById("msg");
  if (el) {
    el.textContent = text;
    el.style.color = ok ? "green" : "red";
  } else {
    alert(text);
  }
}

/* =======================
   Auth: Login / Logout
======================= */
async function loginUser(e) {
  if (e) e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);

    if (!cred.user.emailVerified) {
      showMsg(i18next.t("verifyEmailFirst"));
      await cred.user.sendEmailVerification();
      await auth.signOut();
      return;
    }

    // Approval check
    const userDoc = await db.collection("users").doc(email).get();
    const status = userDoc.exists ? userDoc.data().status : "pending";
    const roleDoc = await db.collection("roles").doc(email).get();
    const role = roleDoc.exists ? roleDoc.data().role : "verifier";

    if (status !== "approved") {
      showMsg(i18next.t("notApprovedYet"));
      await auth.signOut();
      return;
    }

    if (role === "admin") {
      showMsg(i18next.t("adminWelcome"), true);
      setTimeout(() => (window.location.href = "dashboard.html"), 800);
    } else {
      showMsg(i18next.t("loginSuccess"), true);
      setTimeout(() => (window.location.href = "verify.html"), 800);
    }
  } catch (err) {
    showMsg("❌ " + err.message);
    console.error("Login error:", err);
  }
}

function signOutUser() {
  auth.signOut().then(() => (window.location.href = "index.html"));
}

/* =======================
   Auth: Forgot Password
======================= */
async function resetPassword() {
  const emailInput = document.getElementById("email");
  const email =
    (emailInput && emailInput.value.trim()) ||
    prompt(i18next.t("enterEmailForReset"));

  if (!email) return;
  try {
    await auth.sendPasswordResetEmail(email);
    alert(i18next.t("resetEmailSent"));
  } catch (err) {
    alert(i18next.t("resetError") + err.message);
  }
}

/* =======================
   Signup
   - Validates confirm password
   - Stores profile (approved=false, status=pending)
   - Sends email verification
   - Creates Firestore "outbox" docs for admin + user confirmation (placeholders)
======================= */
async function signupUser(e) {
  e.preventDefault();

  const fullName = document.getElementById("signupFullName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const organization = document.getElementById("organization").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (password !== confirmPassword) {
    showMsg(i18next.t("passwordsNoMatch"));
    return;
  }

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: fullName });

    // Store role and user profile
    await db.collection("roles").doc(email).set({ email, role: "verifier" });
    await db.collection("users").doc(email).set({
      email,
      fullName,
      organization,
      phone,
      role: "verifier",
      status: "pending",
      approved: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Send verification email
    await cred.user.sendEmailVerification();

    // ======= EMAIL PLACEHOLDERS (no Cloud Functions) =======
    // Create Firestore "outbox" documents that a backend job or admin can process to send real emails.
    const lang = i18next.language || "en";
    const adminSubject = i18next.t("adminEmailSubject");
    const adminBody = `${i18next.t("adminEmailBody")}
- Name: ${fullName}
- Email: ${email}
- Org: ${organization}
- Phone: ${phone}`;

    const userSubject = i18next.t("userConfirmEmailSubject");
    const userBody = i18next.t("userConfirmEmailBody72h");

    await db.collection("outbox").add({
      type: "adminSignup",
      to: "m.ngoma1988@gmail.com",
      subject: adminSubject,
      body: adminBody,
      meta: { signupEmail: email, lang },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: "queued",
    });

    await db.collection("outbox").add({
      type: "userConfirmation",
      to: email,
      subject: userSubject,
      body: userBody,
      meta: { lang },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: "queued",
    });
    // ======= END PLACEHOLDERS =======

    // Localized success messages
    alert(i18next.t("signupThanksConfirm"));
    showMsg(`${i18next.t("signupSuccessTitle")} ${i18next.t("signupSuccessBody")}`, true);

    await auth.signOut();
    setTimeout(() => (window.location.href = "index.html"), 1200);
  } catch (err) {
    console.error("Signup error:", err);
    showMsg("❌ " + err.message);
  }
}

/* =======================
   Role-based Access (kept for other pages)
======================= */
auth.onAuthStateChanged(async (user) => {
  const currentPage = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const adminPages = [
    "dashboard.html",
    "add_licenses.html",
    "analytics.html",
    "users.html",
    "verification_requests.html",
  ];

  if (!user) {
    if (adminPages.includes(currentPage)) window.location.href = "index.html";
    return;
  }

  if (!user.emailVerified) {
    showMsg(i18next.t("verifyEmailFirst"));
    await auth.signOut();
    return;
  }

  const userDoc = await db.collection("users").doc(user.email).get();
  const status = userDoc.exists ? userDoc.data().status : "pending";
  const roleDoc = await db.collection("roles").doc(user.email).get();
  const role = roleDoc.exists ? roleDoc.data().role : "verifier";

  if (status !== "approved") {
    showMsg(i18next.t("notApprovedYet"));
    await auth.signOut();
    return;
  }

  const navRequests = document.getElementById("navVerificationRequests");
  if (navRequests) navRequests.style.display = role === "admin" ? "block" : "none";

  // Lazy loaders for admin pages
  if (role === "admin") {
    if (currentPage === "dashboard.html") {
      loadDashboardData?.();
      loadLicensesTable?.();
    }
    if (currentPage === "analytics.html") loadAnalyticsData?.();
    if (currentPage === "users.html") loadUsersData?.();
    if (currentPage === "verification_requests.html") loadVerificationRequests?.();
  } else {
    if (adminPages.includes(currentPage)) window.location.href = "verify.html";
  }
});

/* =======================
   Existing Admin/User/Verify helpers
   (kept from your previous app; unchanged except for minor i18n alerts)
======================= */
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
  db.collection("licenses")
    .doc(licenseNumber)
    .set({
      licenseNumber,
      fullName,
      class: licenseClass,
      issueDate,
      expiryDate,
      status: "Active",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.currentUser ? auth.currentUser.uid : null,
    })
    .then(() => {
      showMsg("✅ License added!", true);
      document.getElementById("addLicenseForm").reset();
    })
    .catch((err) => showMsg("❌ Error adding license: " + err.message));
}

async function loadDashboardData() {
  try {
    const snapshot = await db.collection("licenses").get();
    let total = 0,
      active = 0;
    snapshot.forEach((doc) => {
      total++;
      if (doc.data().status === "Active") active++;
    });
    const tl = document.getElementById("totalLicenses");
    const al = document.getElementById("activeLicenses");
    if (tl) tl.innerText = total;
    if (al) al.innerText = active;
  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

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

// Verify page flow (unchanged but robust)
async function verifyLicense(e) {
  if (e) e.preventDefault();

  const licenseNumber = document.getElementById("verifyLicenseNumber").value.trim();
  const org = document.getElementById("verifyOrg").value.trim();
  const country = document.getElementById("verifyCountry").value.trim();
  const purpose = document.getElementById("verifyPurpose").value.trim();
  const resultEl = document.getElementById("verifyResult");
  const nextContainer = document.getElementById("verifyNextContainer");

  if (!licenseNumber) {
    showMsg("⚠️ License number required");
    return;
  }

  try {
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
      verifiedBy: auth.currentUser?.uid || "",
    });

    if (resultEl) {
      resultEl.style.display = "block";
      resultEl.innerHTML = `
        <h3>${found ? "✅ License Found" : "❌ License Not Found"}</h3>
        <p><strong>License #:</strong> ${licenseNumber}</p>
        ${
          found
            ? `
          <p><strong>Full Name:</strong> ${d.fullName || "N/A"}</p>
          <p><strong>Class:</strong> ${d.class || "N/A"}</p>
          <p><strong>Issue Date:</strong> ${d.issueDate || "N/A"}</p>
          <p><strong>Expiry Date:</strong> ${d.expiryDate || "N/A"}</p>
          <p><strong>Status:</strong> ${d.status || "N/A"}</p>`
            : ""
        }
        <hr>
        <p><strong>Organization:</strong> ${org || "—"}</p>
        <p><strong>Country:</strong> ${country || "—"}</p>
        <p><strong>Purpose:</strong> ${purpose || "—"}</p>`;
    }

    if (nextContainer) {
      nextContainer.style.display = "block";
      const btn = document.getElementById("verifyNextBtn");
      if (btn) {
        btn.onclick = () => {
          document.getElementById("verifyForm").reset();
          resultEl.style.display = "none";
          nextContainer.style.display = "none";
          document.getElementById("verifyLicenseNumber").focus();
        };
      }
    }

    showMsg(`✅ ${resultText}`, true);
  } catch (err) {
    console.error("verifyLicense error:", err);
    showMsg("❌ Error verifying license: " + err.message);
  }
}

async function loadAnalyticsData() {
  try {
    const snapshot = await db
      .collection("verifications")
      .orderBy("verifiedAt", "desc")
      .limit(10)
      .get();
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
        <td>${d.verifiedAt ? d.verifiedAt.toDate().toLocaleString() : ""}</td>`;
      tbody.appendChild(tr);
    });
    const tv = document.getElementById("totalVerifications");
    const sv = document.getElementById("successfulVerifications");
    const fv = document.getElementById("failedVerifications");
    if (tv) tv.innerText = total;
    if (sv) sv.innerText = success;
    if (fv) fv.innerText = fail;
  } catch (err) {
    console.error("Analytics load error:", err);
  }
}

async function loadVerificationRequests() {
  try {
    const snapshot = await db
      .collection("verifications")
      .orderBy("verifiedAt", "desc")
      .get();
    const tbody = document.getElementById("requestsTable");
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
        <td>${d.verifiedAt ? d.verifiedAt.toDate().toLocaleString() : ""}</td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Load requests error:", err);
  }
}

async function loadUsersData() {
  try {
    const usersSnap = await db.collection("users").get();
    const rolesSnap = await db.collection("roles").get();
    const roleMap = {};
    rolesSnap.forEach((doc) => (roleMap[doc.id] = doc.data().role || "verifier"));

    const tbody = document.getElementById("usersTable");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (usersSnap.empty) {
      tbody.innerHTML = "<tr><td colspan='6'>No users found</td></tr>";
      return;
    }

    usersSnap.forEach((doc) => {
      const u = doc.data();
      const role = roleMap[u.email] || u.role || "verifier";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td contenteditable="true" data-field="fullName">${u.fullName || ""}</td>
        <td>${u.email}</td>
        <td>
          <select data-field="role">
            <option ${role === "verifier" ? "selected" : ""}>verifier</option>
            <option ${role === "admin" ? "selected" : ""}>admin</option>
          </select>
        </td>
        <td>
          <select data-field="status">
            <option ${u.status === "approved" ? "selected" : ""}>approved</option>
            <option ${u.status === "pending" ? "selected" : ""}>pending</option>
            <option ${u.status === "disabled" ? "selected" : ""}>disabled</option>
          </select>
        </td>
        <td>
          <button class="btn-edit" onclick="updateUserRow('${u.email}', this)">Update</button>
          <button class="btn-delete" onclick="deleteUser('${u.email}')">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("User load error:", err);
  }
}

async function updateUserRow(email, btn) {
  try {
    const tr = btn.closest("tr");
    const updates = {};
    tr.querySelectorAll("[data-field]").forEach((el) => {
      const key = el.getAttribute("data-field");
      updates[key] = el.tagName === "TD" ? el.textContent.trim() : el.value;
    });

    await db.collection("users").doc(email).set(
      {
        fullName: updates.fullName,
        status: updates.status,
        approved: updates.status === "approved",
      },
      { merge: true }
    );
    await db.collection("roles").doc(email).set({ role: updates.role }, { merge: true });

    showMsg("✅ User updated", true);
    loadUsersData();
  } catch (err) {
    console.error("updateUserRow error:", err);
  }
}

async function deleteUser(email) {
  if (!confirm(`Are you sure you want to delete ${email}?`)) return;
  try {
    await db.collection("users").doc(email).delete();
    await db.collection("roles").doc(email).delete();
    showMsg("🗑️ User deleted", true);
    loadUsersData();
  } catch (err) {
    console.error("deleteUser error:", err);
  }
}

/* =======================
   Table Filters + CSV export
======================= */
function filterUsers() {
  const query = (document.getElementById("userSearch")?.value || "").toLowerCase();
  document.querySelectorAll("#usersTable tr").forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(query) ? "" : "none";
  });
}
function filterLicenses() {
  const query = (document.getElementById("licenseSearch")?.value || "").toLowerCase();
  document.querySelectorAll("#licensesTable tbody tr").forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(query) ? "" : "none";
  });
}
function filterRequests() {
  const query = (document.getElementById("requestSearch")?.value || "").toLowerCase();
  document.querySelectorAll("#requestsTable tr").forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(query) ? "" : "none";
  });
}
function filterAnalytics() {
  const query = (document.getElementById("analyticsSearch")?.value || "").toLowerCase();
  document.querySelectorAll("#verificationLogs tr").forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(query) ? "" : "none";
  });
}

function exportTableToCSV(tableId, baseFilename) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = table.querySelectorAll("tr");
  const csv = [];
  rows.forEach((row) => {
    const cols = row.querySelectorAll("th, td");
    const rowData = [];
    cols.forEach((col) => rowData.push(`"${col.innerText.replace(/"/g, '""')}"`));
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

/* =======================
   Global Exports
======================= */
window.loginUser = loginUser;
window.signOutUser = signOutUser;
window.resetPassword = resetPassword;

window.signupUser = signupUser;

window.addLicense = addLicense;
window.loadDashboardData = loadDashboardData;
window.loadLicensesTable = loadLicensesTable;
window.saveLicenseRow = saveLicenseRow;

window.verifyLicense = verifyLicense;
window.loadAnalyticsData = loadAnalyticsData;
window.loadVerificationRequests = loadVerificationRequests;

window.loadUsersData = loadUsersData;
window.updateUserRow = updateUserRow;
window.deleteUser = deleteUser;

window.filterUsers = filterUsers;
window.filterLicenses = filterLicenses;
window.filterRequests = filterRequests;
window.filterAnalytics = filterAnalytics;

window.exportTableToCSV = exportTableToCSV;
