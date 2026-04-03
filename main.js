import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const userStatus = document.querySelector("nav h3");
  const createBtn = document.getElementById("createBtn");
  const joinBtn = document.getElementById("joinBtn");
  const studyboardsList = document.getElementById("testing");

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userStatus.textContent = `Welcome, ${user.displayName || "User"}!`;
      await displayStudyBoards(user);
    } else {
      window.location.href = "Home.html"; // ✅ FIXED
    }
  });

  async function displayStudyBoards(user) {
    const q = query(
      collection(db, "studyboards"),
      where("owner", "==", user.email)
    );

    const querySnapshot = await getDocs(q);
    studyboardsList.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const board = docSnap.data();

      const li = document.createElement("li");
      li.textContent = board.name;

      li.addEventListener("click", () => {
        window.location.href = `dashboard.html?boardId=${docSnap.id}`;
      });

      studyboardsList.appendChild(li);
    });
  }

  createBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    if (!name) return;

    const user = auth.currentUser;

    await addDoc(collection(db, "studyboards"), {
      name,
      owner: user.email,
      timestamp: new Date(),
    });

    alert("Created!");
    await displayStudyBoards(user);
  });

  joinBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const boardId = document.getElementById("ID").value.trim();
    if (!boardId) return;

    const docRef = doc(db, "studyboards", boardId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert("Board not found");
      return;
    }

    window.location.href = `dashboard.html?boardId=${boardId}`;
  });
});