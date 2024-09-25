const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Pixel size configuration
const pixelSize = 10; // Testing larger pixels for visibility

// Initial canvas fill to confirm rendering
ctx.fillStyle = '#f0f0f0'; // Light gray background
ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill canvas with background color

// Test pixel placement on click
canvas.addEventListener('click', (e) => {
  // Get the mouse position relative to the canvas
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / (rect.width / canvas.width));
  const y = Math.floor((e.clientY - rect.top) / (rect.height / canvas.height));

  // Log the calculated position for debugging
  console.log(`Placing test pixel at: (${x}, ${y})`);

  // Draw a large test rectangle at the clicked position
  ctx.fillStyle = '#ff0000'; // Red color for visibility
  ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

  // Log the color and pixel placement
  console.log(`Color being used: ${ctx.fillStyle}`);
});
