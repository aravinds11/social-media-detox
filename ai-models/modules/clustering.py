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


def get_cluster_centers():
    """Return unscaled cluster centers with feature names (for inspection)."""
    centers = scaler.inverse_transform(kmeans.cluster_centers_)
    return pd.DataFrame(centers, columns=FEATURES)


def get_cluster_labels():
    """
    Map cluster indices to labels (light, moderate, heavy) using weighted scoring.
    Weights emphasize daily_screen_time but consider other features.
    """
    centers = scaler.inverse_transform(kmeans.cluster_centers_)

    weights = np.array([0.5, 0.2, 0.2, 0.1])  # screen time most important
    scores = centers @ weights
    return {
        np.argmin(scores): "light",
        np.argsort(scores)[1]: "moderate",
        np.argmax(scores): "heavy",
    }


def predict_cluster(user_data):
    """
    Predicts the usage cluster for a new user.

    Parameters
    ----------
    user_data : list or array
        [daily_screen_time, session_duration, app_switches, night_activity]

    Returns
    -------
    dict with:
        cluster (int) : raw cluster index
        label (str)   : 'light', 'moderate', or 'heavy'
    """
    if len(user_data) != len(FEATURES):
        raise ValueError(f"Expected {len(FEATURES)} features: {FEATURES}, got {len(user_data)}")

    user_df = pd.DataFrame([user_data], columns=FEATURES)
    X_scaled = scaler.transform(user_df)
    cluster = int(kmeans.predict(X_scaled)[0])

    cluster_labels = get_cluster_labels()
    label = cluster_labels[cluster]

    return {"cluster": cluster, "label": label}


if __name__ == "__main__":
    print("Cluster centers:\n", get_cluster_centers(), "\n")

    sample_user = [250, 18, 30, 45]
    print("Weighted mapping →", predict_cluster(sample_user))
