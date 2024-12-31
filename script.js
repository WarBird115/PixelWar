import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";

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
const auth = getAuth();

// Firebase reference for the current week password node
const passwordRef = ref(database, 'Data/Password/currentWeekPassword');

// Weekly password display element
const adminPasswordText = document.getElementById('adminPasswordText');
let currentPassword = ''; // Store the password from Firebase here
let isUserAuthenticated = false; // Track user authentication status

// Temporary password for regular users
const regularUserPassword = "HappyN3wY3ar"; // Set your temporary password here

// Function to load the weekly password from Firebase
function loadWeeklyPassword() {
  adminPasswordText.textContent = 'Loading password...'; // Async loading message
  console.log("Attempting to load the weekly password from Firebase...");

  get(passwordRef).then((snapshot) => {
    if (snapshot.exists()) {
      currentPassword = snapshot.val();
      adminPasswordText.textContent = `Current weekly password: ${currentPassword}`;
      console.log("Password successfully loaded:", currentPassword);
    } else {
      console.warn("Password not found in Firebase. Setting a new password.");
      setWeeklyPassword(); // Set the weekly password if not already set
    }
  }).catch((error) => {
    console.error("Error retrieving password from Firebase:", error);
    adminPasswordText.textContent = 'Failed to load password.';
  });
}

// Function to set the weekly password in Firebase (admin only)
function setWeeklyPassword() {
  // Here, currentPassword should have a value from GitHub or another source.
  if (!currentPassword) {
    console.error("No password available to set. Make sure currentPassword is initialized from GitHub or another source.");
    adminPasswordText.textContent = 'Error: No password to set.';
    return;
  }

  set(passwordRef, currentPassword)
    .then(() => {
      console.log('Weekly password successfully set in Firebase:', currentPassword);
      adminPasswordText.textContent = `Current weekly password: ${currentPassword}`;
    })
    .catch((error) => {
      console.error('Error setting weekly password in Firebase:', error);
      adminPasswordText.textContent = 'Failed to set password.';
    });
}

// Load the weekly password when the page loads
loadWeeklyPassword();

// Admin login for placing pixels
const adminPasswordField = document.getElementById('adminPassword');
const loginButton = document.getElementById('loginButton');
const regularUserPasswordField = document.getElementById('regularUserPassword'); // Input field for regular users
const regularLoginButton = document.getElementById('regularLoginButton'); // Login button for regular users

loginButton.addEventListener('click', () => {
  const enteredPassword = adminPasswordField.value;
  if (enteredPassword === currentPassword) {
    isUserAuthenticated = true;
    alert('Admin Authentication successful!');
  } else {
    alert('Incorrect admin password!');
  }
});

regularLoginButton.addEventListener('click', () => {
  const enteredPassword = regularUserPasswordField.value;
  if (enteredPassword === regularUserPassword) {
    isUserAuthenticated = true;
    alert('Regular user Authentication successful!');
  } else {
    alert('Incorrect password for regular users!');
  }
});

// Initialize the canvas from Firebase
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cooldownTimer = document.getElementById('cooldown-timer');
const pixelSize = 10; // Pixel size
const cooldownDuration = 5 * 60 * 1000; // 5 minutes cooldown
let cooldownEndTime = null;

// Check for cooldown from localStorage
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

// Load canvas from Firebase
function loadCanvas() {
  const pixelsRef = ref(database, 'pixels/');
  onValue(pixelsRef, (snapshot) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear existing canvas
    snapshot.forEach((childSnapshot) => {
      const pixelData = childSnapshot.val();
      const [x, y] = childSnapshot.key.split(',').map(Number);
      ctx.fillStyle = pixelData.color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    });
  });
}

// Load canvas on page load
loadCanvas();
