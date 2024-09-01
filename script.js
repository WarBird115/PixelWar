const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
let color = '#000000';

// Update the color preview box when a new color is selected
const colorPicker = document.getElementById('colorPicker');
const currentColorBox = document.getElementById('currentColor');

colorPicker.addEventListener('input', function(event) {
    color = event.target.value;
    currentColorBox.style.backgroundColor = color;
});

canvas.addEventListener('click', function(event) {
    const x = Math.floor(event.offsetX / 10) * 10;
    const y = Math.floor(event.offsetY / 10) * 10;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 10, 10);
    saveCanvasState();
});

// Use middle mouse click to pick a color from the canvas
canvas.addEventListener('mousedown', function(event) {
    if (event.button === 1) { // Middle mouse button
        const x = Math.floor(event.offsetX / 10) * 10;
        const y = Math.floor(event.offsetY / 10) * 10;
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const pickedColor = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
        colorPicker.value = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        currentColorBox.style.backgroundColor = colorPicker.value;
        color = colorPicker.value;
    }
});

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function saveCanvasState() {
    const canvasData = canvas.toDataURL();
    localStorage.setItem('pixelCanvasState', canvasData);
}

function loadCanvasState() {
    const savedCanvasData = localStorage.getItem('pixelCanvasState');
    if (savedCanvasData) {
        const img = new Image();
        img.src = savedCanvasData;
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        }
    }
}

// Load the canvas state when the page loads
window.onload = loadCanvasState;
