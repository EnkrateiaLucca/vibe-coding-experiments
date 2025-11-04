// Get references to the HTML elements
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const canvasCtx = canvasElement.getContext('2d');
const threeCanvas = document.getElementById('threeCanvas');

// Set up Three.js scene
let scene, camera, renderer, cube;
let isObjectSelected = false;
let previousHandPosition = null;
let initialZoomDistance = null;

function initThree() {
    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // 3D Object (Cube)
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
}

initThree();

// Initialize MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.8,
});

hands.onResults(onResults);

// Set up the camera
const cameraM = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480,
});
cameraM.start();

// Gesture Variables
let gesture = null;

// Function to recognize gestures
function recognizeGesture(landmarks) {
    // Implement gesture recognition logic
    // Return 'pinch' for selection
    // Return 'open_hand' for zoom
    // Return null if no gesture recognized

    // Calculate distances between thumb tip and index finger tip
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const pinkyTip = landmarks[20];

    const thumbIndexDist = distance(thumbTip, indexTip);
    const thumbMiddleDist = distance(thumbTip, middleTip);
    const thumbPinkyDist = distance(thumbTip, pinkyTip);

    // Thresholds (adjust based on testing)
    const pinchThreshold = 0.05;
    const openHandThreshold = 0.15;

    // Pinch Gesture
    if (thumbIndexDist < pinchThreshold && thumbMiddleDist > openHandThreshold) {
        return 'pinch';
    }

    // Open Hand Gesture (for zoom)
    if (thumbIndexDist > openHandThreshold && thumbMiddleDist > openHandThreshold && thumbPinkyDist > openHandThreshold) {
        return 'open_hand';
    }

    // No gesture recognized
    return null;
}

// Utility function to calculate distance between two landmarks
function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Function to perform actions based on recognized gesture
function performAction(gesture, landmarks) {
    switch (gesture) {
        case 'pinch':
            selectAndMoveObject(landmarks);
            break;
        case 'open_hand':
            zoomCamera(landmarks);
            break;
        case null:
            // No gesture detected
            isObjectSelected = false;
            previousHandPosition = null;
            initialZoomDistance = null;
            break;
    }

    // Always check for rotation
    rotateObject(landmarks);
}

// Function to select and move the object
function selectAndMoveObject(landmarks) {
    // Get hand position (average of wrist and index MCP)
    const wrist = landmarks[0];
    const indexMCP = landmarks[5];

    const handX = (wrist.x + indexMCP.x) / 2;
    const handY = (wrist.y + indexMCP.y) / 2;

    // Map hand position to 3D space
    const x = (handX - 0.5) * 2;
    const y = -(handY - 0.5) * 2;

    if (!isObjectSelected) {
        isObjectSelected = true;
        previousHandPosition = { x, y };
    } else {
        // Calculate movement delta
        const deltaX = x - previousHandPosition.x;
        const deltaY = y - previousHandPosition.y;

        // Move the object
        cube.position.x += deltaX * 2;
        cube.position.y += deltaY * 2;

        // Update previous hand position
        previousHandPosition = { x, y };
    }
}

// Function to rotate the object
function rotateObject(landmarks) {
    // Calculate wrist rotation
    const indexMCP = landmarks[5];
    const wrist = landmarks[0];

    const deltaX = indexMCP.x - wrist.x;
    const deltaY = indexMCP.y - wrist.y;

    const angle = Math.atan2(deltaY, deltaX);

    // Rotate the object
    cube.rotation.z = angle;
}

// Function to zoom the camera
function zoomCamera(landmarks) {
    // Calculate distance between thumb tip and pinky tip
    const thumbTip = landmarks[4];
    const pinkyTip = landmarks[20];

    const handOpenDistance = distance(thumbTip, pinkyTip);

    if (initialZoomDistance === null) {
        initialZoomDistance = handOpenDistance;
    } else {
        const zoomFactor = initialZoomDistance / handOpenDistance;

        // Limit zoom factor
        const minZoom = 2;
        const maxZoom = 10;

        camera.position.z = THREE.MathUtils.clamp(zoomFactor * 5, minZoom, maxZoom);
    }
}

// Function to handle results from MediaPipe Hands
function onResults(results) {
    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the video frame
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // Draw hand landmarks
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
        drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 1 });

        // Recognize gesture
        gesture = recognizeGesture(landmarks);

        // Perform actions based on gesture
        performAction(gesture, landmarks);
    } else {
        // No hands detected
        isObjectSelected = false;
        previousHandPosition = null;
        initialZoomDistance = null;
    }

    canvasCtx.restore();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update any animations or controls here

    renderer.render(scene, camera);
}

animate();