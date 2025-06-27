import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from werkzeug.utils import secure_filename

BASE_DIR       = os.path.dirname(os.path.abspath(__file__))
RAW_DATA_DIR   = os.path.join(BASE_DIR, 'data', 'raw')
MODELS_DIR     = os.path.join(BASE_DIR, 'models')

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = RAW_DATA_DIR
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# ── In‐memory store ─────────────────────────────────────────────────────────────
latest_samples = []
MAX_SAMPLES    = 50

# ── Conjuntos de bloqueos ─────────────────────────────────────────────────────
blocked_ips   = set()
blocked_ports = set()

# ── Métricas precargadas ──────────────────────────────────────────────────────
from train_models import get_metrics_list
model_metrics = get_metrics_list()

def allowed_file(fn):
    return '.' in fn and fn.rsplit('.',1)[1].lower() == 'csv'

# ── Endpoints básicos ──────────────────────────────────────────────────────────
@app.route('/')
def index():
    return "SOC Inteligente Backend ✅"

# -----------------------------
# Recepción de tráfico
# -----------------------------
@app.route('/api/traffic', methods=['POST'])
def receive_traffic():
    data = request.get_json()
    if not data:
        return jsonify(error="No data"), 400

    ip   = data.get('ip_origen')
    port = data.get('puerto_origen')

    # Filtrar bloqueados
    if ip in blocked_ips:
        return jsonify(error=f"IP {ip} bloqueada"), 403
    if port in blocked_ports:
        return jsonify(error=f"Puerto {port} bloqueado"), 403

    latest_samples.append(data)
    if len(latest_samples) > MAX_SAMPLES:
        latest_samples.pop(0)

    socketio.emit('nuevo_trafico', data)
    return jsonify(status="ok"), 200

@app.route('/api/traffic', methods=['GET'])
def get_traffic():
    return jsonify(latest_samples), 200

# -----------------------------
# Métricas de los modelos
# -----------------------------
@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    return jsonify(model_metrics), 200

# -----------------------------
# Upload CSV / retrain
# -----------------------------
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify(error="No file"), 400
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify(error="Invalid file"), 400

    fname = secure_filename(file.filename)
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], fname)
    file.save(save_path)

    try:
        from clean_data import clean_dataset
        clean_dataset()
        from train_models import train_and_save_models, get_metrics_list
        train_and_save_models()
        global model_metrics
        model_metrics = get_metrics_list()
        return jsonify(message="Reentrenamiento completo"), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

# -----------------------------
# Endpoints de bloqueo
# -----------------------------
@app.route('/api/actions/block-ip', methods=['POST'])
def block_ip():
    payload = request.get_json()
    ip = payload.get('ip')
    if not ip:
        return jsonify(error="Falta campo 'ip'"), 400
    blocked_ips.add(ip)
    return jsonify(message=f"IP {ip} bloqueada"), 200

@app.route('/api/actions/block-port', methods=['POST'])
def block_port():
    payload = request.get_json()
    port = payload.get('port')
    if port is None:
        return jsonify(error="Falta campo 'port'"), 400
    blocked_ports.add(int(port))
    return jsonify(message=f"Puerto {port} bloqueado"), 200

# -----------------------------
# Endpoints de desbloqueo
# -----------------------------
@app.route('/api/actions/unblock-ip', methods=['POST'])
def unblock_ip():
    payload = request.get_json()
    ip = payload.get('ip')
    if not ip:
        return jsonify(error="Falta campo 'ip'"), 400
    if ip in blocked_ips:
        blocked_ips.remove(ip)
        return jsonify(message=f"IP {ip} desbloqueada"), 200
    else:
        return jsonify(error=f"La IP {ip} no estaba bloqueada"), 400

@app.route('/api/actions/unblock-port', methods=['POST'])
def unblock_port():
    payload = request.get_json()
    port = payload.get('port')
    if port is None:
        return jsonify(error="Falta campo 'port'"), 400
    port = int(port)
    if port in blocked_ports:
        blocked_ports.remove(port)
        return jsonify(message=f"Puerto {port} desbloqueado"), 200
    else:
        return jsonify(error=f"El puerto {port} no estaba bloqueado"), 400

# -----------------------------
# Endpoints para consultar bloqueos
# -----------------------------
@app.route('/api/actions/blocked-ips', methods=['GET'])
def get_blocked_ips():
    return jsonify(sorted(list(blocked_ips))), 200

@app.route('/api/actions/blocked-ports', methods=['GET'])
def get_blocked_ports():
    return jsonify(sorted(list(blocked_ports))), 200

# -----------------------------
# Debug WS
# -----------------------------
@socketio.on('connect')
def on_connect():
    print("Cliente WS conectado")

@socketio.on('disconnect')
def on_disconnect():
    print("Cliente WS desconectado")

if __name__=='__main__':
    port = int(os.getenv("PORT", 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
