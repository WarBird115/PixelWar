const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const pixelSize = 10; // Size of each pixel
let color = '#000000';

// Load saved pixels from local storage
function loadPixels() {
    const savedPixels = JSON.parse(localStorage.getItem('pixels'));
    if (savedPixels) {
        savedPixels.forEach(pixel => {
            ctx.fillStyle = pixel.color;
            ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize);
        });
    }
}

// Save the current pixel state to local storage
function savePixels(x, y, color) {
    let savedPixels = JSON.parse(localStorage.getItem('pixels')) || [];
    savedPixels.push({ x: x / pixelSize, y: y / pixelSize, color });
    localStorage.setItem('pixels', JSON.stringify(savedPixels));
}

// Draw on canvas
canvas.addEventListener('click', function(event) {
    const x = Math.floor(event.offsetX / pixelSize) * pixelSize;
    const y = Math.floor(event.offsetY / pixelSize) * pixelSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, pixelSize, pixelSize);

    // Save the pixel state
    savePixels(x, y, color);
});

// Load pixels when the page loads
window.onload = loadPixels;

