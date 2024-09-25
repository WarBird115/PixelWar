const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cooldownTimer = document.getElementById('cooldown-timer');
const cooldownDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
let cooldownEndTime = null;

// Passwords
const adminPassword = "Itsameamario1"; // Admin password
const userPassword = "12345"; // Regular user password

// Check for existing cooldown in localStorage
const savedCooldownEndTime = localStorage.getItem('cooldownEndTime');
if (savedCooldownEndTime && Date.now() < savedCooldownEndTime) {
  cooldownEndTime = parseInt(savedCooldownEndTime, 10);
  updateCooldownTimer();
}

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
  ctx.fillStyle = selectedColor;
  ctx.fillRect(x, y, 10, 10); // Adjusted pixel size to 10x10 for visibility

  console.log(`Placing pixel at: (${x}, ${y})`);
  console.log(`Color being used: ${selectedColor}`);

  // Start the cooldown
  startCooldown();
});

function startCooldown() {
  cooldownEndTime = Date.now() + cooldownDuration;
  localStorage.setItem('cooldownEndTime', cooldownEndTime);
  updateCooldownTimer();
}

function updateCooldownTimer() {
  const interval = setInterval(() => {
    if (!cooldownEndTime) {
      clearInterval(interval);
      return;
    }

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

// Authentication
let isUserAuthenticated = false;
document.getElementById("submitPassword").addEventListener("click", function() {
  const inputPassword = document.getElementById("passwordInput").value;

  if (inputPassword === adminPassword) {
    alert("Welcome, Admin!");
    isUserAuthenticated = true;
    enableCanvasInteraction(true);
  } else if (inputPassword === userPassword) {
    alert("Welcome, User!");
    isUserAuthenticated = true;
    enableCanvasInteraction(false);
  } else {
    alert("Incorrect password!");
  }
});

function enableCanvasInteraction(isAdmin) {
  canvas.style.pointerEvents = 'auto';
  if (isAdmin) {
    document.getElementById("clearCanvasButton").style.display = 'block';
  }
}

// Clear Canvas Functionality
document.getElementById("clearCanvasButton").addEventListener("click", function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Color picker functionality
const colorPicker = document.getElementById('colorPicker');
let selectedColor = '#000000'; // Default to black

colorPicker.addEventListener('change', (e) => {
  selectedColor = e.target.value;
});
