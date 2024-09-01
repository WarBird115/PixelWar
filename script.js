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

// Handle access code submission
document.getElementById('submitCode').addEventListener('click', function() {
    const userInput = document.getElementById('userInput').value;
    if (userInput === accessCode) {
        document.getElementById('overlay').style.display = 'none'; // Hide overlay
        canvas.style.cursor = 'crosshair'; // Change cursor style
        canvas.style.pointerEvents = 'auto'; // Enable interactions
    } else if (userInput === adminPassword) {
        alert('Admin access granted! You can now use the canvas.');
        document.getElementById('overlay').style.display = 'none'; // Hide overlay for admin
        canvas.style.cursor = 'crosshair'; // Change cursor style for admin
        canvas.style.pointerEvents = 'auto'; // Enable interactions for admin
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
});

colorPicker.addEventListener('input', function() {
    color = colorPicker.value;
});
