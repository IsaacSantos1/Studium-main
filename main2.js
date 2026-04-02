// main.js
import { signInWithGoogle, signOutUser, listenForAuthChanges } from './authService.js';

// Get references to DOM elements
const googleSignInButton = document.getElementById('google-sign-in-button');
const signOutButton = document.getElementById('sign-out-button');
const userInfoDiv = document.getElementById('user-info');
const userDisplayNameSpan = document.getElementById('user-display-name');
const userEmailSpan = document.getElementById('user-email');
const userUidSpan = document.getElementById('user-uid');
const userPfpImg = document.getElementById('user-pfp'); // <--- New reference for PFP

// Define your redirect page
const REDIRECT_AFTER_SIGN_IN = 'dashboard.html';

// --- Event Listeners ---
if (googleSignInButton) {
  googleSignInButton.addEventListener('click', async () => {
    await signInWithGoogle(REDIRECT_AFTER_SIGN_IN); 
  });
}

if (signOutButton) {
  signOutButton.addEventListener('click', async () => {
    await signOutUser();
    window.location.href = 'home.html'; 
  });
}

// --- Authentication State Observer ---
listenForAuthChanges((user) => {
  if (user) {
    // User is signed in
    console.log("Auth state changed: User is signed in.", user);
    googleSignInButton.style.display = 'none';
    userInfoDiv.style.display = 'block';

    userDisplayNameSpan.textContent = user.displayName || 'N/A';
    userEmailSpan.textContent = user.email || 'N/A';
    userUidSpan.textContent = user.uid || 'N/A';
    
    // Set the profile picture URL
    if (user.photoURL) {
      userPfpImg.src = user.photoURL;
      userPfpImg.style.display = 'inline'; // Show the image
    } else {
      userPfpImg.style.display = 'none'; // Hide if no photoURL
    }

    if (window.location.pathname.includes('home.html') || window.location.pathname === '/') {
        window.location.href = REDIRECT_AFTER_SIGN_IN;
    }

  } else {
    // User is signed out
    console.log("Auth state changed: User is signed out.");
    googleSignInButton.style.display = 'flex';
    userInfoDiv.style.display = 'none';

    userDisplayNameSpan.textContent = '';
    userEmailSpan.textContent = '';
    userUidSpan.textContent = '';
    userPfpImg.src = ''; // Clear the image
    userPfpImg.style.display = 'none'; // Hide the image

    if (!window.location.pathname.includes('home.html') && window.location.pathname !== '/') {
        window.location.href = 'home.html';
    }
  }
});

console.log("main.js loaded.");