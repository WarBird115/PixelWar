const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearCanvasButton = document.getElementById('clearCanvasButton');

// Set a fixed pixel size for drawing
const pixelSize = 10;

// Initial background to ensure visibility
ctx.fillStyle = '#f0f0f0'; // Light background for better visibility
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Clear canvas functionality
clearCanvasButton.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Reset to light background
});

// Test drawing with a simple mouse click
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;  // No scaling, direct position
  const y = e.clientY - rect.top;   // No scaling, direct position

  console.log(`Placing pixel at: (${x}, ${y})`);

  // Draw a pixel using the selected color from the color picker
  ctx.fillStyle = colorPicker.value;
  ctx.fillRect(x, y, pixelSize, pixelSize);  // Direct pixel placement

  console.log(`Color used: ${ctx.fillStyle}`);
});
