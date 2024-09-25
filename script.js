const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearCanvasButton = document.getElementById('clearCanvasButton');
const cooldownTimer = document.getElementById('cooldown-timer');

// Set a fixed pixel size for drawing
const pixelSize = 10;

// Cooldown variables
const cooldownDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
let cooldownEndTime = null;

// Initialize the canvas with a light background
ctx.fillStyle = '#f0f0f0';
ctx.fillRect(0, 0, canvas.width, canvas.height);

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

// Clear canvas functionality
clearCanvasButton.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Reset to light background
});

// Pixel placement with cooldown logic
canvas.addEventListener('click', (e) => {
  if (cooldownEndTime && Date.now() < cooldownEndTime) {
    alert('You are still on cooldown!');
    return;
  }

  // Get the mouse position relative to the canvas
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;  // No scaling, direct position
  const y = e.clientY - rect.top;   // No scaling, direct position

  console.log(`Placing pixel at: (${x}, ${y})`);

  // Draw a pixel using the selected color from the color picker
  ctx.fillStyle = colorPicker.value;
  ctx.fillRect(x, y, pixelSize, pixelSize);  // Direct pixel placement

  console.log(`Color used: ${ctx.fillStyle}`);

  // Start the cooldown
  startCooldown();
});

function startCooldown() {
  cooldownEndTime = Date.now() + cooldownDuration;
  localStorage.setItem('cooldownEndTime', cooldownEndTime);
  updateCooldownTimer();
}
