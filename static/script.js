
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

// Interactive Button Trigger
function initCore() {
    showCyberToast("AINDRA 3D Cyber-Core Initialized!", "fa-circle-check");
}
// --- INTERACTIVE CONTROLS & THEMES ---

let isFast = false;
let currentTheme = 'cyberpunk'; // cyberpunk or matrix

function toggleSpeed() {
    isFast = !isFast;
  const speedMultiplier = isFast ? 2.5 : 1.0;

cyberCore.rotation.x = elapsedTime * 0.3 * speedMultiplier;
cyberCore.rotation.y = elapsedTime * 0.5 * speedMultiplier;

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

// Update rotation inside animation loop (Modify rotation multiplier with 'isFast')
