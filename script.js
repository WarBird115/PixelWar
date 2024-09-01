const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
let color = '#000000';
let accessCode = '';
const adminPassword = 'Itsameamario1'; // Admin password

// Function to generate a random access code
function generateAccessCode() {
    accessCode = Math.floor(100000 + Math.random() * 900000).toString();
}

// Store the access code on a global object (or use localStorage)
let storedAccessCode = localStorage.getItem("accessCode");

if (!storedAccessCode) {
    generateAccessCode();
    localStorage.setItem("accessCode", accessCode);
} else {
    accessCode = storedAccessCode; // Use existing access code
}

// Load the canvas state from localStorage
function loadCanvas() {
    const canvasData = localStorage.getItem("canvasData");
    if (canvasData) {
        const pixels = JSON.parse(canvasData);
        pixels.forEach(pixel => {
            ctx.fillStyle = pixel.color;
            ctx.fillRect(pixel.x, pixel.y, 10, 10);
        });
    }
}

// Save the canvas state to localStorage
function saveCanvas() {
    const pixels = [];
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += 10) {
        for (let x = 0; x < canvas.width; x += 10) {
            const index = (y * imageData.width + x) * 4;
            const color = `rgba(${imageData.data[index]}, ${imageData.data[index + 1]}, ${imageData.data[index + 2]}, ${imageData.data[index + 3]})`;
            if (color !== 'rgba(255, 255, 255, 0)') { // Only save non-transparent pixels
                pixels.push({ x: x, y: y, color: color });
            }
        }
    }
    localStorage.setItem("canvasData", JSON.stringify(pixels));
}

// Handle access code submission
document.getElementById('submitCode').addEventListener('click', function() {
    const userInput = document.getElementById('userInput').value.trim(); // Trim any whitespace
    console.log(`User Input: ${userInput}`); // Debugging information
    console.log(`Stored Access Code: ${accessCode}`); // Debugging information
    console.log(`Admin Password: ${adminPassword}`); // Debugging information
    
    if (userInput === accessCode) {
        document.getElementById('overlay').style.display = 'none'; // Hide overlay
        canvas.style.cursor = 'crosshair'; // Change cursor style
        canvas.style.pointerEvents = 'auto'; // Enable interactions
        loadCanvas(); // Load the canvas state
    } else if (userInput === adminPassword) {
        alert('Admin access granted! You can now use the canvas.');
        document.getElementById('overlay').style.display = 'none'; // Hide overlay for admin
        canvas.style.cursor = 'crosshair'; // Change cursor style for admin
        canvas.style.pointerEvents = 'auto'; // Enable interactions for admin
        loadCanvas(); // Load the canvas state
    } else {
        document.getElementById('adminMessage').innerText = 'Invalid access code or password. Please try again.';
    }
});

// Canvas functionality
canvas.addEventListener('click', function(event) {
    const x = Math.floor(event.offsetX / 10) * 10;
    const y = Math.floor(event.offsetY / 10) * 10;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 10, 10);
    saveCanvas(); // Save the canvas state
});

colorPicker.addEventListener('input', function
