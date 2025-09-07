import joblib
import numpy as np
import pandas as pd
import os

# Paths to trained models
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "trained_models")
KMEANS_PATH = os.path.join(MODEL_DIR, "kmeans_usage_cluster.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "kmeans_usage_scaler.pkl")

# Load models once
kmeans = joblib.load(KMEANS_PATH)
scaler = joblib.load(SCALER_PATH)

FEATURES = ["daily_screen_time", "session_duration", "app_switches", "night_activity"]

def get_cluster_labels():
    """Assign light/moderate/heavy labels based on screen time center values."""
    centers = scaler.inverse_transform(kmeans.cluster_centers_)
    return {
        np.argmin(centers[:, 0]): "light",
        np.argsort(centers[:, 0])[1]: "moderate",
        np.argmax(centers[:, 0]): "heavy"
    }

cluster_labels = get_cluster_labels()

def predict_cluster(user_data):
    """
    Predicts usage cluster for a new user.

    Returns
    -------
    dict with:
        cluster (int): raw cluster index
        label (str): 'light', 'moderate', or 'heavy'
    """
    if len(user_data) != len(FEATURES):
        raise ValueError(f"Expected {len(FEATURES)} features: {FEATURES}, got {len(user_data)}")

    user_df = pd.DataFrame([user_data], columns=FEATURES)
    X_scaled = scaler.transform(user_df)
    cluster = int(kmeans.predict(X_scaled)[0])
    label = cluster_labels[cluster]

    return {"cluster": cluster, "label": label}

if __name__ == "__main__":
    sample_user = [250, 18, 30, 45]
    result = predict_cluster(sample_user)
    print(result)
