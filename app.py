import os
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# System Configurations
APP_CONFIG = {
    "system": "AINDRA Cyber-Core Enterprise",
    "version": "3.0.0-PRO",
    "status": "ONLINE",
    "engine": "WebGL / Three.js Shaders",
    "pwa_ready": True
}

AVAILABLE_SCENES = [
    {"id": "orb", "name": "Cyber Orb Core", "complexity": "Medium"},
    {"id": "matrix", "name": "Matrix Code Rain", "complexity": "High"},
    {"id": "torus", "name": "Holographic Torus Field", "complexity": "High"},
    {"id": "particles", "name": "Deep Space Particle Universe", "complexity": "Extreme"}
]

@app.route('/')
def home():
    return render_template('index.html')

# API Route: System Status
@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(APP_CONFIG)

# API Route: Available 3D Scenes
@app.route('/api/scenes', methods=['GET'])
def get_scenes():
    return jsonify({"scenes": AVAILABLE_SCENES})

# API Route: User Feedback / Logs
@app.route('/api/feedback', methods=['POST'])
def save_feedback():
    data = request.json
    print(f"[AINDRA LOG]: User Feedback Received: {data}")
    return jsonify({"status": "success", "message": "Feedback stored in Enterprise Core"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
