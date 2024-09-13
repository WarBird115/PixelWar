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

    // Set the initial color to black
    let currentColor = "#000000"; // Default color set to black
    colorPicker.value = currentColor; // Update the color picker

    // Array to keep track of placed pixels
    const placedPixels = [];

    // Get or generate a random access code
    let randomAccessCode = localStorage.getItem('randomAccessCode');
    if (!randomAccessCode) {
        randomAccessCode = Math.random().toString(36).substring(2, 8); // Generates a 6-character random code
        localStorage.setItem('randomAccessCode', randomAccessCode); // Store the random access code
    }
    console.log("Random Access Code:", randomAccessCode); // Debugging log

    // Load saved cooldown time from local storage
    let savedCooldownTime = localStorage.getItem('cooldownTime');
    if (savedCooldownTime) {
        // Convert saved cooldown time to seconds
        let secondsLeft = parseInt(savedCooldownTime, 10);
        if (secondsLeft > 0) {
            startCooldown(secondsLeft);
        }
    }

    // Function to save the current state of the canvas to Firebase
    function saveCanvasState() {
        set(ref(database, 'canvas/pixels'), placedPixels)
            .then(() => {
                console.log('Canvas state saved to Firebase.'); // Debugging log
            })
            .catch((error) => {
                console.error('Error saving canvas state:', error); // Debugging log
            });
    }

    // Function to load the saved state of the canvas from Firebase
    function loadCanvasState() {
        const canvasRef = ref(database, 'canvas/pixels');
        onValue(canvasRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.length > 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first
                data.forEach(pixel => {
                    ctx.fillStyle = pixel.color;
                    ctx.fillRect(pixel.x, pixel.y, pixelSize, pixelSize);
                    placedPixels.push(pixel);
                });
                console.log('Loaded canvas state from Firebase.'); // Debugging log
            }
        });
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

                saveCanvasState(); // Save the pixel placement to Firebase

                pixelsPlaced++;
                console.log('Pixels Placed:', pixelsPlaced); // Debugging log

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

        // Save the cooldown time to local storage
        localStorage.setItem('cooldownTime', secondsLeft);

        countdownTimer = setInterval(() => {
            secondsLeft--;
            updateCountdownDisplay(secondsLeft);

            // Update local storage each second
            localStorage.setItem('cooldownTime', secondsLeft);

            if (secondsLeft <= 0) {
                clearInterval(countdownTimer);
                cooldown = false;
                countdownDisplay.textContent = "Cooldown: 0:00"; // Reset display
                localStorage.removeItem('cooldownTime'); // Clear cooldown time from local storage
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

    // Event listener for middle-click (color picker)
    canvas.addEventListener('auxclick', (event) => {
        if (event.button === 1) { // Middle-click
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const gridX = Math.floor(x / pixelSize) * pixelSize;
            const gridY = Math.floor(y / pixelSize) * pixelSize;

            // Find the pixel at the clicked position
            const clickedPixel = placedPixels.find(pixel => pixel.x === gridX && pixel.y === gridY);
            if (clickedPixel) {
                colorPicker.value = clickedPixel.color; // Set the color picker to the clicked pixel's color
                currentColor = clickedPixel.color;
            }
        }
    });

    // Event listener for the color picker
    colorPicker.addEventListener('input', (event) => {
        currentColor = event.target.value;
    });

    // Event listener for the access code submission
    submitCodeButton.addEventListener('click', () => {
        const inputCode = userInput.value;
        const adminCode = "Itsameamario1";

        // Check access code without revealing admin code in the console
        if (inputCode === adminCode) {
            isCanvasUnlocked = true;
            overlay.style.display = 'none';
            wipeCanvasButton.style.display = 'block'; // Show the wipe button for admin
            loadCanvasState(); // Load the previous state of the canvas
            console.log('Canvas unlocked! Admin access granted.'); // Debugging log
        } else if (inputCode === randomAccessCode) {
            isCanvasUnlocked = true;
            overlay.style.display = 'none';
            wipeCanvasButton.style.display = 'none'; // Hide the wipe button for random access
            loadCanvasState(); // Load the previous state of the canvas
            console.log('Canvas unlocked! Random access granted.'); // Debugging log
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
            saveCanvasState(); // Save the cleared state to Firebase
        }
    });

    // Load the canvas state when the page loads
    loadCanvasState();
});
