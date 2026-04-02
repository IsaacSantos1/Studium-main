import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";




// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBC4NIvm_xJhsZu4BbawHMw8eFFOD_IUH8",
    authDomain: "studyboard-cf9dc.firebaseapp.com",
    projectId: "studyboard-cf9dc",
    storageBucket: "studyboard-cf9dc.firebasestorage.app",
    messagingSenderId: "392512639176",
    appId: "1:392512639176:web:f93851c04300d38b0615fd"
  };
 


// Initialize Firebase outside the event listener
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Ensure auth is initialized from the app
const db = getFirestore(app);


export {app, auth, db};
