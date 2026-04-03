import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { auth } from './firebase-config.js';

const provider = new GoogleAuthProvider();

export async function signInWithGoogle(redirectUrl) {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Successfully signed in:", user);

    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    alert("Failed to sign in. Please try again.");
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    console.log("User signed out.");
    window.location.href = "Home.html"; 
  } catch (error) {
    console.error("Sign-Out Error:", error);
    alert("Failed to sign out. Please try again.");
  }
}

export function listenForAuthChanges(callback) {
  onAuthStateChanged(auth, callback);
}