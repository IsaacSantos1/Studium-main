import { auth, db } from "./firebase-config.js";

import { GoogleAuthProvider, signInWithPopup } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { collection, addDoc, onSnapshot, updateDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;

// LOGIN
document.querySelector(".nightLogo").onclick = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  currentUser = result.user;

  document.getElementById("username").innerText = currentUser.displayName;
  document.getElementById("userPfp").src = currentUser.photoURL;
};

// SEND MESSAGE
document.getElementById("sendBtn").onclick = async () => {
  const text = document.getElementById("messageInput").value;

  if (!text || !currentUser) {
    alert("Login first");
    return;
  }

  await addDoc(collection(db, "messages"), {
    text: text,
    user: currentUser.displayName,
    pfp: currentUser.photoURL,
    reactions: {}
  });

  document.getElementById("messageInput").value = "";
};

// LOAD MESSAGES
onSnapshot(collection(db, "messages"), (snapshot) => {
  const container = document.getElementById("messages");
  container.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const div = document.createElement("div");
    div.className = "message-box";

    div.innerHTML = `
  <div class="row">
    <img src="${data.pfp}" class="pfp">
    <b>${data.user}</b>
  </div>

  <div class="msg-content">
    ${data.text}
  </div>

  <div class="reactions">😀 😍 😂 🔥</div>
`;

    // REACTIONS
    div.querySelector(".reactions").onclick = async (e) => {
      const emoji = e.target.innerText;
      if (!emoji) return;

      const ref = doc(db, "messages", docSnap.id);
      const updated = data.reactions || {};

      updated[emoji] = (updated[emoji] || 0) + 1;

      await updateDoc(ref, { reactions: updated });
    };

    // SHOW COUNTS
    const reactDiv = div.querySelector(".reactions");
    reactDiv.innerHTML = Object.entries(data.reactions || {})
      .map(([k, v]) => `${k} ${v}`)
      .join(" ");

    container.appendChild(div);
  });
});