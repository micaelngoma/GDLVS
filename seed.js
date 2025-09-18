<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Seed Admin</title>
  <script type="module">
    import { auth, db } from "./firebase.js";
    import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
    import { setDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("Please log in first at index.html");
        location.href = "index.html";
        return;
      }

      try {
        await setDoc(doc(db, "roles", user.uid), { role: "admin" });
        alert("✅ User " + user.email + " is now ADMIN!");
      } catch (err) {
        console.error(err);
        alert("❌ Failed to assign admin: " + err.message);
      }
    });
  </script>
</head>
<body>
  <h2>Seeding Admin Role...</h2>
</body>
</html>
