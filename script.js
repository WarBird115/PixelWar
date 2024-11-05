import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cooldownTimer = document.getElementById('cooldown-timer');
const pixelSize = 10; // Pixel size, adjustable
const cooldownDuration = 5 * 60 * 1000; // 5 minutes cooldown
let cooldownEndTime = null;
let isUserAuthenticated = false; // Track user authentication status
let weeklyPassword = ""; // Variable to store the weekly password

// List of 100 random passwords (5 characters, mixed case and numbers)
const passwords = [
  "A1bC2", "D3eF4", "G5hI6", "J7kL8", "M9nO0",
  "P1qR2", "S3tU4", "V5wX6", "Y7zA8", "B9cD0",
  // ... (full list continues)
];

// Set canvas size
const canvasWidth = 400;
const canvasHeight = 400;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Initialize the canvas from Firebase
function loadCanvas() {
  const pixelsRef = ref(database, 'pixels/');
  onValue(pixelsRef, (snapshot) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear existing canvas
    snapshot.forEach((childSnapshot) => {
      const pixelData = childSnapshot.val();
      const [x, y] = childSnapshot.key.split(',').map(Number);
      ctx.fillStyle = pixelData.color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    });
  });
}

// Check for cooldown
if (localStorage.getItem('cooldownEndTime')) {
  cooldownEndTime = parseInt(localStorage.getItem('cooldownEndTime'), 10);
  if (Date.now() < cooldownEndTime) {
    updateCooldownTimer();
  } else {
    localStorage.removeItem('cooldownEndTime');
  }
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

// Color Picker
const colorPicker = document.getElementById('colorPicker');
let currentColor = colorPicker.value;
colorPicker.addEventListener('input', () => {
  currentColor = colorPicker.value;
});

// Canvas click to place a pixel
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
  const x = Math.floor((e.clientX - rect.left) / pixelSize);
  const y = Math.floor((e.clientY - rect.top) / pixelSize);

  ctx.fillStyle = currentColor;
  ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

  const pixelRef = ref(database, `pixels/${x},${y}`);
  set(pixelRef, { color: currentColor })
    .then(() => {
      console.log('Pixel saved');
    })
    .catch((error) => {
      console.error('Error saving pixel:', error);
    });

  cooldownEndTime = Date.now() + cooldownDuration;
  localStorage.setItem('cooldownEndTime', cooldownEndTime);
  updateCooldownTimer();
});

// Right-click to copy pixel color
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / pixelSize);
  const y = Math.floor((e.clientY - rect.top) / pixelSize);

  const imageData = ctx.getImageData(x * pixelSize, y * pixelSize, pixelSize, pixelSize).data;
  const color = `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, ${imageData[3] / 255})`;

  navigator.clipboard.writeText(color).then(() => {
    alert(`Color ${color} copied to clipboard!`);
  }).catch((error) => {
    console.error('Error copying color:', error);
  });
});

// Function to set the weekly password
function setWeeklyPassword() {
  const weekNumber = getWeekNumber(new Date());
  const passwordIndex = weekNumber % passwords.length; // Ensure the index is within bounds
  weeklyPassword = passwords[passwordIndex];
  localStorage.setItem('weeklyPassword', weeklyPassword); // Store in local storage
  console.log("New Weekly Password (for Admin):", weeklyPassword);
}

// Get current week number
function getWeekNumber(date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const daysInYear = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((daysInYear + firstJan.getDay() + 1) / 7);
}

// Check user password
const passwordInput = document.getElementById('passwordInput');
const passwordButton = document.getElementById('passwordButton');
passwordButton.addEventListener('click', () => {
  const enteredPassword = passwordInput.value;
  if (enteredPassword === "The0verseer") { // Admin password
    isUserAuthenticated = true;
    alert('Admin access granted!');
  } else if (enteredPassword === weeklyPassword) { // Weekly password
    isUserAuthenticated = true;
    alert('Access granted!');
  } else {
    alert('Incorrect password!');
  }
});

// Clear canvas function for admin
const clearCanvasButton = document.getElementById('clearCanvasButton');
clearCanvasButton.addEventListener('click', () => {
  if (isUserAuthenticated && passwordInput.value === "The0verseer") { // Check if admin
    const pixelsRef = ref(database, 'pixels/');
    remove(pixelsRef).then(() => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear canvas
      alert('Canvas cleared successfully!');
    }).catch((error) => {
      console.error('Error clearing canvas:', error);
    });
  } else {
    alert('You must be an admin to clear the canvas!');
  }
});

// Initialize canvas
loadCanvas();

// Initialize weekly password at the start
setWeeklyPassword();
