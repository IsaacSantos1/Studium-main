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

const params = new URLSearchParams(window.location.search);
const boardId = params.get("boardId");

document.addEventListener("DOMContentLoaded", () => {
  const messagesContainer = document.getElementById("messages");
  const sendBtn = document.getElementById("sendBtn");
  const messageInput = document.getElementById("messageInput");
  const boardName = document.getElementById("boardName");

  // 🚨 Prevent broken page if boardId missing
  if (!boardId) {
    alert("Invalid board ID");
    window.location.href = "main.html";
    return;
  }

  boardName.textContent = `Study Board: ${boardId}`;

  sendBtn.addEventListener("click", async () => {
    const text = messageInput.value.trim();
    if (!text) return alert("Message cannot be empty!");
  
    const user = auth.currentUser;
    if (!user) return alert("You must be signed in to send messages.");
  
    try {
      await addDoc(collection(db, "studyboards", boardId, "messages"), {
        text,
        sender: user.displayName || "Anonymous",
        senderPhoto: user.photoURL || "",
        timestamp: serverTimestamp(),
      });
      messageInput.value = ""; // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  });

  // ✅ REALTIME LISTENER (with fallback if index not ready)
  let q;

  try {
    q = query(
      collection(db, "messages"),
      where("boardId", "==", boardId),
      orderBy("timestamp", "asc")
    );
  } catch {
    // fallback (no index yet)
    q = query(
      collection(db, "messages"),
      where("boardId", "==", boardId)
    );
  }

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

const messagesContainer = document.getElementById("messages");

onSnapshot(
  query(collection(db, "studyboards", boardId, "messages"), orderBy("timestamp", "asc")),
  (snapshot) => {
    messagesContainer.innerHTML = ""; // Clear existing messages
    snapshot.forEach((doc) => {
      const message = doc.data();
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");

      messageDiv.innerHTML = `
        <div class="message-header">
          <img src="${message.senderPhoto}" alt="PFP" class="pfp">
          <span>${message.sender}</span>
        </div>
        <p>${message.text}</p>
        <div class="reactions">
          <button>👍</button>
          <button>❤️</button>
          <button>😂</button>
        </div>
      `;
      messagesContainer.appendChild(messageDiv);
    });
  },
  (error) => {
    console.error("Error fetching messages:", error);
    alert("Failed to load messages.");
  }
);

messagesContainer.addEventListener("click", async (e) => {
  if (e.target.tagName === "BUTTON") {
    const reaction = e.target.textContent;
    const messageId = e.target.closest(".message").dataset.id;

    try {
      const messageRef = doc(db, "studyboards", boardId, "messages", messageId);
      await updateDoc(messageRef, {
        reactions: arrayUnion(reaction),
      });
    } catch (error) {
      console.error("Error adding reaction:", error);
      alert("Failed to add reaction.");
    }
  }
});