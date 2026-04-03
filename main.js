import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const userStatus = document.querySelector("nav h3");
  const createBtn = document.getElementById("createBtn");
  const joinBtn = document.getElementById("joinBtn");
  const studyboardsList = document.getElementById("testing");

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userStatus.textContent = `Welcome, ${user.displayName || "User"}!`;
      await displayStudyBoards(user);
    } else {
      window.location.href = "Home.html";
    }
  });

  async function displayStudyBoards(user) {
    const q = query(
      collection(db, "studyboards"),
      where("members", "array-contains", user.email)
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

  // ✅ CREATE BOARD
  createBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    if (!name) return;

    const user = auth.currentUser;

    try {
      await addDoc(collection(db, "studyboards"), {
        name,
        owner: user.email,
        members: [user.email],
        timestamp: new Date(),
      });

      alert("Studyboard created!");
      await displayStudyBoards(user);
    } catch (error) {
      console.error("Error creating studyboard:", error);
      alert("Failed to create studyboard.");
    }
  });

  // ✅ JOIN BOARD
  joinBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const boardId = document.getElementById("ID").value.trim();
    if (!boardId) return;

    const user = auth.currentUser;
    if (!user) {
      alert("You must be signed in.");
      return;
    }

    const docRef = doc(db, "studyboards", boardId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert("Board not found");
      return;
    }

    try {
      await updateDoc(docRef, {
        members: arrayUnion(user.email),
      });

      alert("Joined successfully!");
      await displayStudyBoards(user);
    } catch (error) {
      console.error("Error joining board:", error);
      alert("Failed to join board.");
    }
  });
});