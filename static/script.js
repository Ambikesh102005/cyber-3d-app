// --- MULTI-SCENE 3D ENGINE ---
const canvas = document.getElementById('cyber-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4.5;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Active Objects Container Group
const sceneGroup = new THREE.Group();
scene.add(sceneGroup);

let currentScene = 'orb';
let isFast = false;
let currentTheme = 'cyberpunk';
let audioEnabled = false;

// Web Audio API Synthesizer (No external mp3 needed)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playCyberBeep(freq = 440, type = 'sine') {
    if (!audioEnabled) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } catch(e) {}
}

function toggleAudio() {
    audioEnabled = !audioEnabled;
    if (audioEnabled && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    document.getElementById('audio-icon').className = audioEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
    showCyberToast(audioEnabled ? "Audio Synthesizer: Enabled 🔊" : "Audio Synthesizer: Muted 🔇", "fa-volume-high");
}

// --- SCENE BUILDERS ---

function clearSceneGroup() {
    while(sceneGroup.children.length > 0){ 
        const obj = sceneGroup.children[0];
        sceneGroup.remove(obj); 
    }
}

// 1. Cyber Orb Scene
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

// 2. Neon Torus Scene
function buildTorusScene() {
    clearSceneGroup();
    const torusGeo = new THREE.TorusGeometry(1.5, 0.4, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.7 });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    sceneGroup.add(torus);
    document.getElementById('poly-val').innerText = "3200";
}

// 3. Particle Universe Scene
function buildParticlesScene() {
    clearSceneGroup();
    const particlesGeo = new THREE.BufferGeometry();
    const count = 1500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) { pos[i] = (Math.random() - 0.5) * 15; }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.03, color: 0x9d00ff, transparent: true, opacity: 0.8 });
    const system = new THREE.Points(particlesGeo, particlesMat);
    sceneGroup.add(system);
    document.getElementById('poly-val').innerText = "4500";
}

// Initialize Default Scene
buildOrbScene();

// Scene Selector Switcher
function change3DScene(sceneName) {
    currentScene = sceneName;
    playCyberBeep(600, 'triangle');
    document.getElementById('scene-val').innerText = sceneName.toUpperCase();

    if (sceneName === 'orb') buildOrbScene();
    else if (sceneName === 'torus') buildTorusScene();
    else if (sceneName === 'particles' || sceneName === 'matrix') buildParticlesScene();

    showCyberToast(`3D Environment Changed: ${sceneName.toUpperCase()}`, "fa-cube");
}

// --- ANIMATION LOOP ---
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

    // FPS Counter Calculation
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
    playCyberBeep(800, 'sine');
    showCyberToast(isFast ? "3D Core Speed: Turbo Boosted ⚡" : "3D Core Speed: Normal 🟢", "fa-gauge-high");
}

function toggleTheme() {
    playCyberBeep(500, 'square');
    if (currentTheme === 'cyberpunk') {
        currentTheme = 'matrix';
        sceneGroup.children.forEach(obj => { if(obj.material) obj.material.color.setHex(0x00ff66); });
        showCyberToast("Theme: Matrix Green 🟢", "fa-palette");
    } else {
        currentTheme = 'cyberpunk';
        sceneGroup.children.forEach(obj => { if(obj.material) obj.material.color.setHex(0x00f3ff); });
        showCyberToast("Theme: Cyberpunk Neon 🌌", "fa-palette");
    }
}

async function initializeCoreSystem() {
    playCyberBeep(700, 'sine');
    showCyberToast("Connecting to AINDRA Enterprise Core...", "fa-spinner fa-spin");
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        
        document.getElementById('modal-body').innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-microchip"></i> DIAGNOSTICS CORE</div>
            <p>Real-time system health and configuration status fetched from Python microservice.</p>
            <div class="modal-stat-grid">
                <div class="stat-item"><span>SYSTEM</span><strong>${data.system}</strong></div>
                <div class="stat-item"><span>STATUS</span><strong>${data.status}</strong></div>
                <div class="stat-item"><span>VERSION</span><strong>${data.version}</strong></div>
                <div class="stat-item"><span>ENGINE</span><strong>${data.engine}</strong></div>
            </div>
            <button class="cyber-btn primary" style="width:100%" onclick="toggleSpeed()">BOOST TURBO ⚡</button>
        `;
        openModal();
    } catch(e) {
        showCyberToast("API Connection Error", "fa-triangle-exclamation");
    }
}

function openCardModal(type) {
    playCyberBeep(650, 'sine');
    const modalBody = document.getElementById('modal-body');
    if (type === 'webgl') {
        modalBody.innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-cube"></i> WebGL Shader Engine</div>
            <p>Dynamic GPU shader pipeline supporting multi-geometry scenes and particle fields.</p>
            <div class="modal-stat-grid">
                <div class="stat-item"><span>ACTIVE SCENE</span><strong>${currentScene.toUpperCase()}</strong></div>
                <div class="stat-item"><span>FRAME RATE</span><strong>60 FPS</strong></div>
            </div>
        `;
    } else if (type === 'neural') {
        modalBody.innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-brain"></i> Neural Backend</div>
            <p>Flask Microservices processing async telemetry and configuration pipelines.</p>
        `;
    } else if (type === 'defense') {
        modalBody.innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-shield-halved"></i> Cyber Defense</div>
            <p>SSL Encryption & CI/CD Automated Pipelines on Render PaaS.</p>
        `;
    }
    openModal();
}

function openModal() { document.getElementById('cyber-modal').classList.add('active'); }
function closeModal(e) { if (e.target.id === 'cyber-modal') document.getElementById('cyber-modal').classList.remove('active'); }
function closeModalDirect() { document.getElementById('cyber-modal').classList.remove('active'); }

function showCyberToast(msg, icon = "fa-bolt") {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'cyber-toast';
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color: #00f3ff;"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3500);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
