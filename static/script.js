// --- THREE.JS 3D ENGINE SETUP ---

const canvas = document.getElementById('cyber-canvas');
const scene = new THREE.Scene();

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4.5;

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- CREATING 3D CYBER-ORB OBJECT ---

// 1. Inner Core Geometry
const coreGeo = new THREE.IcosahedronGeometry(1.2, 2);
const coreMat = new THREE.MeshBasicMaterial({
    color: 0x9d00ff,
    wireframe: true,
    transparent: true,
    opacity: 0.6
});
const cyberCore = new THREE.Mesh(coreGeo, coreMat);
scene.add(cyberCore);

// 2. Outer Cyber Wireframe Shell
const outerGeo = new THREE.IcosahedronGeometry(1.8, 1);
const outerMat = new THREE.MeshBasicMaterial({
    color: 0x00f3ff,
    wireframe: true,
    transparent: true,
    opacity: 0.35
});
const outerShell = new THREE.Mesh(outerGeo, outerMat);
scene.add(outerShell);

// 3. Floating Particles Background
const particlesGeo = new THREE.BufferGeometry();
const count = 700;
const positions = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 15;
}

particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 0.025,
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.7
});
const particleSystem = new THREE.Points(particlesGeo, particlesMat);
scene.add(particleSystem);

// --- INTERACTIVITY (Touch / Mouse Movement) ---

let mouseX = 0;
let mouseY = 0;

function onPointerMove(event) {
    const x = event.clientX || (event.touches && event.touches[0].clientX);
    const y = event.clientY || (event.touches && event.touches[0].clientY);

    if (x && y) {
        mouseX = (x / window.innerWidth - 0.5) * 2;
        mouseY = (y / window.innerHeight - 0.5) * 2;
    }
}

window.addEventListener('mousemove', onPointerMove);
window.addEventListener('touchmove', onPointerMove);

// --- RESIZE HANDLER ---

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- ANIMATION LOOP ---

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Rotate 3D Objects
    cyberCore.rotation.x = elapsedTime * 0.3;
    cyberCore.rotation.y = elapsedTime * 0.5;

    outerShell.rotation.x = -elapsedTime * 0.2;
    outerShell.rotation.y = -elapsedTime * 0.3;

    particleSystem.rotation.y = elapsedTime * 0.05;

    // Smooth Cursor Following Effect
    cyberCore.rotation.y += mouseX * 0.05;
    cyberCore.rotation.x += mouseY * 0.05;

    outerShell.rotation.y += mouseX * 0.03;
    outerShell.rotation.x += mouseY * 0.03;

    renderer.render(scene, camera);
}

animate();

// Button Pulse Action
function initCore() {
    alert("🚀 AINDRA 3D Cyber-Core Initialized Successfully!");
}
