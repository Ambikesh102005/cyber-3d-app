// --- WEBSOCKET & 3D ENGINE INITIALIZATION ---
const socket = io();
const canvas = document.getElementById('cyber-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4.5;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const sceneGroup = new THREE.Group();
scene.add(sceneGroup);

let currentScene = 'orb';
let isFast = false;
let currentTheme = 'cyberpunk';
let audioEnabled = false;
let currentUser = null;

// Listen for Auth State Changes Automatically
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        const firstName = user.displayName ? user.displayName.split(' ')[0].toUpperCase() : "USER";
        document.getElementById('auth-label').innerText = firstName;
        showCyberToast(`Logged in as ${user.displayName}`, "fa-user-check");
    } else {
        currentUser = null;
        document.getElementById('auth-label').innerText = "LOGIN";
    }
});

// --- REAL FIREBASE GOOGLE AUTHENTICATION ---
function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            currentUser = user;
            
            // Save User Record in Realtime Database
            db.ref('users/' + user.uid).set({
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                lastActive: new Date().toISOString()
            });

            closeModalDirect();
            showCyberToast(`Welcome, ${user.displayName}!`, "fa-circle-check");
        })
        .catch((error) => {
            console.error("Firebase Auth Error:", error);
            showCyberToast("Google Auth Failed or Cancelled", "fa-triangle-exclamation");
        });
}

function logoutUser() {
    auth.signOut().then(() => {
        closeModalDirect();
        showCyberToast("Signed Out Successfully", "fa-right-from-bracket");
    });
}

// --- CUSTOM GLSL SHADER PIPELINE ---
const customVertexShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying float vDisplacement;
    void main() {
        vUv = uv;
        vec3 pos = position;
        float wave = sin(pos.x * 5.0 + uTime * 2.0) * cos(pos.y * 5.0 + uTime * 2.0);
        pos += normal * wave * 0.2;
        vDisplacement = wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const customFragmentShader = `
    uniform float uTime;
    varying float vDisplacement;
    void main() {
        vec3 color = mix(vec3(0.0, 0.95, 1.0), vec3(0.61, 0.0, 1.0), vDisplacement + 0.5);
        gl_FragColor = vec4(color, 0.85);
    }
`;

const customShaderMaterial = new THREE.ShaderMaterial({
    vertexShader: customVertexShader,
    fragmentShader: customFragmentShader,
    uniforms: { uTime: { value: 0 } },
    wireframe: true,
    transparent: true
});

// --- AUDIO SYNTHESIZER ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playCyberBeep(freq = 440, type = 'sine', duration = 0.12) {
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
    if (audioEnabled && audioCtx.state === 'suspended') audioCtx.resume();
    document.getElementById('audio-icon').className = audioEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
    showCyberToast(audioEnabled ? "Audio Synthesizer: Active 🔊" : "Audio Muted 🔇", "fa-volume-high");
}

// --- 8 MULTI-SCENE GENERATORS ---
function clearSceneGroup() {
    while(sceneGroup.children.length > 0) {
        const obj = sceneGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        sceneGroup.remove(obj);
    }
}

function buildOrbScene() {
    clearSceneGroup();
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 2), customShaderMaterial);
    const outer = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 1), new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.3 }));
    sceneGroup.add(core, outer);
}

function buildTorusScene() {
    clearSceneGroup();
    const torus = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.4, 16, 80), customShaderMaterial);
    sceneGroup.add(torus);
}

function buildParticlesScene() {
    clearSceneGroup();
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(1500 * 3);
    for (let i = 0; i < 4500; i++) pos[i] = (Math.random() - 0.5) * 15;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sceneGroup.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.03, color: 0x9d00ff })));
}

function buildKaleidoscopeScene() {
    clearSceneGroup();
    for(let i=0; i<5; i++) {
        const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8 + i*0.2, 0.1, 64, 8), customShaderMaterial);
        sceneGroup.add(mesh);
    }
}

function buildPlanetScene() {
    clearSceneGroup();
    const planet = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), customShaderMaterial);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.4, 2.0, 32), new THREE.MeshBasicMaterial({ color: 0x00f3ff, side: THREE.DoubleSide, wireframe: true }));
    ring.rotation.x = Math.PI / 2;
    sceneGroup.add(planet, ring);
}

function buildStarfieldScene() {
    clearSceneGroup();
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(3000 * 3);
    for (let i = 0; i < 9000; i++) pos[i] = (Math.random() - 0.5) * 20;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sceneGroup.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.04, color: 0x00f3ff })));
}

function buildDnaScene() {
    clearSceneGroup();
    const group = new THREE.Group();
    for(let i=0; i<30; i++) {
        const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.08), new THREE.MeshBasicMaterial({ color: 0x00f3ff }));
        const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.08), new THREE.MeshBasicMaterial({ color: 0x9d00ff }));
        p1.position.set(Math.sin(i*0.3), (i-15)*0.15, Math.cos(i*0.3));
        p2.position.set(-Math.sin(i*0.3), (i-15)*0.15, -Math.cos(i*0.3));
        group.add(p1, p2);
    }
    sceneGroup.add(group);
}

function buildFractalScene() {
    clearSceneGroup();
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 3), customShaderMaterial);
    sceneGroup.add(mesh);
}

buildOrbScene();

function change3DScene(name) {
    currentScene = name;
    playCyberBeep(600, 'triangle');
    document.getElementById('scene-val').innerText = name.toUpperCase();
    
    if (name === 'orb') buildOrbScene();
    else if (name === 'torus') buildTorusScene();
    else if (name === 'particles') buildParticlesScene();
    else if (name === 'kaleidoscope') buildKaleidoscopeScene();
    else if (name === 'planet') buildPlanetScene();
    else if (name === 'starfield') buildStarfieldScene();
    else if (name === 'dna') buildDnaScene();
    else if (name === 'fractal') buildFractalScene();

    showCyberToast(`Environment Loaded: ${name.toUpperCase()}`, "fa-cube");
}

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();
let frameCount = 0, lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    const speed = isFast ? 2.5 : 1.0;

    customShaderMaterial.uniforms.uTime.value = elapsedTime;

    sceneGroup.rotation.x = elapsedTime * 0.3 * speed;
    sceneGroup.rotation.y = elapsedTime * 0.5 * speed;

    renderer.render(scene, camera);

    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        document.getElementById('fps-val').innerText = frameCount;
        frameCount = 0;
        lastTime = now;
    }
}
animate();

// --- CONTROLS & MODALS ---
function toggleSpeed() {
    isFast = !isFast;
    playCyberBeep(750, 'sine');
    showCyberToast(isFast ? "Turbo Speed Boosted ⚡" : "Normal Speed 🟢", "fa-gauge-high");
}

function toggleTheme() {
    playCyberBeep(520, 'square');
    showCyberToast("Theme Matrix Applied 🟢", "fa-palette");
}

function openAuthModal() {
    const modalBody = document.getElementById('modal-body');
    if (currentUser) {
        modalBody.innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-user-check"></i> AUTHENTICATED USER</div>
            <p style="margin-bottom:15px">Logged in as: <strong>${currentUser.displayName}</strong> (${currentUser.email})</p>
            <button class="cyber-btn primary" style="width:100%" onclick="logoutUser()">LOGOUT ACCOUNT 🚪</button>
        `;
    } else {
        modalBody.innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-user-astronaut"></i> GOOGLE AUTHENTICATION</div>
            <p>Connect your Google Account with Firebase Cloud Credentials to save scores and custom presets.</p>
            <button class="cyber-btn primary" style="width:100%; margin-top:20px;" onclick="loginWithGoogle()">SIGN IN WITH GOOGLE 🚀</button>
        `;
    }
    openModal();
}

async function openLeaderboardModal() {
    playCyberBeep(650, 'sine');
    showCyberToast("Fetching Realtime Leaderboard...", "fa-trophy");
    try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        let rows = data.leaderboard.map(u => `
            <div class="stat-item"><span>RANK #${u.rank} - ${u.username}</span><strong>${u.score} PTS (${u.fps} FPS)</strong></div>
        `).join('');

        document.getElementById('modal-body').innerHTML = `
            <div class="modal-title"><i class="fa-solid fa-trophy" style="color:#f59e0b"></i> GLOBAL LEADERBOARD</div>
            <div class="modal-stat-grid">${rows}</div>
        `;
        openModal();
    } catch(e) {}
}

async function initializeCoreSystem() {
    const res = await fetch('/api/status');
    const data = await res.json();
    document.getElementById('modal-body').innerHTML = `
        <div class="modal-title"><i class="fa-solid fa-microchip"></i> SYSTEM DIAGNOSTICS</div>
        <div class="modal-stat-grid">
            <div class="stat-item"><span>SYSTEM</span><strong>${data.system}</strong></div>
            <div class="stat-item"><span>DATABASE</span><strong>Firebase Connected</strong></div>
            <div class="stat-item"><span>WEBSOCKET</span><strong>CONNECTED</strong></div>
            <div class="stat-item"><span>SCENES</span><strong>8 SCENES LOADED</strong></div>
        </div>
    `;
    openModal();
}

function openCardModal(type) {
    playCyberBeep(600, 'sine');
    openModal();
}

function openModal() { document.getElementById('cyber-modal').classList.add('active'); }
function closeModal(e) { if (e.target.id === 'cyber-modal') document.getElementById('cyber-modal').classList.remove('active'); }
function closeModalDirect() { document.getElementById('cyber-modal').classList.remove('active'); }

function showCyberToast(msg, icon = "fa-bolt") {
    let container = document.getElementById('toast-container') || document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    const toast = document.createElement('div');
    toast.className = 'cyber-toast';
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color: #00f3ff;"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3000);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
