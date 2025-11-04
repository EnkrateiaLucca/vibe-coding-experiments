// --- DOM Elements ---
const webcamFeed = document.getElementById('webcamFeed');
const outputCanvas = document.getElementById('outputCanvas');
const canvasCtx = outputCanvas.getContext('2d');
const mainSummaryArea = document.getElementById('mainSummaryArea');
const gestureStatusEl = document.getElementById('gestureStatus');
const summaryGridEl = document.getElementById('summaryGrid');
const gestureGuideEl = document.getElementById('gestureGuide');
const initialMessageEl = document.getElementById('initialMessage');
const loadingIndicatorEl = document.getElementById('loadingIndicator');

// --- Configuration & State ---
const DEBOUNCE_TIME = 700; // Milliseconds to wait before re-evaluating gesture and updating summary
const SUMMARIES_FILE = 'summaries.json';
let hands;
let camera;
let currentGestureLevel = null; // Stores the number of fingers (1-5)
let lastUpdateTime = 0;
let debounceTimeout;
let loadedSummaries = null; // To store summaries from JSON

// --- MediaPipe Setup ---
function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    let detectedFingers = 0;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // We only care about the first detected hand
        const landmarks = results.multiHandLandmarks[0];

        // Draw landmarks and connectors (optional, for visualization)
        if (window.drawingUtils && window.HAND_CONNECTIONS) {
            window.drawingUtils.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: '#6366f1', lineWidth: 3 });
            window.drawingUtils.drawLandmarks(canvasCtx, landmarks, { color: '#4f46e5', lineWidth: 1, radius: 3 });
        }


        // --- Simple Finger Counting Logic ---
        const tipIds = [4, 8, 12, 16, 20]; // Landmarks for fingertips (Thumb, Index, Middle, Ring, Pinky)
        const pipIds = [2, 6, 10, 14, 18]; // Landmarks for PIP joints (second joint from base)

        // Thumb: Compare X-coordinate of tip to X-coordinate of PIP (for a vertically held hand, mirrored)
        // This depends on whether it's a left or right hand and its orientation.
        // A more robust way is to check if tip is further "out" than a point closer to palm.
        // For simplicity, we'll check if the thumb tip (4) is "above" (smaller y) its base (2)
        // This works okay for hands pointing somewhat upwards.
        if (landmarks[tipIds[0]].y < landmarks[pipIds[0]].y) { // Thumb
             detectedFingers++;
        }

        // Other fingers: Check if fingertip Y is above (smaller Y) its PIP joint Y
        for (let i = 1; i < tipIds.length; i++) { // Index, Middle, Ring, Pinky
            if (landmarks[tipIds[i]].y < landmarks[pipIds[i]].y) {
                detectedFingers++;
            }
        }
        // --- End Finger Counting ---

        if (detectedFingers > 5) detectedFingers = 5; // Cap at 5
        if (detectedFingers < 1 && results.multiHandLandmarks.length > 0) {
            // If a hand is detected but no fingers are "up" by this logic, consider it 0 or 1.
            // For this app, let's default to 1 if a hand is present but no fingers clearly up.
            // Or, if you want a "closed fist" to mean 0 or nothing, handle accordingly.
            // For now, if any hand part is visible, and count is 0, let's assume it's a fist aiming for level 1.
            // This part can be tricky. A more robust solution might involve checking landmark distances.
            // A simple heuristic: if wrist y is lower than pinky mcp y, it's likely a fist.
            if (landmarks[0].y > landmarks[17].y) { // Wrist Y vs Pinky MCP Y
                 // detectedFingers = 1; // Example: fist means level 1
            }
        }


        gestureStatusEl.textContent = `Gesture: ${detectedFingers} Finger${detectedFingers !== 1 ? 's' : ''}`;

        if (detectedFingers > 0 && detectedFingers !== currentGestureLevel) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                currentGestureLevel = detectedFingers;
                updateSummaryDisplay(currentGestureLevel);
                lastUpdateTime = Date.now();
            }, DEBOUNCE_TIME);
        } else if (detectedFingers === 0 && currentGestureLevel !== null) {
            // If hand disappears or no fingers, clear the level after a short delay
            clearTimeout(debounceTimeout);
             debounceTimeout = setTimeout(() => {
                // currentGestureLevel = null; // Or revert to a default
                // updateSummaryDisplay(null);
                // gestureStatusEl.textContent = `Gesture: N/A`;
            }, DEBOUNCE_TIME + 500); // Longer delay for clearing
        }


    } else {
        gestureStatusEl.textContent = `Gesture: N/A`;
         if (currentGestureLevel !== null) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                // currentGestureLevel = null; // Or revert to a default
                // updateSummaryDisplay(null);
            }, DEBOUNCE_TIME + 500);
        }
    }
    canvasCtx.restore();
}

async function initializeHandTracking() {
    hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`
    });
    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1, // 0 for lite, 1 for full
        minDetectionConfidence: 0.65, // Increased confidence
        minTrackingConfidence: 0.6
    });
    hands.onResults(onResults);

    camera = new Camera(webcamFeed, {
        onFrame: async () => {
            if (webcamFeed.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) { // Ensure video is ready
                 await hands.send({ image: webcamFeed });
            }
        },
        width: 220, // Match canvas and video element dimensions
        height: 160
    });
    try {
        await camera.start();
        if(initialMessageEl) initialMessageEl.style.display = 'none'; // Hide initial message once camera starts
    } catch (error) {
        console.error("Failed to start camera:", error);
        if(initialMessageEl) initialMessageEl.innerHTML = "Could not access webcam. <br>Please check permissions and refresh.";
    }
}

// --- Summarization Logic ---
async function loadSummaries() {
    loadingIndicatorEl.style.display = 'block';
    try {
        const response = await fetch(SUMMARIES_FILE);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        loadedSummaries = await response.json();
        populateSummaryGrid();
        populateGestureGuide();
        updateSummaryDisplay(1); // Display the first level by default
        if(initialMessageEl) initialMessageEl.style.display = 'none';
    } catch (error) {
        console.error("Could not load summaries:", error);
        mainSummaryArea.innerHTML = `<p style='color:red; text-align:center;'>Error loading summaries. Please check if <code>summaries.json</code> is available and correctly formatted.</p>`;
        if(initialMessageEl) initialMessageEl.style.display = 'none';
    } finally {
        loadingIndicatorEl.style.display = 'none';
    }
}

function populateSummaryGrid() {
    if (!loadedSummaries || !loadedSummaries.summaryLevels) return;
    summaryGridEl.innerHTML = ''; // Clear existing
    loadedSummaries.summaryLevels.forEach(summary => {
        const levelDiv = document.createElement('div');
        levelDiv.classList.add('summary-level');
        levelDiv.dataset.level = summary.level;
        levelDiv.textContent = summary.name;
        summaryGridEl.appendChild(levelDiv);
    });
}

function populateGestureGuide() {
    if (!loadedSummaries || !loadedSummaries.gestureMapping) return;
    gestureGuideEl.innerHTML = ''; // Clear existing
    let guideHtml = '<span class="level-map">Gestures: </span>';
    for (const [fingerCount, description] of Object.entries(loadedSummaries.gestureMapping)) {
        guideHtml += `<span class="level" data-gesture-level="${fingerCount}">${description}</span>`;
    }
    gestureGuideEl.innerHTML = guideHtml;
}

// --- UI Update ---
function updateSummaryDisplay(level) {
    if (!loadedSummaries) return;
    if(initialMessageEl && initialMessageEl.style.display !== 'none') initialMessageEl.style.display = 'none';


    // Remove active class from all summary content divs
    const allSummaries = mainSummaryArea.querySelectorAll('.summary-content');
    allSummaries.forEach(s => s.classList.remove('active'));

    let summaryToShow = loadedSummaries.summaryLevels.find(s => s.level === level);

    if (!summaryToShow && level === null && loadedSummaries.summaryLevels.length > 0) {
        // If level is null (e.g. hand removed), show a placeholder or the first summary
        // For now, let's show initial message or clear
        mainSummaryArea.innerHTML = `<div id="initialMessage">Point your hand at the camera. <br> Use 1 to 5 fingers to select a summary level.</div>`;
         // Highlight corresponding gesture guide item
        document.querySelectorAll('.gesture-guide .level').forEach(el => el.classList.remove('active'));
        // Highlight summary grid item
        document.querySelectorAll('.summary-grid .summary-level').forEach(el => el.classList.remove('active'));
        return;

    } else if (!summaryToShow && loadedSummaries.summaryLevels.length > 0) {
        summaryToShow = loadedSummaries.summaryLevels[0]; // Default to first if invalid level
        currentGestureLevel = summaryToShow.level; // Update state
    }


    if (summaryToShow) {
        let contentDiv = mainSummaryArea.querySelector(`.summary-content[data-level="${summaryToShow.level}"]`);
        if (!contentDiv) {
            contentDiv = document.createElement('div');
            contentDiv.classList.add('summary-content');
            contentDiv.dataset.level = summaryToShow.level;
            contentDiv.innerHTML = summaryToShow.content;
            mainSummaryArea.appendChild(contentDiv);
        }

        // Short delay to allow CSS transition
        setTimeout(() => {
            contentDiv.classList.add('active');
        }, 50);


        // Highlight corresponding gesture guide item
        document.querySelectorAll('.gesture-guide .level').forEach(el => {
            el.classList.toggle('active', parseInt(el.dataset.gestureLevel) === summaryToShow.level);
        });
        // Highlight summary grid item
        document.querySelectorAll('.summary-grid .summary-level').forEach(el => {
            el.classList.toggle('active', parseInt(el.dataset.level) === summaryToShow.level);
        });

    } else if (level === null && !document.getElementById('initialMessage')) {
         mainSummaryArea.innerHTML = `<div id="initialMessage">Point your hand at the camera. <br> Use 1 to 5 fingers to select a summary level.</div>`;
    }
}


// --- Initialization ---
async function main() {
    await loadSummaries(); // Load summaries first
    await initializeHandTracking(); // Then initialize hand tracking
}

main();