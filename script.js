const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cooldownTimer = document.getElementById('cooldown-timer');
const cooldownDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
let cooldownEndTime = null;

// Passwords
const adminPassword = "Itsameamario1"; // Admin password
let userPassword = "12345"; // Regular user password

// Check for existing cooldown in localStorage
const savedCooldownEndTime = localStorage.getItem('cooldownEndTime');
if (savedCooldownEndTime && Date.now() < savedCooldownEndTime) {
  cooldownEndTime = parseInt(savedCooldownEndTime, 10);
  updateCooldownTimer();
}

// Default color for pixels
let currentColor = '#000000'; // Black

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

  // Draw a larger pixel at the clicked position
  ctx.fillStyle = currentColor;
  ctx.fillRect(x * 4, y * 4, 4, 4); // Each pixel is now 4x4

  // Start the cooldown
  startCooldown();
});

// Color Picker Event
document.getElementById("colorPicker").addEventListener("input", function() {
  currentColor = this.value; // Update current color based on color picker
});

function startCooldown() {
  cooldownEndTime = Date.now() + cooldownDuration;
  localStorage.setItem('cooldownEndTime', cooldownEndTime);
  updateCooldownTimer();
}

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
  // Enable pixel placement
  canvas.style.pointerEvents = 'auto';
  // Show 'Clear Canvas' button if admin
  if (isAdmin) {
    document.getElementById("clearCanvasButton").style.display = 'block';
  }
}

// Clear Canvas Functionality
document.getElementById("clearCanvasButton").addEventListener("click", function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
