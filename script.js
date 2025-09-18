// === Firebase setup (gdlvs-system) ===
var firebaseConfig = {
  apiKey: "AIzaSyBiZN1G3ShoDOcPLe-bUILNf90NpdcCu6k",
  authDomain: "gdlvs-2348e.firebaseapp.com",
  projectId: "gdlvs-2348e",
  storageBucket: "gdlvs-2348e.firebasestorage.app",
  messagingSenderId: "358715790318",
  appId: "1:358715790318:web:9d4c85e0f71222cf1b34ff"
};

// Initialize Firebase (avoid double init)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
var auth = firebase.auth();
var db = firebase.firestore();

// [CHANGED] Removed ADMIN_EMAILS from frontend to avoid leaking who is admin.
// Access is enforced in Firestore Rules by whitelisted emails only.

// === Multilingual Resources ===
const resources = {
  en: { translation: {
    "title": "Gabon License Verifier",
    "home": "Home",
    "login": "Login",
    "signup": "Sign Up",
    "logout": "Logout",
    "email": "Email",
    "password": "Password",
    "licenseNumber": "License Number",
    "organization": "Requesting Organization",    // [CHANGED] wording
    "country": "Country",
    "purpose": "Purpose of Verification",
    "verify": "Verify Licence",                   // [CHANGED] UK spelling per request
    "dashboard": "Dashboard",
    "addLicense": "Add License",
    "verificationPortal": "Verification Portal",
    "totalLicenses": "Total Licenses",
    "activeLicenses": "Active Licenses",
    "fullName": "Full Name",
    "class": "Class",
    "issueDate": "Issue Date",
    "expiryDate": "Expiry Date"
  }},
  fr: { translation: {
    "title": "Vérificateur de Permis du Gabon",
    "home": "Accueil",
    "login": "Connexion",
    "signup": "Créer un Compte",
    "logout": "Déconnexion",
    "email": "E-mail",
    "password": "Mot de passe",
    "licenseNumber": "Numéro de Permis",
    "organization": "Organisation Requérante",   // [CHANGED]
    "country": "Pays",
    "purpose": "But de la Vérificatio
