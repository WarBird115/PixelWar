<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pixel Wars</title>
    <style>
        body {
            font-family: 'Verdana', sans-serif;
            background-color: #2c2c2c;
            color: #e0e0e0;
            text-align: center;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        h1 {
            margin-top: 20px;
            color: #ffcc00;
        }

        #pixelCanvas {
            border: 1px solid #555;
            margin-top: 20px;
            cursor: not-allowed; /* Change cursor style to indicate it's disabled */
            background-color: #ffffff;
            pointer-events: none; /* Disable interactions */
        }

        #canvasContainer {
            position: relative; /* Allow absolute positioning of overlay */
        }

        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay */
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;
        }

        #colorOptions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
            align-items: center;
        }

        .color-box {
            width: 30px;
            height: 30px;
            cursor: pointer;
            border: 2px solid #555;
        }

        #accessSection {
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        #accessSection input {
            padding: 5px;
            margin-top: 10px;
            border-radius: 5px;
            border: 1px solid #555;
        }

        #welcomeText {
            margin-top: 30px;
            max-width: 600px;
            text-align: left;
            font-size: 14px;
            background-color: #3c3c3c;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            color: #e0e0e0;
        }

        #welcomeText h2 {
            margin-bottom: 10px;
            font-size: 18px;
            color: #ffcc00;
        }

        #welcomeText ul {
            padding-left: 20px;
        }

        #welcomeText li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <h1>Pixel Wars</h1>
    <div id="canvasContainer">
        <canvas id="pixelCanvas" width="500" height="500"></canvas>
        <div class="overlay" id="overlay">Enter Access Code to Unlock Canvas</div> <!-- Overlay for locked state -->
    </div>
    
    <!-- Color Picker Input -->
    <div id="colorOptions">
        <input type="color" id="colorPicker" value="#000000">
        <div id="currentColor" class="color-box" style="background-color: #000000;"></div>
        <div id="countdown" style="color: #ffcc00; margin-left: 10px;">Cooldown: 0:00</div>
    </div>

    <!-- Access Code Input -->
    <div id="accessSection">
        <label for="userInput">Enter Access Code:</label>
        <input type="text" id="userInput" placeholder="Enter your code here">
        <button id="submitCode">Submit</button>
    </div>

    <!-- Welcome Text -->
    <div id="welcomeText">
        <h2>Welcome to Pixel Wars!</h2>
        <p>This space is all about collaboration and creativity. Go wild, be quirky, or team up with others to create something amazing. The image you create here will become our server banner at the end of every month. You've got one pixel every 5 minutes, so make it count!</p>
        <p>Here are some quick tips to get you started:</p>
        <ul>
            <li>Click on the canvas to place a pixel.</li>
            <li>Middle-click on the canvas to quickly pick a color that’s already been placed.</li>
            <li>You can replace any pixel, no matter who placed it there!</li>
        </ul>
        <p>Game on and happy pixeling!</p>
    </div>

    <script>
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
                    ctx.fillRect(x, y, 10, 10); // Change size to 10x10 pixels
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

        // Save canvas state
        function saveCanvasState() {
            const canvasData = canvas.toDataURL();
            localStorage.setItem('pixelCanvasState', canvasData);
        }
    </script>
</body>
</html>
