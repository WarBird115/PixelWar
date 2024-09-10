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

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.getDatabase(app);

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
        const cooldownEnd = new Date().getTime() + (timeLeft * 1000);
        localStorage.setItem('cooldownEnd', cooldownEnd);
        console.log('Cooldown End Set:', cooldownEnd); // Debugging log
        updateCountdownDisplay(cooldownEnd);

        countdownTimer = setInterval(() => {
            const now = new Date().getTime();
            const remainingTime = cooldownEnd - now;

            if (remainingTime <= 0) {
                clearInterval(countdownTimer);
                cooldown = false;
                pixelsPlaced = 0; // Reset pixels placed
                countdownDisplay.textContent = 'Cooldown: 0:00';
                console.log('Cooldown Finished'); // Debugging log
            } else {
                updateCountdownDisplay(cooldownEnd);
            }
        }, 1000);
    }

    // Function to update the countdown display
    function updateCountdownDisplay(cooldownEnd) {
        const now = new Date().getTime();
        const remainingTime = cooldownEnd - now;
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        countdownDisplay.textContent = `Cooldown: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Event listener for canvas clicks
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        placePixel(x, y);
    });

    // Event listener for color picker change
    colorPicker.addEventListener('input', (e) => {
        currentColor = e.target.value;
    });

    // Event listener for code submission
    submitCodeButton.addEventListener('click', () => {
        const accessCode = userInput.value;
        if (accessCode === 'Itsameamario1' || accessCode === localStorage.getItem('randomAccessCode')) { // Use the random access code
            overlay.style.display = 'none'; // Hide overlay
            isCanvasUnlocked = true; // Unlock canvas
            wipeCanvasButton.style.display = 'inline'; // Show wipe button
            loadCanvasState(); // Load canvas state from Firebase
        } else {
            alert('Incorrect access code. Please try again.');
        }
    });

    // Event listener for wipe canvas button
    wipeCanvasButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to wipe the canvas? This action cannot be undone.')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
            placedPixels.length = 0; // Clear placed pixels array
            saveCanvasState(); // Save the cleared state to Firebase
        }
    });

    // Load the saved canvas state on page load
    loadCanvasState();

    // Load cooldown state on page load
    const cooldownEnd = localStorage.getItem('cooldownEnd');
    if (cooldownEnd) {
        const currentTime = new Date().getTime();
        if (currentTime < cooldownEnd) {
            cooldown = true;
            updateCountdownDisplay(cooldownEnd);
            startCooldown(cooldownEnd);
        } else {
            localStorage.removeItem('cooldownEnd'); // Clear expired cooldown
        }
    }
});
