# Star Matcher - Star Detection and Matching in Night Sky Images

[**Live Demo** – Click here to try the project online!](https://shaynamir.github.io/star-matcher/)

**Shay Namir & Eilon Ashuel**  
Course: Introduction to Space Engineering

---

## Project Description

In this project, we developed a system for detecting and matching stars between two images of the night sky. The system allows users to upload two images, detect stars in each, and find matches between groups of stars based on unique geometric features.

The project combines image processing, geometric algorithms, and an interactive web interface.

---

## How Does It Work?
1. **Image Upload:** The user uploads two images of the starry night sky.
2. **Star Detection:** The algorithm detects all stars in each image using image processing (brightness threshold, center of mass calculation).
3. **Grid Division:** The image is divided into a grid to enable local detection of star groups.
4. **Geometric Feature Creation:** In each region, groups of 4 stars are selected and a unique geometric "fingerprint" is created (distances, angles).
5. **Group Matching:** The algorithm compares the features from the first image to those in the second image and finds matches.
6. **Result Display:** The matches are displayed on the images using colored lines.

---

## How to Use
1. Open the `index.html` file in your browser or run a local server (e.g., `python3 -m http.server`).
2. Upload two images of the night sky.
3. Adjust the parameters (brightness threshold, grid size, tolerance) as needed.
4. Click "Recalculate Stars" to detect stars, and "Match Stars" to find matches.

---

## Parameter Explanation
- **Brightness Threshold:** Determines which points in the image are considered stars (higher threshold = fewer stars detected).
- **Grid Size:** Determines how many regions the image is divided into. A higher value is suitable for images with many stars.
- **Tolerance:** Determines how "forgiving" the algorithm is when matching shapes (higher value = more matches, but also more false positives).

---

## Main Files
- `index.html` - Web user interface
- `main.js` - Main control logic
- `star-detector.js` - Star detection in the image
- `star-matcher.js` - Geometric feature creation and star group matching
- `utils.js` - Utility functions

---

## Credits
The project is based on ideas from the presentation: [Feature-based Star Identification](https://sites.astro.caltech.edu/~moncelsi/FTS_talk.pdf)

---

Good luck!
