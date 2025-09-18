// lang.js content
// public/lang.js
// i18next language resources + helpers
i18next.use(i18nextBrowserLanguageDetector).init({
  debug: false,
  fallbackLng: "en",
  resources: {
    en: { translation: {
      appName:"Gabon Driver’s License Verification System",
      loginTitle:"Welcome to GDLVS", loginSubtitle:"Sign in to continue",
      email:"Email", password:"Password", signin:"Sign In", signup:"Register",
      dashboard:"Dashboard", licenses:"License Management", verify:"Verification Portal",
      analytics:"Analytics", users:"User Management", logout:"Logout",
      addLicense:"Add License", editLicense:"Edit License", save:"Save",
      verifyLicense:"Verify License", logs:"Verification Logs", role:"Role",
      admin:"Admin", staff:"Staff", verifier:"Verifier", auditor:"Auditor",
      licNumber:"License Number", fullName:"Full Name", status:"Status",
      issueDate:"Issue Date", expiryDate:"Expiry Date", actions:"Actions",
      organization:"Requesting Organization", country:"Country", officialEmail:"Official Email",
      purpose:"Purpose", result:"Result", notAuthorized:"Not authorized for this page"
    }},
    fr: { translation: {
      appName:"Système Gabonais de Vérification du Permis de Conduire",
      loginTitle:"Bienvenue à GDLVS", loginSubtitle:"Connectez-vous pour continuer",
      email:"E-mail", password:"Mot de passe", signin:"Se connecter", signup:"S’inscrire",
      dashboard:"Tableau de Bord", licenses:"Gestion des Permis", verify:"Portail de Vérification",
      analytics:"Analytique", users:"Gestion des Utilisateurs", logout:"Déconnexion",
      addLicense:"Ajouter un Permis", editLicense:"Modifier le Permis", save:"Enregistrer",
      verifyLicense:"Vérifier le Permis", logs:"Journaux de Vérification", role:"Rôle",
      admin:"Administrateur", staff:"Personnel", verifier:"Vérificateur", auditor:"Auditeur",
      licNumber:"Numéro de Permis", fullName:"Nom Complet", status:"Statut",
      issueDate:"Date de Délivrance", expiryDate:"Date d'Expiration", actions:"Actions",
      organization:"Organisation Demanderesse", country:"Pays", officialEmail:"Email Officiel",
      purpose:"Objet", result:"Résultat", notAuthorized:"Accès non autorisé à cette page"
    }},
    ja: { translation: {
      appName:"ガボン運転免許証認証システム",
      loginTitle:"GDLVSへようこそ", loginSubtitle:"続行するにはサインインしてください",
      email:"メールアドレス", password:"パスワード", signin:"ログイン", signup:"登録",
      dashboard:"ダッシュボード", licenses:"免許管理", verify:"認証ポータル",
      analytics:"分析", users:"ユーザー管理", logout:"ログアウト",
      addLicense:"免許を追加", editLicense:"免許を編集", save:"保存",
      verifyLicense:"免許を確認", logs:"認証ログ", role:"役割",
      admin:"管理者", staff:"スタッフ", verifier:"検証者", auditor:"監査人",
      licNumber:"免許番号", fullName:"氏名", status:"状態",
      issueDate:"交付日", expiryDate:"有効期限", actions:"操作",
      organization:"申請機関", country:"国", officialEmail:"公的メール",
      purpose:"目的", result:"結果", notAuthorized:"このページの権限がありません"
    }}
  }
}, () => updateContent());

// Translate all elements with [data-i18n]
function updateContent() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (key.startsWith("[")) {
      // attribute translation, e.g. [placeholder]email
      const parts = key.split("]");
      const attr = parts[0].replace("[", "");
      const tkey = parts[1];
      el.setAttribute(attr, i18next.t(tkey));
    } else {
      el.innerHTML = i18next.t(key);
    }
  });
}
function changeLng(lng) { i18next.changeLanguage(lng, updateContent); }
