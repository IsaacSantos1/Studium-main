import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";
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

  // ✅ AUTH STATE
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
        boardId,
        text,
        user: currentUser.displayName || "Anonymous",
        pfp: currentUser.photoURL || "",
        timestamp: serverTimestamp(),
        reactions: {}
      });

      messageInput.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // ✅ REALTIME MESSAGES
  const q = query(
    collection(db, "messages"),
    where("boardId", "==", boardId),
    orderBy("timestamp", "asc")
  );

  onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const div = document.createElement("div");
      div.classList.add("message");
      div.dataset.id = docSnap.id;

      const reactions = data.reactions || {};

      div.innerHTML = `
        <div class="row">
          <img class="pfp" src="${data.pfp || ''}">
          <b>${data.user}</b>
        </div>
        <div class="msg-content">${data.text}</div>

        <div class="reactions">
          <button data-reaction="👍">👍 ${reactions["👍"] || 0}</button>
          <button data-reaction="❤️">❤️ ${reactions["❤️"] || 0}</button>
        </div>
      `;

      messagesContainer.appendChild(div);
    });
  });

  // ✅ HANDLE REACTIONS
  messagesContainer.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
      const reaction = e.target.dataset.reaction;
      const messageId = e.target.closest(".message").dataset.id;

      try {
        const messageRef = doc(db, "messages", messageId);

        await updateDoc(messageRef, {
          [`reactions.${reaction}`]: increment(1),
        });
      } catch (error) {
        console.error("Reaction error:", error);
      }
    }
  });
});