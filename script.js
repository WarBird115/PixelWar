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
let weeklyPassword = ""; // Variable to store the weekly user password

// List of 100 random passwords (5 characters, mixed case and numbers)
const passwords = [
  "A1bC2", "D3eF4", "G5hI6", "J7kL8", "M9nO0",
  "P1qR2", "S3tU4", "V5wX6", "Y7zA8", "B9cD0",
  "E1fG2", "H3iJ4", "K5lM6", "N7oP8", "Q9rS0",
  "T1uV2", "W3xY4", "Z5aB6", "C7dE8", "F9gH0",
  "I1jK2", "L3mN4", "O5pQ6", "R7sT8", "U9vW0",
  "X1yZ2", "A3bC4", "D5eF6", "G7hI8", "J9kL0",
  "M1nO2", "P3qR4", "S5tU6", "V7wX8", "Y9zA0",
  "B1cD2", "E3fG4", "H5iJ6", "K7lM8", "N9oP0",
  "Q1rS2", "T3uV4", "W5yZ6", "Z7aB8", "C9dE0",
  "F1gH2", "I3jK4", "L5mN6", "O7pQ8", "R9sT0",
  "U1vW2", "X3yZ4", "A5bC6", "D7eF8", "G9hI0",
  "J1kL2", "M3nO4", "P5qR6", "S7tU8", "V9wX0",
  "Y1zA2", "B3cD4", "E5fG6", "H7iJ8", "K9lM0",
  "N1oP2", "Q3rS4", "T5uV6", "W7yZ8", "Z9aB0",
  "C1dE2", "F3gH4", "I5jK6", "L7mN8", "O9pQ0",
  "R1sT2", "U3vW4", "X5yZ6", "A7bC8", "D9eF0",
  "G1hI2", "J3kL4", "M5nO6", "P7qR8", "S9tU0",
  "V1wX2", "Y3zA4", "B5cD6", "E7fG8", "H9iJ0",
  "K1lM2", "N3oP4", "Q5rS6", "T7uV8", "W9yZ0",
  "Z1aB2", "C3dE4", "F5gH6", "I7jK8", "L9mN0",
  "O1pQ2", "R3sT4", "U5vW6", "X7yZ8", "A9bC0",
  "D1eF2", "G3hI4", "J5kL6", "M7nO8", "P9qR0"
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

// Admin login
const adminPassword = "The0verseer";
const userPasswordField = document.getElementById('userPassword');
const loginButton = document.getElementById('loginButton');
const clearCanvasButton = document.getElementById('clearCanvasButton');

loginButton.addEventListener('click', () => {
  const inputPassword = userPasswordField.value;
  if (inputPassword === adminPassword) {
    isUserAuthenticated = true;
    alert('Admin access granted!');
  } else if (inputPassword === weeklyPassword) {
    isUserAuthenticated = true;
    alert('Access granted! You can now place pixels.');
  } else {
    alert('Incorrect password! Try again.');
  }
});

// Clear canvas for admin
clearCanvasButton.addEventListener('click', () => {
  if (!isUserAuthenticated) {
    alert('You must be an admin to clear the canvas!');
    return;
  }

  const pixelsRef = ref(database, 'pixels/');
  remove(pixelsRef)
    .then(() => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear canvas visually
      console.log('Canvas cleared');
    })
    .catch((error) => {
      console.error('Error clearing canvas:', error);
    });
});

// Update the password every week on Sundays at midnight
function updateWeeklyPassword() {
  const today = new Date();
  const weekDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Check if today is Sunday and the time is midnight
  if (weekDay === 0 && today.getHours() === 0 && today.getMinutes() === 0) {
    // Select a random password from the list
    const randomIndex = Math.floor(Math.random() * passwords.length);
    weeklyPassword = passwords[randomIndex];
    console.log(`Weekly password updated to: ${weeklyPassword}`);
  }
}

// Call this function on page load to initialize the password
updateWeeklyPassword();
loadCanvas();
