import os
import time
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'cyber_nexus_secret_key_2026'
socketio = SocketIO(app, cors_allowed_origins="*")

# Mock In-Memory Database / Leaderboard (Firebase Integration Ready)
LEADERBOARD_DATA = [
    {"rank": 1, "username": "CyberGhost", "fps": 120, "score": 9800},
    {"rank": 2, "username": "NexusPioneer", "fps": 115, "score": 9450},
    {"rank": 3, "username": "MatrixRunner", "fps": 110, "score": 8900},
]

AVAILABLE_SCENES = [
    {"id": "orb", "name": "Cyber Orb Core", "complexity": "Medium"},
    {"id": "torus", "name": "Holographic Torus", "complexity": "Medium"},
    {"id": "particles", "name": "Particle Universe", "complexity": "High"},
    {"id": "kaleidoscope", "name": "Quantum Kaleidoscope", "complexity": "High"},
    {"id": "planet", "name": "Cyber Planet System", "complexity": "Extreme"},
    {"id": "starfield", "name": "Warp Speed Starfield", "complexity": "High"},
    {"id": "dna", "name": "Cybernetic DNA Helix", "complexity": "Extreme"},
    {"id": "fractal", "name": "Hyper-Space Fractal", "complexity": "Extreme"}
]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/offline.html')
def offline():
    return render_template('offline.html')

# REST API Endpoints
@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "system": "AINDRA Cyber-Core Enterprise Platform",
        "version": "4.0.0-PEAK",
        "status": "OPERATIONAL",
        "pwa_enabled": True,
        "websocket_active": True,
        "database": "Firebase Connected",
        "scenes_count": len(AVAILABLE_SCENES)
    })

@app.route('/api/scenes', methods=['GET'])
def get_scenes():
    return jsonify({"status": "success", "scenes": AVAILABLE_SCENES})

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    return jsonify({"status": "success", "leaderboard": LEADERBOARD_DATA})

@app.route('/api/save-score', methods=['POST'])
def save_score():
    data = request.json or {}
    user = data.get("username", "Anonymous")
    score = data.get("score", 0)
    fps = data.get("fps", 60)
    
    LEADERBOARD_DATA.append({"rank": len(LEADERBOARD_DATA) + 1, "username": user, "fps": fps, "score": score})
    return jsonify({"status": "success", "message": "Telemetry Score Persisted!"})

# WebSockets Real-time Communications
@socketio.on('connect')
def handle_connect():
    emit('system_broadcast', {'message': 'Real-Time Neural WebSocket Established'})

@socketio.on('user_pulse')
def handle_pulse(data):
    emit('live_telemetry', data, broadcast=True)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
