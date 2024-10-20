import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
import CryptoJS from "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js";

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
const adminPassword = "The0verseer"; // Admin password (constant)
const pixelSize = 10; // Pixel size, adjustable
const cooldownDuration = 5 * 60 * 1000; // 5 minutes cooldown
let cooldownEndTime = null;
let isUserAuthenticated = false; // Track user authentication status

// Function to generate a random alphanumeric password
function generateRandomPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 5; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Encrypt password using AES
function encryptPassword(password) {
  return CryptoJS.AES.encrypt(password, 'your-secret-key').toString();
}

// Decrypt password
function decryptPassword(encryptedPassword) {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, 'your-secret-key');
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Function to set weekly user password in localStorage
function setWeeklyUserPassword() {
  const now = new Date();
  const currentWeek = now.getFullYear() + "-W" + getWeekNumber(now);
  const storedWeek = localStorage.getItem('storedWeek');
  let userPassword = localStorage.getItem('userPassword');

  if (storedWeek !== currentWeek || !userPassword) {
    const newPassword = generateRandomPassword();
    const encryptedPassword = encryptPassword(newPassword);
    localStorage.setItem('userPassword', encryptedPassword);
    localStorage.setItem('storedWeek', currentWeek);
    return newPassword; // Return newly generated password for this week
  } else {
    return decryptPassword(userPassword); // Return decrypted password
  }
}

// Get current week number
function getWeekNumber(date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + firstJan.getDay() + 1) / 7);
}

// Set canvas size
const canvasWidth = 400;
const canvasHeight = 400;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Check for cooldown in localStorage
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
  set(pixelRef, { color: currentColor }).then(() => {
    console.log('Pixel saved');
  }).catch((error) => {
    console.error('Error saving pixel:', error);
  });

  cooldownEndTime = Date.now() + cooldownDuration;
  localStorage.setItem('cooldownEndTime', cooldownEndTime);
  updateCooldownTimer();
});

// Right-click to copy pixel color
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault(); // Prevent the context menu from appearing
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

// Password submission
document.getElementById('submitPassword').addEventListener('click', () => {
  const passwordInput = document.getElementById('passwordInput').value;

  if (passwordInput === adminPassword) {
    document.getElementById('clearCanvasButton').style.display = 'inline';
    alert('Admin access granted. You can now clear the canvas.');
    isUserAuthenticated = true;

    // Generate and log the encrypted weekly password for admin only
    const userPassword = setWeeklyUserPassword(); // Generate or retrieve the weekly password
    const encryptedPassword = encryptPassword(userPassword); // Encrypt the password
    // Admin sees the encrypted password but it won't be displayed anywhere else
    console.log('Weekly Encrypted Password (for Admin):', encryptedPassword); 

  } else {
    const userPassword = setWeeklyUserPassword();
    if (passwordInput === userPassword) {
      alert('User access granted. You can now place pixels!');
      isUserAuthenticated = true;
    } else {
      alert('Incorrect password!');
    }
  }
});

// Clear canvas button
document.getElementById('clearCanvasButton').addEventListener('click', () => {
  const confirmed = confirm('Are you sure you want to clear the canvas?');
  if (confirmed) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const pixelsRef = ref(database, 'pixels/');
    remove(pixelsRef).then(() => {
      console.log('Canvas cleared in database');
    }).catch((error) => {
      console.error('Error clearing canvas:', error);
    });
  }
});

// Retrieve pixels from Firebase
onValue(ref(database, 'pixels/'), (snapshot) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear canvas before drawing
  snapshot.forEach(childSnapshot => {
    const { color } = childSnapshot.val();
    const [x, y] = childSnapshot.key.split(',').map(Number);
    ctx.fillStyle = color;
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  });
});

// Set the weekly user password for the first time
setWeeklyUserPassword();
