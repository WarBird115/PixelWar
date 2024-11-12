import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
import { writeFileSync } from 'fs';

// Firebase configuration
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

// Firebase reference for the password node
const passwordRef = ref(database, 'Data/password');

// Predetermined password list
const passwords = [
  "A1bC2", "D3eF4", "G5hI6", "J7kL8", "M9nO0",
  "P1qR2", "S3tU4", "V5wX6", "Y7zA8", "B9cD0",
  "E1fG2", "H3iJ4", "K5lM6", "N7oP8", "Q9rS0",
  "T1uV2", "W3xY4", "Z5aB6", "C7dE8", "F9gH0",
  "I1jK2", "L3mN4", "O5pQ6", "R7sT8", "U9vW0",
  "X1yZ2", "A3bC4", "D5eF6", "G7hI8", "J9kL0",
  "M1nO2", "P3qR4", "S5tU6", "V7wX8", "Y9zA0",
  "B1cD2", "E3fG4", "H5iJ6", "K7mN8", "N9oP0",
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
  "Y1zA2", "B3cD4", "E5fG6", "H7iJ8", "K9lM0"
];

// Password rotation logic
const passwordChangeInterval = 604800000; // One week in milliseconds
let currentPasswordIndex = Math.floor(Date.now() / passwordChangeInterval) % passwords.length;
let currentPassword = passwords[currentPasswordIndex];

// Weekly password display element
const adminPasswordText = document.getElementById('adminPasswordText');

// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cooldownTimer = document.getElementById('cooldown-timer');
const pixelSize = 10; // Pixel size
const cooldownDuration = 5 * 60 * 1000; // 5 minutes cooldown
let cooldownEndTime = null;
let isUserAuthenticated = false; // Track user authentication status

// Set canvas size
const canvasWidth = 400;
const canvasHeight = 400;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Function to load the weekly password from Firebase
function loadWeeklyPassword() {
  console.log("Attempting to load weekly password..."); // Debugging log
  get(passwordRef).then((snapshot) => {
    if (snapshot.exists()) {
      currentPassword = snapshot.val();
      console.log("Loaded weekly password:", currentPassword); // Log password for verification
      adminPasswordText.textContent = `Current weekly password: ${currentPassword}`;

      // Write password to file for backup (optional)
      if (currentPassword) {
        writeFileSync('selected_password.txt', currentPassword, 'utf8');
        console.log("Password written to file.");
      }
    } else {
      console.warn("Password does not exist; setting a new one.");
      setWeeklyPassword(); // Set the weekly password
    }
  }).catch((error) => {
    console.error("Error retrieving password:", error);
  });
}

// Function to set the weekly password in Firebase
function setWeeklyPassword() {
  currentPassword = passwords[currentPasswordIndex];
  set(passwordRef, currentPassword)
    .then(() => {
      console.log('Weekly password set:', currentPassword);
      adminPasswordText.textContent = `Current weekly password: ${currentPassword}`; // Update display

      // Write password to file for backup (optional)
      writeFileSync('selected_password.txt', currentPassword, 'utf8');
      console.log("Password written to file.");
    })
    .catch((error) => {
      console.error('Error setting weekly password:', error);
    });
}

// Load the weekly password when the page loads
loadWeeklyPassword();

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

  set(ref(database, `pixels/${x},${y}`), { color: currentColor })
    .then(() => {
      // Set cooldown
      cooldownEndTime = Date.now() + cooldownDuration;
      localStorage.setItem('cooldownEndTime', cooldownEndTime.toString());
      updateCooldownTimer();
      loadCanvas(); // Reload canvas to show the placed pixel
    })
    .catch((error) => {
      console.error('Error placing pixel:', error);
    });
});

// Admin login for placing pixels
const adminPasswordField = document.getElementById('adminPassword');
const loginButton = document.getElementById('loginButton');

loginButton.addEventListener('click', () => {
  const enteredPassword = adminPasswordField.value;
  if (enteredPassword === currentPassword) {
    isUserAuthenticated = true;
    alert('Authentication successful!');
  } else {
    alert('Incorrect password!');
  }
});

// Initialize the canvas
loadCanvas();
