import { auth, db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const params = new URLSearchParams(window.location.search);
const boardId = params.get("boardId");

document.addEventListener("DOMContentLoaded", () => {
  const messagesContainer = document.getElementById("messages");
  const sendBtn = document.getElementById("sendBtn");
  const messageInput = document.getElementById("messageInput");
  const boardName = document.getElementById("boardName");

  if (!boardId) {
    alert("Invalid board ID");
    window.location.href = "main.html";
    return;
  }

  boardName.textContent = `Study Board: ${boardId}`;

  let currentUser = null;

  // ✅ AUTH STATE (fixes null user issue + sets UI)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;

      document.getElementById("username").textContent =
        user.displayName || "Anonymous";

      document.getElementById("userPfp").src =
        user.photoURL || "";
    } else {
      window.location.href = "Home.html";
    }
  });

  // ✅ SEND MESSAGE
  sendBtn.addEventListener("click", async () => {
    const text = messageInput.value.trim();
    if (!text) return;

    if (!currentUser) {
      alert("You must be signed in.");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        boardId: boardId,
        text: text,
        user: currentUser.displayName || "Anonymous",
        pfp: currentUser.photoURL || "",
        timestamp: serverTimestamp(),
      });

      messageInput.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // ✅ REALTIME LISTENER (requires Firestore index)
  const q = query(
    collection(db, "messages"),
    where("boardId", "==", boardId),
    orderBy("timestamp", "asc")
  );

  onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = "";

    snapshot.forEach((doc) => {
      const data = doc.data();

      const div = document.createElement("div");
      div.classList.add("message-box");

      div.innerHTML = `
        <div class="row">
          <img class="pfp" src="${data.pfp || ''}">
          <b>${data.user}</b>
        </div>
        <div class="msg-content">${data.text}</div>
      `;

      messagesContainer.appendChild(div);
    });
  });
});