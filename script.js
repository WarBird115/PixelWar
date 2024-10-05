import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjcSLUJsjQWmITFt3gQCul9BcNs1ABTpA",
  authDomain: "pixelwarnew.firebaseapp.com",
  databaseURL: "https://pixelwarnew-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pixelwarnew",
  storageBucket: "pixelwarnew.appspot.com",
  messagingSenderId: "312098433016",
  appId: "1:312098433016:web:0edcc62b292cb41546580d",
  measurementId: "G-9VH085RDE1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cooldownTimer = document.getElementById('cooldown-timer');
const adminPassword = "Itsameamario1"; // Admin password
let userPassword = ''; // Variable to store user password
const cooldownDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
let cooldownEndTime = null;
let isUserAuthenticated = false; // Track user authentication status

// Function to generate a random alphanumeric password
function generateRandomPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 5; i++) { // Generate a 5-character password
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Function to generate or retrieve the weekly password from Firebase
async function generateOrRetrieveWeeklyPassword() {
  const passwordRef = ref(database, 'weeklyUserPassword'); // Reference to the password in Firebase
  const snapshot = await get(passwordRef); // Get the password from Firebase

  const now = new Date();
  const currentWeek = now.getFullYear() + "-W" + getWeekNumber(now); // Create a unique identifier for the current week

  if (snapshot.exists()) {
    // If the password exists, return it
    userPassword = snapshot.val(); // Assign the retrieved password to userPassword
    return userPassword;
  } else {
    // Generate a new password and store it
    const newPassword = generateRandomPassword();
    await set(passwordRef, newPassword); // Store the new password in Firebase
    userPassword = newPassword; // Assign the newly generated password to userPassword
    return userPassword;
  }
}

// Function to get the week number for the current date
function getWeekNumber(date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + firstJan.getDay() + 1) / 7);
}

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

colorPicker.addEventListener('input', function () {
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

  // Draw the pixel on the canvas
  ctx.fillStyle = currentColor;
  ctx.fillRect(x, y, 1, 1);

  // Save the pixel to Firebase
  const pixelRef = ref(database, `pixels/${x},${y}`);
  set(pixelRef, { color: currentColor }).then(() => {
    console.log('Pixel saved to Firebase');
  }).catch((error) => {
    console.error('Error saving pixel:', error);
  });

  // Set cooldown
  cooldownEndTime = Date.now() + cooldownDuration;
  localStorage.setItem('cooldownEndTime', cooldownEndTime);
  updateCooldownTimer();
});

// Event listener for password submission
document.getElementById('submitPassword').addEventListener('click', async () => {
  const passwordInput = document.getElementById('passwordInput').value;
  
  if (passwordInput === adminPassword) {
    // Show clear canvas button if admin password is entered
    document.getElementById('clearCanvasButton').style.display = 'inline';
    alert('Admin access granted. You can now clear the canvas.');
    isUserAuthenticated = true; // Allow the admin to place pixels
  } else if (passwordInput === await generateOrRetrieveWeeklyPassword()) {
    alert('User access granted. You can now place pixels!');
    isUserAuthenticated = true; // Allow the user to place pixels
  } else {
    alert('Incorrect password!');
  }
});

// Event listener for clear canvas button
document.getElementById('clearCanvasButton').addEventListener('click', () => {
  const confirmed = confirm('Are you sure you want to clear the canvas?');
  if (confirmed) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    alert('Canvas cleared!');
    // Clear pixels in Firebase (optional)
    const pixelsRef = ref(database, 'pixels');
    set(pixelsRef, null);
  }
});

// Load existing pixels from Firebase
const pixelsRef = ref(database, 'pixels');
onValue(pixelsRef, (snapshot) => {
  const pixels = snapshot.val();
  if (pixels) {
    Object.keys(pixels).forEach((key) => {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = pixels[key].color;
      ctx.fillRect(x, y, 1, 1);
    });
  }
});

// Call to retrieve or generate the weekly password
generateOrRetrieveWeeklyPassword();
