const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
let color = '#000000';

canvas.addEventListener('click', function(event) {
    const x = Math.floor(event.offsetX / 10) * 10;
    const y = Math.floor(event.offsetY / 10) * 10;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 10, 10);
});
