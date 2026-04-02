const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const nav = document.querySelector('nav');
const container = document.querySelector('.container');
const darkModeClass = 'dark-mode';
const localStorageKey = 'theme-preference';

function changeImage() {
    var image = document.getElementById("myImage");
    if (image.src.match("Assets/moon.png")) {
      image.src = "Assets/sun.png"; // Path to the second image
    } else {
      image.src = "Assets/moon.png"; // Path to the first image
    }
  }

 

// Function to enable dark mode
function enableDarkMode() {
    body.classList.add(darkModeClass);
    nav.classList.add(darkModeClass); // Ensure nav also gets dark mode styling
    container.classList.add(darkModeClass); // Ensure container also gets dark mode styling
    localStorage.setItem(localStorageKey, 'dark'); // Save preference to localStorage
    themeToggleBtn.imgSrc = 'Assets/sun.png'; // Change button icon to sun for light mode
}

// Function to disable dark mode
function disableDarkMode() {
    body.classList.remove(darkModeClass);
    nav.classList.remove(darkModeClass); // Ensure nav also gets light mode styling
    container.classList.remove(darkModeClass); // Ensure container also gets light mode styling
    localStorage.setItem(localStorageKey, 'light'); // Save preference to localStorage
    themeToggleBtn.imgSrc = 'Assets/moon.png'; // Change button icon to moon for dark mode
}

// Function to check current mode and toggle
function toggleTheme() {
    if (body.classList.contains(darkModeClass) && nav.classList.contains(darkModeClass) && container.classList.contains(darkModeClass)) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

// Check saved preference on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedPreference = localStorage.getItem(localStorageKey);
    if (savedPreference === 'dark') {
        enableDarkMode();
    } else {
        // Optionally check OS preference here if no explicit user choice is saved
        // const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        // if (prefersDark) enableDarkMode();
        // else disableDarkMode();
        disableDarkMode(); // Default to light if no preference
    }
});

// Add event listener to the toggle button
themeToggleBtn.addEventListener('click', toggleTheme);