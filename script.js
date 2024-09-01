const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
let color = '#000000';
let accessCode = '';

// Function to generate a random access code
function generateAccessCode() {
    // Generate a random 6-digit code
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

// Function to provide access code to the Discord bot
const getAccessCode = () => accessCode;

canvas.addEventListener('click', function(event) {
    const x = Math.floor(event.offsetX / 10) * 10;
    const y = Math.floor(event.offsetY / 10) * 10;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 10, 10);
});

colorPicker.addEventListener('input', function() {
    color = colorPicker.value;
});

// Check if user input matches the access code (could be called by the bot later)
document.getElementById('submitCode').addEventListener('click', function() {
    const userInput = document.getElementById('userInput').value;
    if (userInput === accessCode) {
        document.getElementById('accessSection').style.display = 'none'; // Hide access section
        alert('Access granted! Enjoy creating on the canvas!');
    } else {
        alert('Incorrect code. Please try again.');
    }
});
