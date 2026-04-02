import { auth, db } from "./firebase-config.js";
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
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
        reactions: [],
      });
      messageInput.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  });

  onSnapshot(
    query(collection(db, "studyboards", boardId, "messages"), orderBy("timestamp", "asc")),
    (snapshot) => {
      messagesContainer.innerHTML = "";
      snapshot.forEach((doc) => {
        const message = doc.data();
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.dataset.id = doc.id;

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
            <div class="reaction-counts">
              ${message.reactions ? message.reactions.join(" ") : ""}
            </div>
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
});