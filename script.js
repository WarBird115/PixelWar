const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const colorPicker = document.getElementById('colorPicker');
const countdownDisplay = document.getElementById('countdown');
const submitCodeButton = document.getElementById('submitCode');
const userInput = document.getElementById('userInput');
const wipeCanvasButton = document.getElementById('wipeCanvasButton');

let isCanvasUnlocked = false;
let cooldown = false;
let pixelsPlaced = 0;
let cooldownTime = 300; // 300 seconds (5 minutes)
let countdownTimer;

// Initialize pixel color
let currentColor = colorPicker.value;

// Array to keep track of placed pixels
const placedPixels = [];
const pixelSize = 10; // Adjusted pixel size

// Update the current color display
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
});

// Function to place a pixel on the canvas
function placePixel(x, y) {
    if (isCanvasUnlocked && !cooldown && pixelsPlaced < 1) { // Limit to one pixel
        // Calculate grid position
        const gridX = Math.floor(x / pixelSize) * pixelSize;
        const gridY = Math.floor(y / pixelSize) * pixelSize;
        const pixelKey = `${gridX},${gridY}`;

        // Check if the pixel position is already occupied
        if (!placedPixels.includes(pixelKey)) {
            ctx.fillStyle = currentColor;
            ctx.fillRect(gridX, gridY, pixelSize, pixelSize); // Set pixel size to pixelSize x pixelSize
            placedPixels.push(pixelKey);
            pixelsPlaced++;

            if (pixelsPlaced === 1) {
                startCooldown(); // Start cooldown after one pixel is placed
            }
        }
    }
}

// Function to start the cooldown
function startCooldown(timeLeft = cooldownTime) {
    cooldown = true;
    const cooldownEnd = new Date().getTime() + (timeLeft * 1000);
    localStorage.setItem('cooldownEnd', cooldownEnd);
    updateCountdownDisplay(timeLeft);

    countdownTimer = setInterval(() => {
        timeLeft--;
        updateCountdownDisplay(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            cooldown = false;
            pixelsPlaced = 0; // Reset the pixel count
            countdownDisplay.textContent = 'Cooldown: 0:00';
            localStorage.removeItem('cooldownEnd'); // Clear cooldown end time
        }
    }, 1000);
}

// Function to update countdown display
function updateCountdownDisplay(timeLeft) {
    countdownDisplay.textContent = `Cooldown: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
}

// Function to handle mouse click events on the canvas
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left));
    const y = Math.floor((e.clientY - rect.top));
    placePixel(x, y);
    saveCanvasState(); // Save the canvas state after placing a pixel
});

// Function to handle access code submission
submitCodeButton.addEventListener('click', () => {
    const code = userInput.value;

    // Check if the entered code is correct
    if (code === "Itsameamario1") {
        overlay.style.display = 'none'; // Unlock the canvas
        isCanvasUnlocked = true; // Set the flag to true
        wipeCanvasButton.style.display = 'block'; // Show the wipe button
        userInput.value = ''; // Clear the input field
        loadCanvasState(); // Load previous canvas state
    } else {
        alert('Incorrect access code. Please try again.');
    }
});

// Function to wipe the canvas
wipeCanvasButton.addEventListener('click', () => {
    if (confirm("Are you sure you want to wipe the canvas? This action cannot be undone.")) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        placedPixels.length = 0; // Clear the array
        cooldown = false; // Reset cooldown
        countdownDisplay.textContent = 'Cooldown: 0:00'; // Reset countdown display
        pixelsPlaced = 0; // Reset pixel count
        localStorage.removeItem('cooldownEnd'); // Clear cooldown end time
    }
});

// Save the canvas state to local storage
function saveCanvasState() {
    const canvasData = canvas.toDataURL();
    localStorage.setItem('canvasData', canvasData);
}

// Load the canvas state from local storage
function loadCanvasState() {
    const canvasData = localStorage.getItem('canvasData');
    if (canvasData) {
        const img = new Image();
        img.src = canvasData;
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
    }
}

// Check for an existing cooldown on page load
window.onload = () => {
    const cooldownEnd = localStorage.getItem('cooldownEnd');
    if (cooldownEnd) {
        const timeLeft = Math.floor((cooldownEnd - new Date().getTime()) / 1000);
        if (timeLeft > 0) {
            startCooldown(timeLeft);
        }
    }
};
