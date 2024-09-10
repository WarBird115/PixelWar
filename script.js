<script type="module">
    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyANfAj-fw2yJ_1lw75fjZLGCxy6oTWBOJA",
        authDomain: "pixel-war-deddd.firebaseapp.com",
        databaseURL: "https://pixel-war-deddd-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "pixel-war-deddd",
        storageBucket: "pixel-war-deddd.appspot.com",
        messagingSenderId: "602125749650",
        appId: "1:602125749650:web:5637bfbdacb77d227a454b",
        measurementId: "G-D7CEB1DPH5"
    };

    // Import the Firebase modules
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
    import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

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

        // Get or generate a random access code
        let randomAccessCode = localStorage.getItem('randomAccessCode');
        if (!randomAccessCode) {
            randomAccessCode = Math.random().toString(36).substring(2, 8); // Generates a 6-character random code
            localStorage.setItem('randomAccessCode', randomAccessCode); // Store the random access code
        }
        console.log("Random Access Code:", randomAccessCode); // Debugging log

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

            countdownTimer = setInterval(() => {
                secondsLeft--;
                updateCountdownDisplay(secondsLeft);

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

        // Event listener for middle-clicks on the canvas to pick a color
        canvas.addEventListener('auxclick', (event) => {
            if (event.button === 1) { // Middle-click
                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const gridX = Math.floor(x / pixelSize) * pixelSize;
                const gridY = Math.floor(y / pixelSize) * pixelSize;

                const pixel = placedPixels.find(p => p.x === gridX && p.y === gridY);
                if (pixel) {
                    currentColor = pixel.color;
                    colorPicker.value = currentColor;
                    console.log(`Picked color: ${currentColor}`); // Debugging log
                }
            }
        });

        // Event listener for the color picker
        colorPicker.addEventListener('input', (event) => {
            currentColor = event.target.value;
        });

        // Hide wipe button for regular users
        function toggleWipeCanvasButton(show) {
            if (show) {
                wipeCanvasButton.style.display = 'block'; // Admin: show the button
            } else {
                wipeCanvasButton.style.display = 'none';  // Regular users: hide the button
            }
        }

        // Event listener for the access code submission
        submitCodeButton.addEventListener('click', () => {
            const inputCode = userInput.value;

            // Obfuscated admin check
            const adminCodeEncrypted = btoa("Itsameamario1");  // Base64 encryption to hide admin code in the console

            if (inputCode === atob(adminCodeEncrypted)) {  // Admin code check
                isCanvasUnlocked = true;
                overlay.style.display = 'none';
                toggleWipeCanvasButton(true); // Admins see the wipe button
                loadCanvasState(); // Load the previous state of the canvas
                console.log('Canvas unlocked as admin!'); // Debugging log
            } else if (inputCode === randomAccessCode) {  // Random access code check
                isCanvasUnlocked = true;
                overlay.style.display = 'none';
                toggleWipeCanvasButton(false); // Regular users cannot see the wipe button
                loadCanvasState(); // Load the previous state of the canvas
                console.log('Canvas unlocked!'); // Debugging log
            } else {
                alert('Invalid access code. Please try again.');
            }
            userInput.value = ''; // Clear the input field after submission
        });

        // Event listener for the wipe canvas button (Admins only)
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
</script>
