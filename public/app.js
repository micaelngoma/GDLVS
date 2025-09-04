import { firebaseApp } from "./firebase-config.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
const db = getFirestore(firebaseApp);
document.getElementById('year').textContent = new Date().getFullYear();
async function sha256Hex(str){const enc=new TextEncoder();const buf=await crypto.subtle.digest('SHA-256',enc.encode(str));return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');}
document.getElementById('verifyForm').addEventListener('submit',async e=>{e.preventDefault();const ln=document.getElementById('licenseNumber').value.trim();const dob=document.getElementById('dob').value;const key=await sha256Hex(ln+'|'+dob);const snap=await getDoc(doc(db,'public_index',key));const result=document.getElementById('result');if(snap.exists()){result.textContent=JSON.stringify(snap.data());} else {result.textContent='Not found';}result.hidden=false;});