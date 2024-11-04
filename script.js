import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, get } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
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
let userPassword = ''; // Store the user password

// Function to generate a random alphanumeric password
function generateRandomPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 5; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  console.log('Generated password:', password); // Debugging: log generated password
  return password;
}

// Encrypt password using AES
function encryptPassword(password) {
  const encrypted = CryptoJS.AES.encrypt(password, 'aVeryStrongSecretKey!123').toString();
  console.log('Encrypted password:', encrypted); // Debugging: log encrypted password
  return encrypted;
}

// Decrypt password
function decryptPassword(encryptedPassword) {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, 'aVeryStrongSecretKey!123');
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  console.log('Decrypted password:', decrypted); // Debugging: log decrypted password
  return decrypted;
}

// Function to set weekly user password in Firebase
async function setWeeklyUserPassword() {
  const now = new Date();
  const currentWeek = now.getFullYear() + "-W" + getWeekNumber(now);
  const storedWeekRef = ref(database, 'storedWeek');
  const userPasswordRef = ref(database, 'userPassword');

  // Get the current stored week and user password from Firebase
  const storedWeekSnapshot = await get(storedWeekRef);
  const storedWeek = storedWeekSnapshot.val();
  const userPasswordSnapshot = await get(userPasswordRef);
  const encryptedPassword = userPasswordSnapshot.val();

  console.log('Stored week:', storedWeek); // Debugging: log stored week
  console.log('Current week:', currentWeek); // Debugging: log current week
  console.log('Encrypted password from DB:', encryptedPassword); // Debugging: log encrypted password from DB

  // Check if the password needs to be changed
  if (storedWeek !== currentWeek || !encryptedPassword) {
    const newPassword = generateRandomPassword();
    const encryptedNewPassword = encryptPassword(newPassword);
    // Store the new password and current week in Firebase
    await set(userPasswordRef, encryptedNewPassword);
    await set(storedWeekRef, currentWeek);
    userPassword = newPassword; // Store the newly generated password for this week
    console.log('New password set:', newPassword); // Debugging: log the new password
  } else {
    userPassword = decryptPassword(encryptedPassword); // Retrieve and decrypt the existing password
    console.log('Existing password retrieved:', userPassword); // Debugging: log the retrieved password
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

// Check for cooldown
if (localStorage.getItem('cooldownEndTime')) {
  cooldownEndTime = parseInt(localStorage.getItem('cooldownEndTime'), 10);
  console.log('Cooldown end time retrieved from localStorage:', cooldownEndTime); // Debugging
  if (Date.now() < cooldownEndTime) {
    updateCooldownTimer();
  } else {
    localStorage.removeItem('cooldownEndTime');
    console.log('Cooldown has expired, removing from localStorage.'); // Debugging
  }
}

// Function to update the cooldown timer
function updateCooldownTimer() {
  const interval = setInterval(() => {
    const remainingTime = cooldownEndTime - Date.now();
    console.log('Remaining time for cooldown:', remainingTime); // Debugging
    if (remainingTime > 0) {
      const minutes = Math.floor(remainingTime / 1000 / 60);
      const seconds = Math.floor((remainingTime / 1000) % 60);
      cooldownTimer.textContent = `Next pixel in: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else {
      clearInterval(interval);
      cooldownEndTime = null;
      cooldownTimer.textContent = 'You can place a pixel now!';
      localStorage.removeItem('cooldownEndTime');
      console.log('Cooldown timer has ended.'); // Debugging
    }
  }, 1000);
}

// Color Picker
const colorPicker = document.getElementById('colorPicker');
let currentColor = colorPicker.value;
colorPicker.addEventListener('input', () => {
  currentColor = colorPicker.value;
  console.log('Current color selected:', currentColor); // Debugging: log current color
});

// Canvas click to place a pixel
canvas.addEventListener('click', (e) => {
  if (!isUserAuthenticated) {
    alert('You must enter the correct password to place a pixel!');
    console.log('User is not authenticated.'); // Debugging
    return;
  }

  if (cooldownEndTime && Date.now() < cooldownEndTime) {
    alert('You are still on cooldown!');
    console.log('User is still on cooldown.'); // Debugging
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / pixelSize);
  const y = Math.floor((e.clientY - rect.top) / pixelSize);

  console.log(`Placing pixel at: (${x}, ${y}) with color: ${currentColor}`); // Debugging

  ctx.fillStyle = currentColor;
  ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

  const pixelRef = ref(database, `pixels/${x},${y}`);
  set(pixelRef, { color: currentColor }).then(() => {
    console.log('Pixel saved successfully'); // Debugging
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
    console.log(`Color ${color} copied to clipboard.`); // Debugging
  }).catch((error) => {
    console.error('Error copying color:', error);
  });
});

// Password submission
document.getElementById('submitPassword').addEventListener('click', async () => {
  const passwordInput = document.getElementById('passwordInput').value;
  console.log('Password input:', passwordInput); // Debugging

  await setWeeklyUserPassword(); // Ensure the user password is set before validating input

  if (passwordInput === adminPassword) {
    document.getElementById('clearCanvasButton').style.display = 'inline';
    alert('Admin access granted. You can now clear the canvas.');
    console.log('Admin access granted.'); // Debugging
    return;
  }

  if (passwordInput === userPassword) {
    isUserAuthenticated = true;
    alert('Access granted! You can now place pixels.');
    console.log('User authenticated.'); // Debugging
    return;
  }

  alert('Invalid password!');
  console.log('Invalid password attempt.'); // Debugging
});

// Clear canvas button for admins
document.getElementById('clearCanvasButton').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const pixelsRef = ref(database, 'pixels');
  remove(pixelsRef).then(() => {
    console.log('Canvas cleared successfully'); // Debugging
  }).catch((error) => {
    console.error('Error clearing canvas:', error);
  });
});

// Load previously placed pixels from Firebase
const loadPixels = () => {
  const pixelsRef = ref(database, 'pixels');
  onValue(pixelsRef, (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const coords = childSnapshot.key.split(','); // Get the coordinates
      const color = childSnapshot.val().color; // Get the color
      const x = parseInt(coords[0], 10);
      const y = parseInt(coords[1], 10);
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      console.log(`Loaded pixel at (${x}, ${y}) with color ${color}`); // Debugging
    });
  });
};

// Initial function calls
setWeeklyUserPassword(); // Call this on load to set or get the user password
loadPixels(); // Load pixels from Firebase on startup
