const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cooldownTimer = document.getElementById('cooldown-timer');
const adminPassword = "Itsameamario1"; // Admin password
let userPassword = null; // User password in memory only
const cooldownDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
let cooldownEndTime = null;

// Utility function to generate random user password
function generateUserPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 5; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Check for existing cooldown in session memory (not stored)
const savedCooldownEndTime = sessionStorage.getItem('cooldownEndTime');
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

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / canvas.width));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / canvas.height));

    ctx.fillStyle = selectedColor;
    ctx.fillRect(x, y, 1, 1);

    startCooldown();
});

function startCooldown() {
    cooldownEndTime = Date.now() + cooldownDuration;
    sessionStorage.setItem('cooldownEndTime', cooldownEndTime);
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
            sessionStorage.removeItem('cooldownEndTime');
        }
    }, 1000);
}

let isUserAuthenticated = false;

document.getElementById("submitPassword").addEventListener("click", function () {
    const inputPassword = document.getElementById("passwordInput").value;

    if (inputPassword === adminPassword) {
        alert("Welcome, Admin!");
        isUserAuthenticated = true;
        enableCanvasInteraction(true);
        // Generate and show the user password for admin
        userPassword = generateUserPassword();
        document.getElementById("weeklyUserPassword").textContent = `Weekly User Password: ${userPassword}`;
    } else {
        alert("Incorrect password!");
    }
});

// Enable interaction with the canvas
function enableCanvasInteraction(isAdmin) {
    canvas.style.pointerEvents = 'auto';
    if (isAdmin) {
        document.getElementById("clearCanvasButton").style.display = 'block';
    }
}

// Weekly password generation (held in memory, not saved anywhere)
function setWeeklyPassword() {
    const now = new Date();
    const currentWeekNumber = getWeekNumber(now);
    const lastGeneratedWeek = sessionStorage.getItem('lastGeneratedWeek');

    // Generate a new password if we're in a new week
    if (!lastGeneratedWeek || currentWeekNumber !== parseInt(lastGeneratedWeek, 10)) {
        userPassword = generateUserPassword();
        sessionStorage.setItem('lastGeneratedWeek', currentWeekNumber); // Only week number is stored
    }
}

// Helper function to get the current week number of the year
function getWeekNumber(d) {
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
}

// Initialize the password system (held in memory, not saved anywhere)
setWeeklyPassword();
