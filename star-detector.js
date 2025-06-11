import utils from "./utils.js"

// Find bright spots (stars) in the image using flood fill
function detectStars(canvas, storageArray) {
    const ctx = canvas.getContext('2d');

    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Get brightness threshold from slider
    const threshold = parseInt(document.getElementById('threshold').value, 10);
    const visited = new Set();  // Keep track of checked pixels
    const stars = [];

    // Skip if image is too bright overall
    if (utils.calculateAverageBrightness(imageData) > threshold) {
        return
    }

    // Calculate pixel brightness from RGB values
    function getBrightness(r, g, b) {
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    // Find connected bright pixels using flood fill- like in paint
    function floodFill(x, y) {
        const queue = [[x, y]];
        const pixels = [];
        let totalBrightness = 0;

        while (queue.length) {
            const [cx, cy] = queue.pop();
            const key = `${cx},${cy}`;
            // Skip if already checked or out of bounds
            if (visited.has(key) || cx < 0 || cy < 0 || cx >= width || cy >= height) continue;

            const idx = (cy * width + cx) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const brightness = getBrightness(r, g, b);
            // Skip if pixel not bright enough
            if (brightness < threshold) continue;

            visited.add(key);
            pixels.push([cx, cy]);
            totalBrightness += brightness;

            // Check neighboring pixels
            queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }

        // Skip if too few pixels (noise)
        if (pixels.length < 3) return null;

        // Calculate star center and radius
        const sumX = pixels.reduce((sum, p) => sum + p[0], 0);
        const sumY = pixels.reduce((sum, p) => sum + p[1], 0);
        const centerX = sumX / pixels.length;
        const centerY = sumY / pixels.length;
        const radius = Math.sqrt(pixels.length / Math.PI);
        const avgBrightness = totalBrightness / pixels.length;

        return { x: centerX, y: centerY, r: radius, b: avgBrightness };
    }

    // Scan image for bright spots
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            // Start flood fill from bright pixels
            if (getBrightness(r, g, b) > threshold && !visited.has(`${x},${y}`)) {
                const star = floodFill(x, y);
                if (star) stars.push(star);
            }
        }
    }

    // Draw circles around found stars
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 1.5;
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r + 2, 0, 2 * Math.PI);
        ctx.stroke();
    });

    // Save found stars
    storageArray.length = 0;
    storageArray.push(...stars);

    return true
}

// Convert image to grayscale
function grayscale(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg;
    }
    return imageData;
}

// Apply threshold to image - pixels above threshold become white, others black
function threshold(imageData, threshold) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const val = data[i] > threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = val;
    }
    return imageData;
}

// Find connected components (blobs) in binary image
function findConnectedComponents(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const visited = new Set();
    const components = [];

    // Helper function to get pixel index
    function getPixelIndex(x, y) {
        return (y * width + x) * 4;
    }

    // Helper function to check if pixel is white and unvisited
    function isWhiteAndUnvisited(x, y) {
        if (x < 0 || x >= width || y < 0 || y >= height) return false;
        const idx = getPixelIndex(x, y);
        return data[idx] === 255 && !visited.has(idx);
    }

    // Helper function to explore a component using flood fill
    function exploreComponent(startX, startY) {
        const component = [];
        const queue = [[startX, startY]];
        visited.add(getPixelIndex(startX, startY));

        while (queue.length > 0) {
            const [x, y] = queue.shift();
            component.push({ x, y });

            // Check all 8 neighbors
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    const newX = x + dx;
                    const newY = y + dy;
                    if (isWhiteAndUnvisited(newX, newY)) {
                        queue.push([newX, newY]);
                        visited.add(getPixelIndex(newX, newY));
                    }
                }
            }
        }
        return component;
    }

    // Find all components
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (isWhiteAndUnvisited(x, y)) {
                const component = exploreComponent(x, y);
                if (component.length > 0) {
                    components.push(component);
                }
            }
        }
    }

    return components;
}

// Calculate center of mass for a component
function calculateCenterOfMass(component) {
    let sumX = 0;
    let sumY = 0;
    for (const pixel of component) {
        sumX += pixel.x;
        sumY += pixel.y;
    }
    return {
        x: sumX / component.length,
        y: sumY / component.length
    };
}

// Find stars in image using threshold and connected components
function findStars(imageData, thresholdValue = 128) {
    // Convert to grayscale and apply threshold
    const binaryImage = threshold(grayscale(imageData), thresholdValue);
    
    // Find connected components
    const components = findConnectedComponents(binaryImage);
    
    // Calculate center of mass for each component
    const stars = components.map(component => calculateCenterOfMass(component));
    
    return stars;
}

export default {
    detectStars,
    findStars
}