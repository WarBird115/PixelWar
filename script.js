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
    const cooldownTime = 300; // 300 seconds (5 minutes)
    let countdownTimer;
    const pixelSize = 10;

    // Initialize pixel color
    let currentColor = colorPicker.value;

    // Array to keep track of placed pixels
    const placedPixels = [];

    // Function to save the current state of the canvas to localStorage
    function saveCanvasState() {
        try {
            const savedPixels = JSON.stringify(placedPixels);
            localStorage.setItem('placedPixels', savedPixels);
            console.log('Canvas state saved:', savedPixels);
        } catch (error) {
            console.error('Error saving canvas state:', error);
        }
    }

    // Function to load the saved state of the canvas from localStorage
    function loadCanvasState() {
        try {
            const savedPixels = localStorage.getItem('placedPixels');
            console.log('Attempting to load canvas state from localStorage:', savedPixels);
            if (savedPixels) {
                const pixelData = JSON.parse(savedPixels);
                console.log('Loaded pixel data:', pixelData);
                pixelData.forEach(pixel => {
                    ctx.fillStyle = pixel.color;
                    ctx.fillRect(pixel.x, pixel.y, pixelSize, pixelSize);
                    placedPixels.push(pixel);
                });
            } else {
                console.log('No saved canvas state found.');
            }
        } catch (error) {
            console.error('Error loading canvas state:', error);
        }
    }

    // Function to place a pixel on the canvas
    function placePixel(x, y) {
        if (isCanvasUnlocked && !cooldown) {
            const gridX = Math.floor(x / pixelSize) * pixelSize;
            const gridY = Math.floor(y / pixelSize) * pixelSize;

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

                pixelsPlaced++;
                console.log(`Pixel placed at (${gridX}, ${gridY}) with color ${currentColor}. Total pixels placed: ${pixelsPlaced}`);

                if (pixelsPlaced === 1) {
                    startCooldown(); // Start cooldown when the 1st pixel is placed
                }
            } else {
                console.log(`Pixel at (${gridX}, ${gridY}) is already occupied.`);
            }
        } else {
            console.log('Canvas is locked or in cooldown.');
        }
    }

    // Function to start the cooldown
    function startCooldown(timeLeft = cooldownTime) {
        cooldown = true;
        const cooldownEnd = new Date().getTime() + (timeLeft * 1000);
        localStorage.setItem('cooldownEnd', cooldownEnd);
        updateCountdownDisplay(timeLeft);

        console.log('Cooldown started. Ends at:', new Date(cooldownEnd).toLocaleString());

        countdownTimer = setInterval(() => {
            const timeRemaining = Math.floor((cooldownEnd - new Date().getTime()) / 1000);

            if (timeRemaining <= 0) {
                clearInterval(countdownTimer);
                cooldown = false;
                pixelsPlaced = 0; // Reset the pixel count
                countdownDisplay.textContent = 'Cooldown: 0:00';
                localStorage.removeItem('cooldownEnd'); // Clear cooldown end time
                console.log('Cooldown finished.');
            } else {
                updateCountdownDisplay(timeRemaining);
            }
        }, 1000);
    }

    // Function to update countdown display
    function updateCountdownDisplay(timeLeft) {
        countdownDisplay.textContent = `Cooldown: ${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;
    }

    // Load the cooldown state on page load
    function loadCooldownState() {
        const cooldownEnd = localStorage.getItem('cooldownEnd');
        if (cooldownEnd) {
            const timeLeft = Math.floor((parseInt(cooldownEnd) - new Date().getTime()) / 1000);
            if (timeLeft > 0) {
                startCooldown(timeLeft);
            } else {
                console.log('Cooldown has already expired.');
            }
        } else {
            console.log('No cooldown state found.');
        }
    }

    // Event listener for canvas click
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        placePixel(x, y);
    });

    // Event listener for submitting access code
    submitCodeButton.addEventListener('click', () => {
        const accessCode = localStorage.getItem('randomAccessCode');
        const adminPassword = "Itsameamario1"; // Set the admin password

        console.log(`Access Code: ${accessCode}, User Input: ${userInput.value}, Admin Password: ${adminPassword}`);

        // Check if the user input matches either the access code or the admin password
        if (userInput.value === accessCode || userInput.value === adminPassword) {
            overlay.style.display = 'none';
            isCanvasUnlocked = true;
            userInput.value = ''; // Clear the input field
            wipeCanvasButton.style.display = 'block'; // Show the wipe canvas button
            loadCooldownState(); // Check if cooldown is still active
            loadCanvasState(); // Load the canvas state on unlock
        } else {
            alert('Incorrect access code or admin password. Please try again.');
        }
    });

    // Event listener for the wipe canvas button
    wipeCanvasButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to wipe the canvas?')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            placedPixels.length = 0; // Clear placed pixels
            localStorage.removeItem('placedPixels'); // Clear localStorage
            localStorage.removeItem('cooldownEnd'); // Clear cooldown end time
            alert('Canvas has been wiped!');
            console.log('Canvas wiped. All states cleared.');
        }
    });

    // Load the canvas state when the page is loaded
    loadCanvasState();
});
