import os
import time
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# System Metrics & Configuration Pipeline
APP_CONFIG = {
    "system": "AINDRA Cyber-Core Enterprise Platform",
    "version": "3.0.0-ENTERPRISE",
    "status": "OPERATIONAL",
    "engine": "WebGL Shaders / Three.js R128",
    "architecture": "Flask Microservices / Render PaaS",
    "ssl": "TLS v1.3 Encrypted"
}

AVAILABLE_SCENES = [
    {"id": "orb", "name": "Cyber Orb Core", "polygons": 1200, "shader": "Wireframe Core"},
    {"id": "torus", "name": "Holographic Torus Field", "polygons": 3200, "shader": "Quantum Mesh"},
    {"id": "particles", "name": "Deep Space Particle Universe", "polygons": 4500, "shader": "Particle Dynamics"}
]

@app.route('/')
def home():
    return render_template('index.html')

# API Endpoint: System Status Diagnostics
@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        **APP_CONFIG,
        "server_time": time.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "active_threads": 4,
        "memory_usage": "142 MB"
    })

# API Endpoint: Available Scenes Manifest
@app.route('/api/scenes', methods=['GET'])
def get_scenes():
    return jsonify({
        "status": "success",
        "total_scenes": len(AVAILABLE_SCENES),
        "scenes": AVAILABLE_SCENES
    })

# API Endpoint: Real-time Telemetry Ingestion
@app.route('/api/telemetry', methods=['POST'])
def receive_telemetry():
    data = request.json or {}
    fps = data.get("fps", 60)
    scene_id = data.get("scene", "orb")
    print(f"[AINDRA TELEMETRY LOG]: Scene: {scene_id} | FPS: {fps}")
    return jsonify({"status": "acknowledged", "latency": "8ms"})

# API Endpoint: User Feedback Routing
@app.route('/api/feedback', methods=['POST'])
def receive_feedback():
    payload = request.json or {}
    message = payload.get("message", "No message content")
    print(f"[AINDRA USER FEEDBACK]: {message}")
    return jsonify({"status": "success", "message": "Feedback successfully logged into core telemetry."})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
