import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  where,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const params = new URLSearchParams(window.location.search);
const boardId = params.get("boardId");
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  const messagesContainer = document.getElementById("messages");
  const sendBtn = document.getElementById("sendBtn");
  const messageInput = document.getElementById("messageInput");
  const boardName = document.getElementById("boardName");
  const userPfp = document.getElementById("userPfp");
  const username = document.getElementById("username");

  if (!boardId) {
    alert("Invalid board ID");
    window.location.href = "main.html";
    return;
  }

  boardName.textContent = `Study Board: ${boardId}`;


  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      userPfp.src = user.photoURL || "";
      username.textContent = user.displayName || "Guest";
    } else {
      currentUser = null;
      username.textContent = "Guest";
    }
  });


  sendBtn.addEventListener("click", async () => {
    const text = messageInput.value.trim();
    if (!text) return alert("Message cannot be empty!");

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
        reactions: {}, 
      });
      messageInput.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  });


  const q = query(
    collection(db, "messages"),
    where("boardId", "==", boardId),
    orderBy("timestamp", "asc")
  );

  onSnapshot(q, (querySnapshot) => {
    messagesContainer.innerHTML = "";
    querySnapshot.forEach((docSnap) => {
      const msg = docSnap.data();
      const messageId = docSnap.id;

      const messageEl = document.createElement("div");
      messageEl.className = "message-box";
      messageEl.dataset.id = messageId;

      const header = document.createElement("div");
      header.className = "message-header";
      
      const pfp = document.createElement("img");
      pfp.className = "pfp";
      pfp.src = msg.pfp || "";
      
      const nameSpan = document.createElement("span");
      nameSpan.textContent = msg.user;
      
      header.appendChild(pfp);
      header.appendChild(nameSpan);

      const content = document.createElement("div");
      content.className = "msg-content";
      content.textContent = msg.text;

      const reactionsDiv = document.createElement("div");
      reactionsDiv.className = "reactions";

  
      const emojis = ["👍", "❤️", "😂", "😮"];
      emojis.forEach((emoji) => {
        const btn = document.createElement("button");
        btn.dataset.reaction = emoji;
        
        const reactions = msg.reactions || {};
        const reactionData = reactions[emoji];
        
        let count = 0;
        let userReacted = false;
        
        if (Array.isArray(reactionData)) {
   
          count = reactionData.length;
          userReacted = currentUser && reactionData.includes(currentUser.email);
        }
        
        btn.textContent = emoji;
        if (userReacted) {
          btn.style.backgroundColor = "#b9967d";
          btn.style.color = "white";
          btn.style.fontWeight = "bold";
        }
        if (count > 0) {
          btn.textContent = `${emoji} ${count}`;
        }
        
        reactionsDiv.appendChild(btn);
      });

      messageEl.appendChild(header);
      messageEl.appendChild(content);
      messageEl.appendChild(reactionsDiv);
      messagesContainer.appendChild(messageEl);
    });
  });

  messagesContainer.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
      if (!currentUser) {
        alert("You must be signed in to react.");
        return;
      }

      const reaction = e.target.dataset.reaction;
      const messageEl = e.target.closest(".message-box");
      const messageId = messageEl.dataset.id;

      try {
        const messageRef = doc(db, "messages", messageId);
        const messageDoc = await getDoc(messageRef);
        const reactions = messageDoc.data().reactions || {};

 
        const currentReactions = reactions[reaction] || [];
        
 
        if (currentReactions.includes(currentUser.email)) {
          await updateDoc(messageRef, {
            [`reactions.${reaction}`]: arrayRemove(currentUser.email),
          });
        } else {

          await updateDoc(messageRef, {
            [`reactions.${reaction}`]: arrayUnion(currentUser.email),
          });
        }
      } catch (error) {
        console.error("Error adding reaction:", error);
        alert("Failed to add reaction.");
      }
    }
  });
});