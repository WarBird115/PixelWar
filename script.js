const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const colorPicker = document.getElementById('colorPicker');
const currentColorBox = document.getElementById('currentColor');
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

// Load cooldown state from local storage
function loadCooldownState() {
    const savedCooldown = localStorage.getItem('cooldown');
    const savedTimeLeft = localStorage.getItem('timeLeft');

    if (savedCooldown === 'true' && savedTimeLeft) {
        cooldown = true;
        const timeLeft = parseInt(savedTimeLeft, 10);
        startCooldown(timeLeft); // Restore the countdown timer
    }
}

// Function to place a pixel on the canvas
function placePixel(x, y) {
    if (isCanvasUnlocked && !cooldown) {
        const gridX = Math.floor(x / 50) * 50;
        const gridY = Math.floor(y / 50) * 50;
        const pixelKey = `${gridX},${gridY}`;

        // Check if the pixel position is already occupied
        if (!placedPixels.includes(pixelKey)) {
            ctx.fillStyle = currentColor;
            ctx.fillRect(gridX, gridY, 50, 50); // Set pixel size to 50x50
            placedPixels.push(pixelKey);
            pixelsPlaced++;

            if (pixelsPlaced === 5) {
                startCooldown(); // Start cooldown when the 5th pixel is placed
            }
        }
    }
}

// Function to start the cooldown
function startCooldown(timeLeft = cooldownTime) {
    cooldown = true;
    countdownDisplay.textContent = `Cooldown: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
    
    // Save cooldown state to local storage
    localStorage.setItem('cooldown', 'true');
    localStorage.setItem('timeLeft', timeLeft);

    countdownTimer = setInterval(() => {
        timeLeft--;
        countdownDisplay.textContent = `Cooldown: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        
        // Save the remaining time to local storage
        localStorage.setItem('timeLeft', timeLeft);

        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            cooldown = false;
            pixelsPlaced = 0; // Reset the pixel count
            countdownDisplay.textContent = `Cooldown: 0:00`;
            localStorage.removeItem('cooldown'); // Clear cooldown state
            localStorage.removeItem('timeLeft'); // Clear time left
        }
    }, 1000);
}

// Call loadCooldownState on page load
window.onload = () => {
    loadCanvasState(); // Load the canvas state
    loadCooldownState(); // Load the cooldown state
};

// Function to handle access code submission
submitCodeButton.addEventListener('click', () => {
    const code = userInput.value;

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

// Wipe canvas functionality (already present in your code)
wipeCanvasButton.addEventListener('click', () => {
    if (confirm("Are you sure you want to wipe the canvas? This action cannot be undone.")) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        placedPixels.length = 0; // Clear the placed pixels array
        saveCanvasState(); // Save the cleared canvas state
    }
});

// Load previous canvas state from local storage
function loadCanvasState() {
    const savedPixels = JSON.parse(localStorage.getItem('placedPixels'));
    if (savedPixels) {
        savedPixels.forEach(pixel => {
            const [gridX, gridY] = pixel.split(',').map(Number);
            ctx.fillStyle = "#000000"; // Use a default color or saved color
            ctx.fillRect(gridX, gridY, 50, 50);
            placedPixels.push(pixel);
        });
    }
}

// Save the current canvas state to local storage
function saveCanvasState() {
    localStorage.setItem('placedPixels', JSON.stringify(placedPixels));
}

// Prevent default right-click context menu
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
