const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cooldownTimer = document.getElementById('cooldown-timer');
const cooldownDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
let cooldownEndTime = null;

// Admin Password
const adminPassword = "Itsameamario1";

// Regular User Password (generated dynamically)
function generateWeeklyPassword() {
  const currentWeek = getWeekNumber(new Date());
  const basePassword = 'pixelwars'; // Base for the password
  return `${basePassword}${currentWeek}`;
}

function getWeekNumber(d) {
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
}

let currentWeekPassword = generateWeeklyPassword();

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

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / (rect.width / canvas.width));
  const y = Math.floor((e.clientY - rect.top) / (rect.height / canvas.height));

  ctx.fillStyle = colorPicker.value;
  ctx.fillRect(x, y, 10, 10); // Larger pixel size

  startCooldown();
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
    displayWeeklyPassword(); // Display weekly password for admin
  } else if (inputPassword === currentWeekPassword) {
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

// Display weekly password for admin
function displayWeeklyPassword() {
  const adminMessage = document.createElement('div');
  adminMessage.textContent = `Weekly User Password: ${currentWeekPassword}`;
  adminMessage.style.marginTop = '10px';
  adminMessage.style.color = '#00FF00'; // Green color for admin message
  document.body.appendChild(adminMessage);
}
