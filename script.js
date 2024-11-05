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

// Set canvas size
const canvasWidth = 400;
const canvasHeight = 400;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

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

// Load passwords from GitHub
const passwordFileURL = "https://github.com/WarBird115/PixelWar/blob/main/.github/workflows/update-password.yml"; // Update with your actual file URL

// Function to fetch passwords from the GitHub file
async function fetchPasswords() {
    try {
        const response = await fetch(passwordFileURL);
        const data = await response.json();
        return data.passwords || []; // Assuming your JSON has a "passwords" key
    } catch (error) {
        console.error("Error fetching passwords:", error);
        return [];
    }
}

// Function to set the weekly password
async function setWeeklyPassword() {
    const passwords = await fetchPasswords();
    if (passwords.length > 0) {
        const randomIndex = Math.floor(Math.random() * passwords.length);
        weeklyPassword = passwords[randomIndex];
        console.log("New Weekly Password:", weeklyPassword);
    } else {
        console.error("No passwords available to set.");
    }
}

// Password submission
document.getElementById('submitPassword').addEventListener('click', async () => {
  const passwordInput = document.getElementById('passwordInput').value;

  console.log('Password input:', passwordInput); // Debug log

  if (passwordInput === "YourFixedAdminPasswordHere") { // Use your fixed admin password or set it as a variable
    await setWeeklyPassword(); // Fetch and set the weekly password
    document.getElementById('clearCanvasButton').style.display = 'inline';
    alert(`Admin access granted. You can now clear the canvas. Regular user password is: ${weeklyPassword}`);
    isUserAuthenticated = true;
  } else {
    alert('Incorrect password!');
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

// Load pixels from Firebase on startup
onValue(ref(database, 'pixels/'), (snapshot) => {
  const pixels = snapshot.val();
  if (pixels) {
    Object.keys(pixels).forEach((key) => {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = pixels[key].color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    });
  }
});

// Check for week change and set password on page load
window.onload = async () => {
    await setWeeklyPassword(); // Ensure a password is set when the page loads
    console.log("Current Weekly Password (for Admin):", weeklyPassword); // Optional: Log current password for admins
};
