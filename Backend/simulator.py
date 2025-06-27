import pandas as pd
import requests
import time
import random
import joblib
from datetime import datetime
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Configuración ──────────────────────────────────────────────────────────────
CLEANED_CSV   = os.path.join(BASE_DIR, 'data', 'processed', 'cleaned_dataset.csv')
RAW_CSV       = os.path.join(BASE_DIR, 'data', 'raw', 'Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv')
SCALER_PATH   = os.path.join(BASE_DIR, 'models', 'scaler.joblib')
API_ENDPOINT  = 'http://localhost:5000/api/traffic'

# ── Carga de datasets y modelos ────────────────────────────────────────────────
print("📂 Cargando datasets y modelos...")

clean_df = pd.read_csv(CLEANED_CSV)
clean_df.columns = clean_df.columns.str.strip()

raw_df = pd.read_csv(RAW_CSV)
raw_df.columns = raw_df.columns.str.strip()

# Columnas de metadatos y etiqueta
meta_cols = {'Flow ID','Source IP','Destination IP','Source Port','Destination Port','Timestamp'}
label_col = {'Label'}

# Features para el scaler
feature_cols = [c for c in clean_df.columns if c not in meta_cols.union(label_col)]

scaler = joblib.load(SCALER_PATH)
MODELS = {
    'Logistic Regression': joblib.load(os.path.join(BASE_DIR, 'models', 'logistic_regression.joblib')),
    'Decision Tree':       joblib.load(os.path.join(BASE_DIR, 'models', 'decision_tree.joblib')),
    'Random Forest':       joblib.load(os.path.join(BASE_DIR, 'models', 'random_forest.joblib')),
    'KNN':                 joblib.load(os.path.join(BASE_DIR, 'models', 'knn.joblib')),
    'SVM':                 joblib.load(os.path.join(BASE_DIR, 'models', 'svm.joblib')),
}

print(f"✅ clean_df: {clean_df.shape[0]} filas, features: {len(feature_cols)} columnas")
print(f"✅ raw_df:   {raw_df.shape[0]} filas, modelos: {list(MODELS.keys())}")

# ── Función de simulación ──────────────────────────────────────────────────────
def simulate_traffic(interval: float = 1.0):
    while True:
        # 1) Elegir índice aleatorio (coincide clean_df y raw_df)
        idx = clean_df.sample(n=1).index[0]
        clean_row = clean_df.loc[idx]
        raw_row   = raw_df.loc[idx]

        # 2) Preparar y escalar features
        X  = clean_row[feature_cols].values.reshape(1, -1)
        Xs = scaler.transform(X)

        # 3) Predecir con un modelo al azar
        model_name, model = random.choice(list(MODELS.items()))
        pred = model.predict(Xs)[0]

        # 4) Armado del payload
        payload = {
            'timestamp':           datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'ip_origen':           str(raw_row['Source IP']),
            'ip_destino':          str(raw_row['Destination IP']),
            'puerto_origen':       int(raw_row['Source Port']),
            'puerto_destino':      int(raw_row['Destination Port']),
            'protocolo':           str(raw_row['Protocol']),
            'packets':             int(raw_row['Total Fwd Packets']) + int(raw_row['Total Backward Packets']),
            'bytes':               int(raw_row['Total Length of Fwd Packets']) + int(raw_row['Total Length of Bwd Packets']),
            'clasificacion':       'Maligno' if pred == 1 else 'Benigno',
            'modelo':              model_name,
            # ←–– Datos numéricos adicionales desde clean_df
            'flow_duration':       float(clean_row['Flow Duration']),
            'total_fwd_packets':   int(clean_row['Total Fwd Packets']),
            'total_bwd_packets':   int(clean_row['Total Backward Packets']),
            'packet_length_mean':  float(clean_row['Packet Length Mean'])
        }

        # 5) Envío al backend
        try:
            resp = requests.post(API_ENDPOINT, json=payload)
            status = resp.status_code
        except Exception as e:
            print("❌ Error al enviar:", e)
            status = None

        print(f"📤 [{payload['timestamp']}] {payload['clasificacion']} vía {model_name} → status: {status}")

        # 6) Pausa
        time.sleep(interval)

# ── Entry point ─────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    simulate_traffic()
