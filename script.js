const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const overlay = document.getElementById('overlay');
let color = '#000000';
let accessCode = '';

// Function to generate a random access code
function generateAccessCode() {
    accessCode = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit code
}

// Store the access code on a global object (or use localStorage)
let storedAccessCode = localStorage.getItem("accessCode");

if (!storedAccessCode) {
    generateAccessCode();
    localStorage.setItem("accessCode", accessCode);
} else {
    accessCode = storedAccessCode; // Use existing access code
}

// Function to provide access code to the Discord bot
const getAccessCode = () => accessCode;

// Load pixel placements from localStorage when the page loads
function loadPixels() {
    const pixels = JSON.parse(localStorage.getItem('pixels')) || [];
    pixels.forEach(pixel => {
        ctx.fillStyle = pixel.color;
        ctx.fillRect(pixel.x, pixel.y, 10, 10);
    });
}

// Save pixel placement in localStorage
function savePixel(x, y) {
    const pixels = JSON.parse(localStorage.getItem('pixels')) || [];
    // Check if the pixel is already in the array
    const existingPixelIndex = pixels.findIndex(p => p.x === x && p.y === y);
    if (existingPixelIndex !== -1) {
        pixels[existingPixelIndex].color = color; // Update existing pixel color
    } else {
        pixels.push({ x, y, color }); // Add new pixel
    }
    localStorage.setItem('pixels', JSON.stringify(pixels));
}

// Enable canvas and remove overlay
function unlockCanvas() {
    overlay.style.display = 'none'; // Hide the overlay
    canvas.style.cursor = 'crosshair'; // Change cursor back to normal
    canvas.style.pointerEvents = 'auto'; // Enable interactions
}

// Canvas click event (only works when unlocked)
canvas.addEventListener('click', function(event) {
    const x = Math.floor(event.offsetX / 10) * 10;
    const y = Math.floor(event.offsetY / 10) * 10;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 10, 10);
    savePixel(x, y); // Save the pixel placement
});

// Load pixels when the page loads
window.onload = loadPixels;

colorPicker.addEventListener('input', function() {
    color = colorPicker.value;
});

// Check if user input matches the access code
document.getElementById('submitCode').addEventListener('click', function() {
    const userInput = document.getElementById('userInput').value;
    if (userInput === accessCode) {
        document.getElementById('accessSection').style.display = 'none'; // Hide access section
        unlockCanvas(); // Unlock the canvas
        alert('Access granted! Enjoy creating on the canvas!');
    } else {
        alert('Incorrect code. Please try again.');
    }
});
