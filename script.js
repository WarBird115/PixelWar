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

// Array to keep track of placed pixels
const placedPixels = [];
const pixelSize = 10; // Adjusted pixel size

// Update the current color display
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    currentColorBox.style.backgroundColor = currentColor;
});

// Load cooldown state from local storage
function loadCooldownState() {
    const savedCooldownEnd = localStorage.getItem('cooldownEnd');
    console.log("Saved Cooldown End:", savedCooldownEnd); // Debugging message
    
    if (savedCooldownEnd) {
        const now = new Date().getTime();
        const cooldownEnd = parseInt(savedCooldownEnd, 10);
        console.log("Current Time:", now, "Cooldown End Time:", cooldownEnd); // Debugging message

        if (now < cooldownEnd) {
            const timeLeft = Math.floor((cooldownEnd - now) / 1000);
            console.log("Time Left on Cooldown:", timeLeft); // Debugging message
            startCooldown(timeLeft); // Restore the countdown timer
        }
    }
}

// Function to place a pixel on the canvas
function placePixel(x, y) {
    if (isCanvasUnlocked && !cooldown) {
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

            if (pixelsPlaced === 5) {
                startCooldown(); // Start cooldown when the 5th pixel is placed
            }
        }
    }
}

// Function to start the cooldown
function startCooldown(timeLeft = cooldownTime) {
    cooldown = true;
    const cooldownEnd = new Date().getTime() + (timeLeft * 1000);
    console.log("New Cooldown End:", cooldownEnd); // Debugging message
    localStorage.setItem('cooldownEnd', cooldownEnd);

    countdownDisplay.textContent = `Cooldown: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;

    countdownTimer = setInterval(() => {
        timeLeft--;
        countdownDisplay.textContent = `Cooldown: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            cooldown = false;
            pixelsPlaced = 0; // Reset the pixel count
            countdownDisplay.textContent = `Cooldown: 0:00`;
            localStorage.removeItem('cooldownEnd'); // Clear cooldown end time
        }
    }, 1000);
}

// Call loadCooldownState on page load
window.onload = () => {
    loadCanvasState(); // Load the canvas state
    loadCooldownState(); // Load the cooldown state
};

// Function to handle mouse click events on the canvas
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left));
    const y = Math.floor((e.clientY - rect.top));
    placePixel(x, y);
});

// Function to handle middle-click to pick color
canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1) { // Middle-click
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left));
        const y = Math.floor((e.clientY - rect.top));

        const gridX = Math.floor(x / pixelSize) * pixelSize;
        const gridY = Math.floor(y / pixelSize) * pixelSize;
        const pixelKey = `${gridX},${gridY}`;

        if (placedPixels.includes(pixelKey)) {
            // Get the pixel color at the clicked position
            const pixelData = ctx.getImageData(gridX, gridY, pixelSize, pixelSize).data;
            const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
            console.log("Picked Color:", color); // Debugging message
            currentColor = color;
            currentColorBox.style.backgroundColor = currentColor;
            colorPicker.value = rgbToHex(color);
        }
    }
});

// Function to convert RGB to HEX
function rgbToHex(rgb) {
    const rgbValues = rgb.match(/\d+/g).map(x => parseInt(x));
    return `#${((1 << 24) + (rgbValues[0] << 16) + (rgbValues[1] << 8) + rgbValues[2]).toString(16).slice(1)}`;
}

// Event listener for the submit button
submitCodeButton.addEventListener('click', () => {
    const inputCode = userInput.value;
    if (inputCode === 'unlock') { // Change to your desired access code
        isCanvasUnlocked = true;
        overlay.style.display = 'none'; // Hide overlay
        userInput.value = ''; // Clear input
        wipeCanvasButton.style.display = 'inline'; // Show wipe button
        console.log("Canvas Unlocked"); // Debugging message
    } else {
        alert('Incorrect access code. Please try again.');
        console.log("Incorrect Code Entered:", inputCode); // Debugging message
    }
});

// Event listener for wipe canvas button
wipeCanvasButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    placedPixels.length = 0; // Reset placed pixels
    console.log("Canvas Wiped"); // Debugging message
});
