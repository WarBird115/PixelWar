const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cooldownTimer = document.getElementById('cooldown-timer');
const clearCanvasButton = document.getElementById('clearCanvasButton');
const weeklyPasswordDisplay = document.getElementById('weeklyPasswordDisplay');
const cooldownDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
let cooldownEndTime = null;

// Passwords
const adminPassword = "Itsameamario1"; // Admin password
let userPassword = generateWeeklyPassword(); // Weekly changing user password

// Store the generated password in localStorage
if (!localStorage.getItem('weeklyUserPassword')) {
    localStorage.setItem('weeklyUserPassword', userPassword);
} else {
    userPassword = localStorage.getItem('weeklyUserPassword');
}

// Check if it's Sunday 00:00 to generate a new weekly password
setInterval(() => {
    const currentTime = new Date();
    const isSundayMidnight = currentTime.getDay() === 0 && currentTime.getHours() === 0 && currentTime.getMinutes() === 0;
    if (isSundayMidnight) {
        userPassword = generateWeeklyPassword();
        localStorage.setItem('weeklyUserPassword', userPassword);
    }
}, 60 * 1000); // Check every minute

// Function to generate a random 5-character alphanumeric password
function generateWeeklyPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 5; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Check for existing cooldown in localStorage
const savedCooldownEndTime = localStorage.getItem('cooldownEndTime');
if (savedCooldownEndTime && Date.now() < savedCooldownEndTime) {
    cooldownEndTime = parseInt(savedCooldownEndTime, 10);
    updateCooldownTimer();
}

canvas.addEventListener('click', (e) => {
    if (!isUserAuthenticated) {
        alert('You must enter the correct password to place a pixel!');
        return;
    }

    if (cooldownEndTime && Date.now() < cooldownEndTime) {
        alert('You are still on cooldown!');
        return;
    }

    // Get the mouse position relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / canvas.width));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / canvas.height));

    // Draw a pixel at the clicked position
    ctx.fillStyle = selectedColor;
    ctx.fillRect(x, y, 5, 5); // Adjusted to make the pixel bigger

    // Start the cooldown
    startCooldown();
});

function startCooldown() {
    cooldownEndTime = Date.now() + cooldownDuration;
    localStorage.setItem('cooldownEndTime', cooldownEndTime);
    updateCooldownTimer();
}

function updateCooldownTimer() {
    const interval = setInterval(() => {
        const remainingTime = cooldownEndTime - Date.now();
        if (remainingTime > 0) {
            const minutes = Math.floor(remainingTime / 1000 / 60);
            const seconds = Math.floor((remainingTime / 1000) % 60);
            cooldownTimer.textContent = `Next pixel in: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        } else {
            clearInterval(interval);
            cooldownEndTime = null;
            cooldownTimer.textContent = 'You can place a pixel now!';
            localStorage.removeItem('cooldownEndTime');
        }
    }, 1000);
}

// Authentication
let isUserAuthenticated = false;

document.getElementById("submitPassword").addEventListener("click", function () {
    const inputPassword = document.getElementById("passwordInput").value;

    if (inputPassword === adminPassword) {
        alert("Welcome, Admin!");
        isUserAuthenticated = true;
        enableCanvasInteraction(true);
        // Display the weekly password for the admin
        weeklyPasswordDisplay.textContent = `Weekly User Password: ${userPassword}`;
    } else if (inputPassword === userPassword) {
        alert("Welcome, User!");
        isUserAuthenticated = true;
        enableCanvasInteraction(false);
    } else {
        alert("Incorrect password!");
    }
});

function enableCanvasInteraction(isAdmin) {
    // Enable pixel placement
    canvas.style.pointerEvents = 'auto';
    // Show 'Clear Canvas' button if admin
    if (isAdmin) {
        clearCanvasButton.style.display = 'block';
    }
}

// Clear Canvas Functionality
clearCanvasButton.addEventListener("click", function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
