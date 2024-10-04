const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cooldownTimer = document.getElementById('cooldown-timer');
const adminPassword = "Itsameamario1"; // Admin password
let userPassword = ""; // Randomly generated user password
const cooldownDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
let cooldownEndTime = null;
let isUserAuthenticated = false; // Track user authentication status

// Function to generate a random alphanumeric password
function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Function to set a new user password every Sunday at 00:00
function updateWeeklyPassword() {
    const now = new Date();
    const nextSunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()) % 7, 0, 0, 0); // Next Sunday at 00:00

    const timeUntilNextSunday = nextSunday.getTime() - now.getTime();
    
    // If it's already Sunday at 00:00, generate the password right away
    if (now.getDay() === 0 && now.getHours() === 0) {
        userPassword = generateRandomPassword();
    }

    // Set a timeout to update the password at the next Sunday 00:00
    setTimeout(() => {
        userPassword = generateRandomPassword();
        updateWeeklyPassword(); // Schedule the next update for the following week
    }, timeUntilNextSunday);
}

// Call the function to start updating the password
updateWeeklyPassword();

// Set the canvas size and pixel scaling
const canvasWidth = 400;
const canvasHeight = 400;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Check for existing cooldown in localStorage
const savedCooldownEndTime = localStorage.getItem('cooldownEndTime');
if (savedCooldownEndTime && Date.now() < savedCooldownEndTime) {
    cooldownEndTime = parseInt(savedCooldownEndTime, 10);
    updateCooldownTimer();
}

// Function to update the cooldown timer
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

// Color Picker functionality
const colorPicker = document.getElementById('colorPicker');
let currentColor = colorPicker.value;

colorPicker.addEventListener('input', function() {
    currentColor = colorPicker.value;
});

// Event listener to place a pixel on the canvas
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

    // Draw the pixel at the clicked position
    ctx.fillStyle = currentColor;
    ctx.fillRect(x, y, 50, 50); // Use 50x50 size for larger pixels
    console.log(`Placing pixel at: (${x}, ${y})`);
    console.log(`Color being used: ${currentColor}`);

    // Start the cooldown
    startCooldown();
});

// Function to start the cooldown timer
function startCooldown() {
    cooldownEndTime = Date.now() + cooldownDuration;
    localStorage.setItem('cooldownEndTime', cooldownEndTime);
    updateCooldownTimer();
}

// Authentication
document.getElementById("submitPassword").addEventListener("click", function() {
    const inputPassword = document.getElementById("passwordInput").value;

    if (inputPassword === adminPassword) {
        alert("Welcome, Admin!");
        isUserAuthenticated = true;
        enableCanvasInteraction(true);
        displayAdminPassword(); // Display the random password if admin logs in
    } else if (inputPassword === userPassword) {
        alert("Welcome, User!");
        isUserAuthenticated = true;
        enableCanvasInteraction(false);
    } else {
        alert("Incorrect password!");
    }
});

// Enable canvas interaction and show "Clear Canvas" for admin
function enableCanvasInteraction(isAdmin) {
    canvas.style.pointerEvents = 'auto';
    if (isAdmin) {
        document.getElementById("clearCanvasButton").style.display = 'block';
    }
}

// Function for the admin to see the weekly user password
function displayAdminPassword() {
    const passwordDisplay = document.createElement('p');
    passwordDisplay.textContent = `Current User Password: ${userPassword}`;
    passwordDisplay.style.textAlign = 'center';
    document.body.appendChild(passwordDisplay);
}

// Clear Canvas Functionality
document.getElementById("clearCanvasButton").addEventListener("click", function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
