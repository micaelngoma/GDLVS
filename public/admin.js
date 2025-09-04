import { firebaseApp } from "./firebase-config.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
const auth=getAuth(firebaseApp);const db=getFirestore(firebaseApp);
document.getElementById('year').textContent=new Date().getFullYear();
onAuthStateChanged(auth,u=>{document.getElementById('authCard').hidden=!!u;document.getElementById('adminPanel').hidden=!u;});
document.getElementById('loginForm')?.addEventListener('submit',async e=>{e.preventDefault();await signInWithEmailAndPassword(auth,email.value,password.value);});
document.getElementById('signOut')?.addEventListener('click',()=>signOut(auth));
document.getElementById('upsertLicense')?.addEventListener('submit',async e=>{e.preventDefault();const ln=a_licenseNumber.value;const fn=a_fullName.value;const dob=a_dob.value;const status=a_status.value;await setDoc(doc(db,'licenses',ln),{licenseNumber:ln,fullName:fn,dob,status});alert('Saved');});