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
      window.location.href = "home.html";
    }
  });

  async function displayStudyBoards(user) {
    const q = query(
      collection(db, "studyboards"),
      where("members", "array-contains", user.email) // Check if the user is in the members array
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

// CREATE
createBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  if (!name) return;

  const user = auth.currentUser;

  try {
    await addDoc(collection(db, "studyboards"), {
      name,
      owner: user.email,
      members: [user.email], // Add the creator to the members array
      timestamp: new Date(),
    });

    alert("Studyboard created!");
    await displayStudyBoards(user); // Refresh the studyboards list
  } catch (error) {
    console.error("Error creating studyboard:", error);
    alert("Failed to create studyboard. Please try again.");
  }
});

// JOIN
joinBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const boardId = document.getElementById("ID").value.trim();
  if (!boardId) return;

  const user = auth.currentUser;
  if (!user) {
    alert("You must be signed in to join a studyboard.");
    return;
  }

  const docRef = doc(db, "studyboards", boardId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    alert("Board not found");
    return;
  }

  try {
    // Add the user to the members array
    await updateDoc(docRef, {
      members: arrayUnion(user.email),
    });

    alert("Successfully joined the studyboard!");
    await displayStudyBoards(user); // Refresh the studyboards list
  } catch (error) {
    console.error("Error joining studyboard:", error);
    alert("Failed to join the studyboard. Please try again.");
  }
});