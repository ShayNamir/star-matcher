// Star matcher - finds matching star patterns between two images
import matcher from "./star-matcher.js"
import detector from "./star-detector.js"

// Arrays to store star data from both images
const stars1 = [];
const stars2 = [];
var img1 = null;
var img2 = null;

// Clear and redraw image on canvas
function drawImageOnly(canvas, img) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!img) return;
    ctx.drawImage(img, 0, 0);
}

// Load image from file and show it on canvas
async function loadImage(fileInput, canvas) {
    const file = fileInput.files[0];
    if (!file) return null;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();

    // Resize canvas to match image
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    return img
}

// Generate random color for matching stars
function randomRGB() {
    const r = Math.floor(Math.random() * 256); // 0-255
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

// Draw matching star points with same color
function painPoints(p1, p2, ctx1, ctx2) {
    const color = randomRGB()

    // Set same style for both points
    ctx1.strokeStyle = color;
    ctx1.lineWidth = 1.5;
    ctx2.strokeStyle = color;
    ctx2.lineWidth = 1.5;

    // Draw circles around points
    ctx1.beginPath();
    ctx1.arc(p1.x, p1.y, 3, 0, 2 * Math.PI);
    ctx1.stroke();

    ctx2.beginPath();
    ctx2.arc(p2.x, p2.y, 3, 0, 2 * Math.PI);
    ctx2.stroke();
}

// Draw line between two points
function drawLine(ctx, x1, y1, x2, y2, color = 'black', width = 1) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

// Setup when page loads
window.addEventListener('DOMContentLoaded', () => {
    // Get all UI elements we need
    const file1 = document.getElementById('file1');
    const file2 = document.getElementById('file2');
    const canvas1 = document.getElementById('canvas1');
    const canvas2 = document.getElementById('canvas2');
    const recalcBtn = document.getElementById('recalc');
    const matchBtn = document.getElementById('match');
    const thresholdslider = document.getElementById('threshold');
    const gridslider = document.getElementById('gridSize');
    const toleranceslider = document.getElementById('tolerance');
    const thresholddisplay = document.getElementById('thresholdValue');
    const griddisplay = document.getElementById('gridSizeValue');
    const tolerancedisplay = document.getElementById('toleranceValue');

    // Update display when sliders change
    thresholdslider.addEventListener('input', () => {
        thresholddisplay.textContent = thresholdslider.value;
    });

    // Load first image when file selected
    file1.addEventListener('change', async () => {
        img1 = await loadImage(file1, canvas1)
        // detector.detectStars(canvas1, stars1)
    });

    // Load second image when file selected
    file2.addEventListener('change', async () => {
        img2 = await loadImage(file2, canvas2)
        // detector.detectStars(canvas2, stars2)
    });

    // Find stars in both images when recalc clicked
    recalcBtn.addEventListener('click', () => {
        // Clear and redraw images
        drawImageOnly(canvas1, img1);
        drawImageOnly(canvas2, img2);
        
        // Try to detect stars
        let r1 = detector.detectStars(canvas1, stars1)
        let r2 = detector.detectStars(canvas2, stars2)

        // Warn if brightness too low
        if (!r1 || !r2) {
            alert("You should use a higher brightness.")
            return
        }
    });

    // Update grid size display
    gridslider.addEventListener('input', () => {
        griddisplay.textContent = gridslider.value;
    });

    // Update tolerance display
    toleranceslider.addEventListener('input', () => {
        tolerancedisplay.textContent = toleranceslider.value / 10;
    });

    // Match stars when button clicked
    matchBtn.addEventListener('click', () => {
        if (!img1 || !img2) return;

        // Clear and redraw images
        drawImageOnly(canvas1, img1);
        drawImageOnly(canvas2, img2);
        
        // Find stars in both images
        let r1 = detector.detectStars(canvas1, stars1)
        let r2 = detector.detectStars(canvas2, stars2)

        if (!r1 || !r2) {
            alert("You should use a higher brightness.")
            return
        }

        console.log("grid = " + gridslider.value);
        
        // Find matching star patterns
        const matches = matcher.matchStars(stars1, stars2, img1, img2, gridslider.value, toleranceslider.value / 10);

        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');

        // Draw each match with same color
        for (const [s1, s2] of matches) {
            // Draw matching points
            painPoints(s1[0], s2[0], ctx1, ctx2)
            painPoints(s1[1], s2[1], ctx1, ctx2)
            painPoints(s1[5], s2[5], ctx1, ctx2)
            painPoints(s1[6], s2[6], ctx1, ctx2)

            // Draw lines between points
            const c = randomRGB()
            drawLine(ctx1, s1[0].x, s1[0].y, s1[1].x, s1[1].y, c, 1)
            drawLine(ctx1, s1[1].x, s1[1].y, s1[5].x, s1[5].y, c, 1)
            drawLine(ctx1, s1[5].x, s1[5].y, s1[6].x, s1[6].y, c, 1)
   
            drawLine(ctx2, s2[0].x, s2[0].y, s2[1].x, s2[1].y, c, 1)
            drawLine(ctx2, s2[1].x, s2[1].y, s2[5].x, s2[5].y, c, 1)
            drawLine(ctx2, s2[5].x, s2[5].y, s2[6].x, s2[6].y, c, 1)
        }
    });
});