document.addEventListener('DOMContentLoaded', () => {
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

    // WebSocket connection
    const socket = new WebSocket('ws://localhost:3000');

    // Function to generate a random 5-digit code
    function generateRandomCode() {
        return Math.floor(10000 + Math.random() * 90000).toString(); // Generates a random 5-digit code
    }

    // Function to check if it's Sunday after 17:00
    function isSundayAfterFive() {
        const now = new Date();
        return now.getDay() === 0 && now.getHours() >= 17; // Sunday = 0
    }

    // Function to load or generate the access code
    function loadOrGenerateAccessCode() {
        const lastGeneratedCode = localStorage.getItem('randomAccessCode');
        const lastGeneratedTime = localStorage.getItem('lastGeneratedTime');
        const now = new Date();

        if (lastGeneratedCode && lastGeneratedTime) {
            const lastTime = new Date(parseInt(lastGeneratedTime));

            // If it's Sunday after 17:00 and the last code was generated earlier, generate a new code
            if (isSundayAfterFive() && now > lastTime) {
                const newCode = generateRandomCode();
                localStorage.setItem('randomAccessCode', newCode);
                localStorage.setItem('lastGeneratedTime', Date.now());
            }
        } else {
            // Generate and store a new code if none exists
            const newCode = generateRandomCode();
            localStorage.setItem('randomAccessCode', newCode);
            localStorage.setItem('lastGeneratedTime', Date.now());
        }
    }

    // Call this function on page load
    loadOrGenerateAccessCode();

    // Update the current color display
    colorPicker.addEventListener('input', (e) => {
        currentColor = e.target.value;
    });

    // Function to save the current state of the canvas to localStorage
    function saveCanvasState() {
        const savedPixels = JSON.stringify(placedPixels);
        localStorage.setItem('placedPixels', savedPixels);
    }

    // Function to load the saved state of the canvas from localStorage
    function loadCanvasState() {
        const savedPixels = localStorage.getItem('placedPixels');
        if (savedPixels) {
            const pixelData = JSON.parse(savedPixels);
            pixelData.forEach(pixel => {
                ctx.fillStyle = pixel.color;
                ctx.fillRect(pixel.x, pixel.y, pixelSize, pixelSize);
                placedPixels.push(pixel);
            });
        }
    }

    // Function to place a pixel on the canvas
    function placePixel(x, y) {
        if (isCanvasUnlocked && !cooldown) {
            const gridX = Math.floor(x / pixelSize) * pixelSize;
            const gridY = Math.floor(y / pixelSize) * pixelSize;
            const pixelKey = `${gridX},${gridY}`;

            // Check if the pixel position is already occupied
            if (!placedPixels.some(pixel => pixel.x === gridX && pixel.y === gridY)) {
                const newPixel = {
                    x: gridX,
                    y: gridY,
                    color: currentColor
                };
                ctx.fillStyle = newPixel.color;
                ctx.fillRect(gridX, gridY, pixelSize, pixelSize);
                placedPixels.push(newPixel);

                saveCanvasState(); // Save the pixel placement to localStorage

                // Send the new pixel to the server via WebSocket
                socket.send(JSON.stringify({ type: 'placePixel', pixel: newPixel }));

                pixelsPlaced++;

                if (pixelsPlaced === 1) {
                    startCooldown(); // Start cooldown when the 1st pixel is placed
                }
            }
        }
    }

    // Function to start the cooldown
    function startCooldown(timeLeft = cooldownTime) {
        cooldown = true;
        const cooldownEnd = Date.now() + timeLeft * 1000;
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
        countdownDisplay.textContent = `Cooldown: ${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;
    }

    // Handle WebSocket events
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'newPixel') {
            // Render a newly placed pixel from other users
            const pixel = data.pixel;
            ctx.fillStyle = pixel.color;
            ctx.fillRect(pixel.x, pixel.y, pixelSize, pixelSize);
            placedPixels.push(pixel); // Update local state
        }
    };

    // On page load, check if there's an active cooldown
    const cooldownEnd = localStorage.getItem('cooldownEnd');
    if (cooldownEnd) {
        const now = Date.now();
        const timeLeft = Math.floor((cooldownEnd - now) / 1000);

        if (timeLeft > 0) {
            startCooldown(timeLeft); // Resume cooldown
        } else {
            localStorage.removeItem('cooldownEnd'); // Clear expired cooldown
        }
    }

    // Add event listener for canvas click
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        placePixel(x, y);
    });

    // Add event listener for submitting access code
    submitCodeButton.addEventListener('click', () => {
        const accessCode = localStorage.getItem('randomAccessCode');
        const adminPassword = "Itsameamario1"; // Set the admin password

        console.log(`Access Code: ${accessCode}, User Input: ${userInput.value}, Admin Password: ${adminPassword}`); // Debugging log

        // Check if the user input matches either the access code or the admin password
        if (userInput.value === accessCode || userInput.value === adminPassword) {
            overlay.style.display = 'none';
            isCanvasUnlocked = true;
            userInput.value = ''; // Clear the input field
            wipeCanvasButton.style.display = 'block'; // Show the wipe canvas button
        } else {
            alert('Incorrect access code or admin password. Please try again.');
        }
    });

    // Add event listener for the wipe canvas button
    wipeCanvasButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to wipe the canvas?')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            placedPixels.length = 0; // Clear placed pixels
            localStorage.removeItem('placedPixels'); // Clear localStorage
            alert('Canvas has been wiped!');
        }
    });

    // Load the canvas state when the page is loaded
    loadCanvasState();
});
