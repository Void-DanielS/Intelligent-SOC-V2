import pandas as pd
import os
import joblib
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DATA_PATH   = os.path.join(BASE_DIR, 'data', 'processed', 'cleaned_dataset.csv')
MODELS_DIR  = os.path.join(BASE_DIR, 'models')
METRICS_JSON= os.path.join(MODELS_DIR, 'metrics.json')

def train_and_save_models():
    # Carga
    df = pd.read_csv(DATA_PATH)
    X = df.drop('Label', axis=1);  y = df['Label']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2,
                                                        stratify=y, random_state=42)

    # Escalado
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.joblib'))

    models = {
      'logistic_regression': LogisticRegression(max_iter=1000),
      'decision_tree': DecisionTreeClassifier(),
      'random_forest': RandomForestClassifier(n_estimators=100),
      'knn': KNeighborsClassifier(),
      'svm': SVC(probability=True)
    }

    metrics_list = []
    for name, model in models.items():
        model.fit(X_train_s, y_train)
        y_pred = model.predict(X_test_s)
        acc  = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec  = recall_score(y_test, y_pred)
        f1   = f1_score(y_test, y_pred)

        joblib.dump(model, os.path.join(MODELS_DIR, f"{name}.joblib"))

        metrics_list.append({
          "modelName": name,
          "accuracy": acc,
          "precision": prec,
          "recall": rec,
          "f1Score": f1
        })

    # Salvar métricas a JSON
    with open(METRICS_JSON, 'w') as f:
        json.dump(metrics_list, f, indent=2)

    print(f"✅ Entrenamiento completo. Métricas guardadas en {METRICS_JSON}")
    return metrics_list

def get_metrics_list():
    # Si el JSON existe, léelo; si no, entrena y crea el JSON
    if os.path.exists(METRICS_JSON):
        with open(METRICS_JSON) as f:
            return json.load(f)
    else:
        return train_and_save_models()

if __name__ == '__main__':
    train_and_save_models()
