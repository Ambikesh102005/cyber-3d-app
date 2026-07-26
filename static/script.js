// --- THREE.JS MULTI-SCENE ENGINE SETUP ---
const canvas = document.getElementById('cyber-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4.5;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scene Parent Group
const sceneGroup = new THREE.Group();
scene.add(sceneGroup);

let currentScene = 'orb';
let isFast = false;
let currentTheme = 'cyberpunk';
let audioEnabled = false;

// --- NATIVE WEB AUDIO SYNTHESIZER ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playCyberBeep(freq = 440, type = 'sine', duration = 0.15) {
    if (!audioEnabled) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
}

function toggleAudio() {
    audioEnabled = !audioEnabled;
    if (audioEnabled && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const icon = document.getElementById('audio-icon');
    icon.className = audioEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
    playCyberBeep(audioEnabled ? 880 : 300, 'sine');
    showCyberToast(audioEnabled ? "Audio Synthesizer: Enabled 🔊" : "Audio Synthesizer: Muted 🔇", "fa-volume-high");
}

// --- 3D SCENE GENERATORS ---

function clearSceneGroup() {
    while(sceneGroup.children.length > 0) { 
        const obj = sceneGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
        sceneGroup.remove(obj); 
    }
}

// 1. Cyber Orb Geometry
function buildOrbScene() {
    clearSceneGroup();
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x9d00ff, wireframe: true, transparent: true, opacity: 0.6 });
    const core = new THREE.Mesh(coreGeo, coreMat);

    const outerGeo = new THREE.IcosahedronGeometry(1.8, 1);
    const outerMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.35 });
    const outer = new THREE.Mesh(outerGeo, outerMat);

    sceneGroup.add(core);
    sceneGroup.add(outer);
    document.getElementById('poly-val').innerText = "1200";
}

// 2. Holographic Torus Field
function buildTorusScene() {
    clearSceneGroup();
    const torusGeo = new THREE.TorusGeometry(1.4, 0.45, 16, 80);
    const torusMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.7 });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    sceneGroup.add(torus);
    document.getElementById('poly-val').innerText = "3200";
}

// 3. Deep Space Particle Universe
function buildParticlesScene() {
    clearSceneGroup();
    const particlesGeo = new THREE.BufferGeometry();
    const count = 1500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 15;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.03, color: 0x9d00ff, transparent: true, opacity: 0.8 });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    sceneGroup.add(particleSystem);
    document.getElementById('poly-val').innerText = "4500";
}

// Initialize Default Orb Scene
buildOrbScene();

// Scene Selector Switcher Function
function change3DScene(sceneName) {
    currentScene = sceneName;
    playCyberBeep(650, 'triangle');
    document.getElementById('scene-val').innerText = sceneName.toUpperCase();

    if (sceneName === 'orb') buildOrbScene();
    else if (sceneName === 'torus') buildTorusScene();
    else if (sceneName === 'particles') buildParticlesScene();

    showCyberToast(`Environment Switched: ${sceneName.toUpperCase()}`, "fa-cube");
}

// --- ANIMATION & TELEMETRY LOOP ---
const clock = new THREE.Clock();
let frameCount = 0;
let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    const speed = isFast ? 2.5 : 1.0;

    sceneGroup.rotation.x = elapsedTime * 0.3 * speed;
    sceneGroup.rotation.y = elapsedTime * 0.5 * speed;

    renderer.render(scene, camera);

    // Calculate Real-time FPS
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        document.getElementById('fps-val').innerText = frameCount;
        frameCount = 0;
        lastTime = now;
    }
}
animate();

// --- CONTROLS & API DIAGNOSTICS ---
function toggleSpeed() {
    isFast = !isFast;
    playCyberBeep(750, 'sine');
    showCyberToast(isFast ? "3D Core Speed: Turbo Boosted ⚡" : "3D Core Speed: Normal 🟢", "fa-gauge-high");
}

function toggleTheme() {
    playCyberBeep(520, 'square');
    if (currentTheme === 'cyberpunk') {
        currentTheme = 'matrix';
        sceneGroup.children.forEach(obj => { if(obj.material) obj.material.color.setHex(0x00ff66); });
        showCyberToast("Theme Matrix Green Applied 🟢", "fa-palette");
    } else {
        currentTheme = 'cyberpunk';
        sceneGroup.children.forEach(obj => { if(obj.material) obj.material.color.setHex(0x00f3ff); });
        showCyberToast("Theme Cyberpunk Neon Applied 🌌", "fa-palette");
    }
}

// Fetch Diagnostics from Flask API
async function initializeCoreSystem() {
    playCyberBeep(800, 'sine');
    showCyberToast("Polling Backend Microservice...", "fa-spinner fa-spin");
    
    try {
        const response = await fetch('/api/status');
        const data = await response.json();

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-microchip"></i> DIAGNOSTICS CORE ONLINE</div>
            <p>Real-time system configuration fetched from Flask REST Endpoints.</p>
            <div class="modal-stat-grid">
                <div class="stat-item"><span>SYSTEM</span><strong>${data.system}</strong></div>
                <div class="stat-item"><span>STATUS</span><strong>${data.status}</strong></div>
                <div class="stat-item"><span>VERSION</span><strong>${data.version}</strong></div>
                <div class="stat-item"><span>ENGINE</span><strong>${data.engine}</strong></div>
                <div class="stat-item"><span>MEMORY</span><strong>${data.memory_usage}</strong></div>
                <div class="stat-item"><span>ENCRYPTION</span><strong>${data.ssl}</strong></div>
            </div>
            <button class="cyber-btn primary" style="width:100%" onclick="toggleSpeed()">BOOST CORE SPEED ⚡</button>
        `;
        openModal();
    } catch (err) {
        showCyberToast("Failed to connect to API endpoint", "fa-triangle-exclamation");
    }
}

// Card Modal Inspector
function openCardModal(type) {
    playCyberBeep(600, 'sine');
    const modalBody = document.getElementById('modal-body');
    
    if (type === 'webgl') {
        modalBody.innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-cube"></i> WebGL Shader Engine</div>
            <p>Hardware-accelerated rendering pipeline controlling active WebGL scenes.</p>
            <div class="modal-stat-grid">
                <div class="stat-item"><span>ACTIVE SCENE</span><strong>${currentScene.toUpperCase()}</strong></div>
                <div class="stat-item"><span>POLYGONS</span><strong>${document.getElementById('poly-val').innerText}</strong></div>
                <div class="stat-item"><span>TARGET FPS</span><strong>60 FPS</strong></div>
                <div class="stat-item"><span>PIXEL RATIO</span><strong>${window.devicePixelRatio}x</strong></div>
            </div>
        `;
    } else if (type === 'neural') {
        modalBody.innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-brain"></i> Neural Backend API</div>
            <p>High-performance Python Flask microservices driving asynchronous telemetry routing.</p>
            <div class="modal-stat-grid">
                <div class="stat-item"><span>FRAMEWORK</span><strong>Flask / Python 3</strong></div>
                <div class="stat-item"><span>SERVER</span><strong>Gunicorn WSGI</strong></div>
                <div class="stat-item"><span>ENDPOINT</span><strong>/api/status</strong></div>
                <div class="stat-item"><span>LATENCY</span><strong>&lt; 10ms</strong></div>
            </div>
        `;
    } else if (type === 'defense') {
        modalBody.innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-shield-halved"></i> Cyber Defense Specs</div>
            <p>Hardened deployment pipeline configured with automated CI/CD workflows.</p>
            <div class="modal-stat-grid">
                <div class="stat-item"><span>CI/CD</span><strong>GitHub Actions</strong></div>
                <div class="stat-item"><span>HOSTING</span><strong>Render PaaS</strong></div>
                <div class="stat-item"><span>SSL</span><strong>TLS 1.3 Active</strong></div>
                <div class="stat-item"><span>HEALTH</span><strong>100% Operational</strong></div>
            </div>
        `;
    }
    openModal();
}

// Modal Toggle Handlers
function openModal() { document.getElementById('cyber-modal').classList.add('active'); }
function closeModal(e) { if (e.target.id === 'cyber-modal') document.getElementById('cyber-modal').classList.remove('active'); }
function closeModalDirect() { document.getElementById('cyber-modal').classList.remove('active'); }

// Cyber Toast Engine
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
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3200);
}

// Window Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
