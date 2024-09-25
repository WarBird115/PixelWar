const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearCanvasButton = document.getElementById('clearCanvasButton');

// Test large pixel size to easily see if it works
const pixelSize = 10;

// Initial background to ensure rendering
ctx.fillStyle = '#f0f0f0'; // Light background for visibility
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Clear canvas functionality
clearCanvasButton.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Reset to light background
});

// Test drawing with simple mouse click
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / (rect.width / canvas.width));
  const y = Math.floor((e.clientY - rect.top) / (rect.height / canvas.height));

  console.log(`Placing pixel at: (${x}, ${y})`);

  // Draw using the selected color from color picker
  ctx.fillStyle = colorPicker.value;
  ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

  console.log(`Color used: ${ctx.fillStyle}`);
});
