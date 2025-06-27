import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import os

# Definir rutas absolutas seguras
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_PATH = os.path.join(BASE_DIR, 'data', 'raw', 'Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv')
OUTPUT_DIR = os.path.join(BASE_DIR, 'data', 'processed')
OUTPUT_PATH = os.path.join(OUTPUT_DIR, 'cleaned_dataset.csv')

def clean_dataset():
    print(f"📂 Cargando datos desde: {INPUT_PATH}")
    
    # Cargar el dataset original
    df = pd.read_csv(INPUT_PATH)

    # Limpiar nombres de columnas
    df.columns = df.columns.str.strip()

    print(f"📊 Dimensiones iniciales: {df.shape}")
    
    # Eliminar columnas no útiles
    cols_to_drop = ['Flow ID', 'Source IP', 'Destination IP', 'Timestamp', 'Source Port', 'Destination Port']
    df.drop(columns=[col for col in cols_to_drop if col in df.columns], inplace=True, errors='ignore')

    # Eliminar nulos e infinitos
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    # Convertir etiqueta 'Label' a binaria: 0 = BENIGN, 1 = Ataque
    df['Label'] = df['Label'].apply(lambda x: 0 if 'BENIGN' in str(x).upper() else 1)

    # Codificar columnas categóricas (si quedan)
    for col in df.select_dtypes(include=['object']).columns:
        if col != 'Label':
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))

    print(f"✅ Dimensiones finales: {df.shape}")
    print(f"🧾 Distribución de clases:\n{df['Label'].value_counts()}")

    # Crear carpeta de salida si no existe
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Guardar dataset limpio
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"💾 Dataset limpio guardado en: {OUTPUT_PATH}")

if __name__ == '__main__':
    clean_dataset()
