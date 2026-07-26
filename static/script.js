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

// --- ANIMATION LOOP & CONTROLS ---

const clock = new THREE.Clock();
let isFast = false;
let currentTheme = 'cyberpunk';

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    const speedMultiplier = isFast ? 2.5 : 1.0;

    // Rotate 3D Objects
    cyberCore.rotation.x = elapsedTime * 0.3 * speedMultiplier;
    cyberCore.rotation.y = elapsedTime * 0.5 * speedMultiplier;

    outerShell.rotation.x = -elapsedTime * 0.2 * speedMultiplier;
    outerShell.rotation.y = -elapsedTime * 0.3 * speedMultiplier;

    particleSystem.rotation.y = elapsedTime * 0.05 * speedMultiplier;

    // Smooth Cursor Following Effect
    cyberCore.rotation.y += mouseX * 0.05;
    cyberCore.rotation.x += mouseY * 0.05;

    outerShell.rotation.y += mouseX * 0.03;
    outerShell.rotation.x += mouseY * 0.03;

    renderer.render(scene, camera);
}

animate();

// --- THEME & SPEED TOGGLE FUNCTIONS ---

function toggleSpeed() {
    isFast = !isFast;
    showCyberToast(isFast ? "3D Core Speed: Turbo Boosted ⚡" : "3D Core Speed: Normal 🟢", "fa-gauge-high");
}

function toggleTheme() {
    if (currentTheme === 'cyberpunk') {
        currentTheme = 'matrix';
        cyberCore.material.color.setHex(0x00ff66);
        outerShell.material.color.setHex(0x003311);
        particleSystem.material.color.setHex(0x00ff66);
        showCyberToast("Theme Switched: Matrix Green 🟢", "fa-palette");
    } else {
        currentTheme = 'cyberpunk';
        cyberCore.material.color.setHex(0x9d00ff);
        outerShell.material.color.setHex(0x00f3ff);
        particleSystem.material.color.setHex(0x00f3ff);
        showCyberToast("Theme Switched: Cyberpunk Neon 🌌", "fa-palette");
    }
}

// --- CYBER TOAST NOTIFICATION SYSTEM ---

function showCyberToast(message, icon = "fa-bolt") {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'cyber-toast';
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color: #00f3ff;"></i> ${message}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

// Button Trigger
function initCore() {
    showCyberToast("AINDRA 3D Cyber-Core Initialized!", "fa-circle-check");
}
// --- INITIALIZE CORE SYSTEM (Fetches Real API Data) ---
async function initializeCoreSystem() {
    showCyberToast("Connecting to AINDRA Backend...", "fa-spinner fa-spin");
    
    try {
        const response = await fetch('/api/status');
        const data = await response.json();

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-microchip" style="color:#00f3ff"></i> CORE SYSTEM ONLINE</div>
            <p>System Diagnostics executed successfully from Flask Backend microservices.</p>
            <div class="modal-stat-grid">
                <div class="stat-item"><span>SYSTEM STATUS</span><strong>${data.status.toUpperCase()}</strong></div>
                <div class="stat-item"><span>CORE ENGINE</span><strong>${data.engine}</strong></div>
                <div class="stat-item"><span>API VERSION</span><strong>${data.version}</strong></div>
                <div class="stat-item"><span>CORE NAME</span><strong>${data.system}</strong></div>
            </div>
            <button class="cyber-btn primary" style="width:100%" onclick="toggleSpeed()">BOOST CORE SPEED ⚡</button>
        `;
        openModal();
    } catch (err) {
        showCyberToast("Failed to fetch API data", "fa-triangle-exclamation");
    }
}

// --- CARD CLICK INSPECTOR MODALS ---
function openCardModal(type) {
    const modalBody = document.getElementById('modal-body');
    
    if (type === 'webgl') {
        modalBody.innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-cube" style="color:#00f3ff"></i> WebGL 3D Engine</div>
            <p>Real-time GPU accelerated rendering pipeline driving the 3D Cyber-Orb geometry.</p>
            <div class="modal-stat-grid">
                <div class="stat-item"><span>GEOMETRY</span><strong>Icosahedron (Wireframe)</strong></div>
                <div class="stat-item"><span>PARTICLES</span><strong>700 Active Nodes</strong></div>
                <div class="stat-item"><span>RENDERER</span><strong>Three.js WebGL</strong></div>
                <div class="stat-item"><span>FRAME RATE</span><strong>60 FPS Smooth</strong></div>
            </div>
            <button class="cyber-btn primary" style="width:100%" onclick="toggleTheme()">CHANGE COLOR MATRIX 🎨</button>
        `;
    } else if (type === 'neural') {
        modalBody.innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-brain" style="color:#9d00ff"></i> Neural Backend API</div>
            <p>Flask microservice providing state endpoints and JSON payload routing.</p>
            <div class="modal-stat-grid">
                <div class="stat-item"><span>BACKEND</span><strong>Python 3 / Flask</strong></div>
                <div class="stat-item"><span>SERVER</span><strong>Gunicorn PaaS</strong></div>
                <div class="stat-item"><span>LATENCY</span><strong>12 ms Response</strong></div>
                <div class="stat-item"><span>ENDPOINT</span><strong>/api/status</strong></div>
            </div>
        `;
    } else if (type === 'defense') {
        modalBody.innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-shield-halved" style="color:#10b981"></i> Cyber Defense Specs</div>
            <p>Hardened deployment environment configured with GitHub CI/CD automation.</p>
            <div class="modal-stat-grid">
                <div class="stat-item"><span>CI/CD</span><strong>GitHub Actions / Render</strong></div>
                <div class="stat-item"><span>SSL</span><strong>TLS 1.3 Encrypted</strong></div>
                <div class="stat-item"><span>LICENSE</span><strong>MIT Open Source</strong></div>
                <div class="stat-item"><span>HEALTH</span><strong>100% Operational</strong></div>
            </div>
        `;
    }
    openModal();
}

// Modal Handlers
function openModal() {
    document.getElementById('cyber-modal').classList.add('active');
}

function closeModal(e) {
    if (e.target.id === 'cyber-modal') {
        document.getElementById('cyber-modal').classList.remove('active');
    }
}

function closeModalDirect() {
    document.getElementById('cyber-modal').classList.remove('active');
}
