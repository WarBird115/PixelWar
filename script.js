document.addEventListener('DOMContentLoaded', () => {
    // Set up canvas and context
    const canvas = document.getElementById('pixelCanvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('overlay');
    const colorPicker = document.getElementById('colorPicker');
    const countdownDisplay = document.getElementById('countdown');
    const submitCodeButton = document.getElementById('submitCode');
    const userInput = document.getElementById('userInput');
    const wipeCanvasButton = document.getElementById('wipeCanvasButton');

    // Define initial variables
    let isCanvasUnlocked = false;
    let cooldown = false;
    let pixelsPlaced = 0;
    const cooldownTime = 300; // 300 seconds (5 minutes)
    let countdownTimer;
    const pixelSize = 10;
    let currentColor = "#000000"; // Default color set to black
    colorPicker.value = currentColor; // Update the color picker
    const placedPixels = [];

    // Load random access code from local storage or generate a new one
    let randomAccessCode = localStorage.getItem('randomAccessCode');
    if (!randomAccessCode) {
        randomAccessCode = Math.random().toString(36).substring(2, 8); // Generates a 6-character random code
        localStorage.setItem('randomAccessCode', randomAccessCode); // Store the random access code
    }

    // Function to set a cookie
    function setCookie(name, value, seconds) {
        const expires = new Date(Date.now() + seconds * 1000).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    }

    // Function to get a cookie value
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Load cooldown from cookies
    function loadCooldownFromCookies() {
        const remainingTime = getCookie('cooldown');
        if (remainingTime) {
            startCooldown(parseInt(remainingTime));
        }
    }

    // Function to save cooldown to cookies
    function saveCooldownToCookies(secondsLeft) {
        setCookie('cooldown', secondsLeft, secondsLeft);
    }

    // Function to place a pixel on the canvas
    function placePixel(x, y) {
        if (isCanvasUnlocked && !cooldown) {
            const gridX = Math.floor(x / pixelSize) * pixelSize;
            const gridY = Math.floor(y / pixelSize) * pixelSize;

            if (!placedPixels.some(pixel => pixel.x === gridX && pixel.y === gridY)) {
                const newPixel = { x: gridX, y: gridY, color: currentColor };
                ctx.fillStyle = newPixel.color;
                ctx.fillRect(gridX, gridY, pixelSize, pixelSize);
                placedPixels.push(newPixel);

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
        let secondsLeft = timeLeft;

        saveCooldownToCookies(secondsLeft); // Save initial cooldown

        countdownTimer = setInterval(() => {
            secondsLeft--;
            updateCountdownDisplay(secondsLeft);
            saveCooldownToCookies(secondsLeft); // Update cooldown in cookies

            if (secondsLeft <= 0) {
                clearInterval(countdownTimer);
                cooldown = false;
                countdownDisplay.textContent = "Cooldown: 0:00"; // Reset display
            }
        }, 1000);
    }

    // Function to update the countdown display
    function updateCountdownDisplay(secondsLeft) {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        countdownDisplay.textContent = `Cooldown: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Event listener for mouse clicks on the canvas
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        placePixel(x, y);
    });

    // Event listener for the color picker
    colorPicker.addEventListener('input', (event) => {
        currentColor = event.target.value;
    });

    // Event listener for the access code submission
    submitCodeButton.addEventListener('click', () => {
        const inputCode = userInput.value;
        const adminCode = "Itsameamario1";

        if (inputCode === adminCode || inputCode === randomAccessCode) {
            isCanvasUnlocked = true;
            overlay.style.display = 'none';
            loadCooldownFromCookies(); // Load cooldown from cookies
        } else {
            alert('Invalid access code. Please try again.');
        }
        userInput.value = ''; // Clear the input field after submission
    });

    // Event listener for the wipe canvas button
    wipeCanvasButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to wipe the canvas? This action cannot be undone!')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            placedPixels.length = 0; // Clear the placed pixels array
        }
    });

    // Load the canvas state and cooldown when the page loads
    loadCooldownFromCookies();
});
