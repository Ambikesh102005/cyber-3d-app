
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
