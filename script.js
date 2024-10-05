const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cooldownTimer = document.getElementById('cooldown-timer');
const adminPassword = "Itsameamario1"; // Admin password
let userPassword; // Declare userPassword without initializing it
const cooldownDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
let cooldownEndTime = null;
let isUserAuthenticated = false; // Track user authentication status

// Encryption/Decryption Key
const encryptionKey = "mySecretKey123"; // You can change this to anything you want

// Function to generate a random alphanumeric password
function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 5; i++) { // Generate a 5-character password
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Function to encrypt data
function encryptData(data) {
    return CryptoJS.AES.encrypt(data, encryptionKey).toString();
}

// Function to decrypt data
function decryptData(data) {
    const bytes = CryptoJS.AES.decrypt(data, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// Function to generate or retrieve the weekly password, with encryption
function generateOrRetrieveWeeklyPassword() {
    const encryptedPassword = localStorage.getItem('weeklyUserPassword'); // Check if there's already an encrypted password for the week
    const storedWeek = localStorage.getItem('passwordWeek'); // Check if the password corresponds to this week

    const now = new Date();
    const currentWeek = now.getFullYear() + "-W" + getWeekNumber(now); // Create a unique identifier for the current week

    if (encryptedPassword && storedWeek === currentWeek) {
        // If the encrypted password is still valid for this week, decrypt and return it
        const decryptedPassword = decryptData(encryptedPassword);
        console.log(`Decrypted Password: ${decryptedPassword}`); // Debugging line
        return decryptedPassword;
    } else {
        // Generate a new password, encrypt it, and store it
        const newPassword = generateRandomPassword();
        const encryptedNewPassword = encryptData(newPassword);
        localStorage.setItem('weeklyUserPassword', encryptedNewPassword);
        localStorage.setItem('passwordWeek', currentWeek);
        console.log(`New Password Generated: ${newPassword}`); // Debugging line
        return newPassword;
    }
}

// Function to get the week number for the current date
function getWeekNumber(date) {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstJan.getDay() + 1) / 7);
}

// Remove unnecessary localStorage entries
localStorage.removeItem('RandomAccessCode');

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
    ctx.fillRect(x, y, 10, 10); // Use 10x10 size for larger pixels
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

    // Generate or retrieve user password before checking input
    userPassword = generateOrRetrieveWeeklyPassword(); 

    console.log(`User Password: ${userPassword}`); // Debugging line

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
        console.log(`Input Password: ${inputPassword}`); // Log input for comparison
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
    passwordDisplay.textContent = `Weekly User Password: ${userPassword}`;
    passwordDisplay.style.textAlign = 'center';
    document.body.appendChild(passwordDisplay);
    console.log(`Displaying User Password: ${userPassword}`);
}

// Clear Canvas Functionality
document.getElementById("clearCanvasButton").addEventListener("click", function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
