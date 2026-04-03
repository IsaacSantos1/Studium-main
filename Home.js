const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const nav = document.querySelector('nav');
const container = document.querySelector('.container');
const darkModeClass = 'dark-mode';
const localStorageKey = 'theme-preference';

function changeImage() {
    var image = document.getElementById("myImage");
    if (image.src.includes("moon.png")) {
        image.src = "Assets/sun.png";
    } else {
        image.src = "Assets/moon.png";
    }
}

function enableDarkMode() {
    body.classList.add(darkModeClass);
    nav.classList.add(darkModeClass);
    container.classList.add(darkModeClass);
    localStorage.setItem(localStorageKey, 'dark');

    document.getElementById("myImage").src = "Assets/sun.png"; 
}

function disableDarkMode() {
    body.classList.remove(darkModeClass);
    nav.classList.remove(darkModeClass);
    container.classList.remove(darkModeClass);
    localStorage.setItem(localStorageKey, 'light');

    document.getElementById("myImage").src = "Assets/moon.png"; 
}

function toggleTheme() {
    if (body.classList.contains(darkModeClass)) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedPreference = localStorage.getItem(localStorageKey);
    if (savedPreference === 'dark') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
});

themeToggleBtn.addEventListener('click', toggleTheme);