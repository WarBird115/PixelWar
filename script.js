const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const pixelSize = 10; // Size of each pixel
let color = '#000000'; // Default color

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
    const existingPixelIndex = savedPixels.findIndex(pixel => pixel.x === x / pixelSize && pixel.y === y / pixelSize);
    if (existingPixelIndex === -1) {
        savedPixels.push({ x: x / pixelSize, y: y / pixelSize, color });
    } else {
        savedPixels[existingPixelIndex].color = color;
    }
    localStorage.setItem('pixels', JSON.stringify(savedPixels));
}

// Draw on canvas
canvas.addEventListener('click', function(event) {
    const x = Math.floor(event.offsetX / pixelSize) * pixelSize;
    const y = Math.floor(event.offsetY / pixelSize) * pixelSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, pixelSize, pixelSize);
    savePixels(x, y, color);
});

// Right-click to pick color from canvas
canvas.addEventListener('contextmenu', function(event) {
    event.preventDefault(); // Prevent the context menu from appearing
    const x = Math.floor(event.offsetX / pixelSize) * pixelSize;
    const y = Math.floor(event.offsetY / pixelSize) * pixelSize;
    const imageData = ctx.getImageData(x, y, 1, 1).data;
    color = rgbToHex(imageData[0], imageData[1], imageData[2]);
    document.getElementById('colorPicker').value = color;
    document.getElementById('currentColor').style.backgroundColor = color;
});

// Convert RGB to HEX
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Load pixels when the page loads
window.onload = loadPixels;

// Color picker functionality
const colorPicker = document.getElementById('colorPicker');
const currentColorBox = document.getElementById('currentColor');

colorPicker.addEventListener('input', function() {
    color = this.value; // Set the selected color
    currentColorBox.style.backgroundColor = color; // Update the current color box
});




