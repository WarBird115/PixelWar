const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const colorPicker = document.getElementById('colorPicker');
const currentColorBox = document.getElementById('currentColor');
const countdownDisplay = document.getElementById('countdown');
const submitCodeButton = document.getElementById('submitCode');
const userInput = document.getElementById('userInput');

let isCanvasUnlocked = false;
let cooldown = false;
let pixelsPlaced = 0;
let cooldownTime = 300; // 300 seconds (5 minutes)
let countdownTimer;

// Initialize pixel color
let currentColor = colorPicker.value;

// Update the current color display
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    currentColorBox.style.backgroundColor = currentColor;
});

// Function to place a pixel on the canvas
function placePixel(x, y) {
    if (isCanvasUnlocked && !cooldown) {
        if (pixelsPlaced < 5) {
            ctx.fillStyle = currentColor;
            ctx.fillRect(x, y, 20, 20); // Change pixel size to 20x20
            pixelsPlaced++;

            if (pixelsPlaced === 5) {
                startCooldown(); // Start cooldown when the 5th pixel is placed
            }
        }
    }
}

// Function to start the cooldown
function startCooldown() {
    cooldown = true;
    let timeLeft = cooldownTime;
    countdownDisplay.textContent = `Cooldown: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;

    countdownTimer = setInterval(() => {
        timeLeft--;
        countdownDisplay.textContent = `Cooldown: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            cooldown = false;
            pixelsPlaced = 0; // Reset the pixel count
            countdownDisplay.textContent = `Cooldown: 0:00`;
        }
    }, 1000);
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
        userInput.value = ''; // Clear the input field
        loadCanvasState(); // Load previous canvas state
    } else {
        alert('Incorrect access code. Please try again.');
    }
});

// Load previous canvas state
function loadCanvasState() {
    const savedCanvas = localStorage.getItem('pixelCanvasState');
    if (savedCanvas) {
        const image = new Image();
        image.src = savedCanvas;
        image.onload = () => {
            ctx.drawImage(image, 0, 0);
        };
    }
}

// Save current canvas state
function saveCanvasState() {
    const canvasData = canvas.toDataURL();
    localStorage.setItem('pixelCanvasState', canvasData);
}

// Call loadCanvasState on page load
window.onload = loadCanvasState;

// Display the current color in the color box
currentColorBox.style.backgroundColor = currentColor;

// Prevent default right-click context menu
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
