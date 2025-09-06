import joblib
import numpy as np
import os


# Load Saved Models
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "trained_models")
KMEANS_PATH = os.path.join(MODEL_DIR, "kmeans_usage_cluster.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "kmeans_usage_scaler.pkl")

# Load once at import
kmeans = joblib.load(KMEANS_PATH)
scaler = joblib.load(SCALER_PATH)


# Map Clusters to Usage Groups
def get_cluster_labels():
    """Assign light/moderate/heavy labels based on screen time center values."""
    centers = scaler.inverse_transform(kmeans.cluster_centers_)
    return {
        np.argmin(centers[:, 0]): "light",      # lowest daily_screen_time
        np.argsort(centers[:, 0])[1]: "moderate",
        np.argmax(centers[:, 0]): "heavy"
    }

cluster_labels = get_cluster_labels()

# Prediction Function
def predict_cluster(user_data):
    """
    Predicts the usage cluster for a new user.

    Parameters
    ----------
    user_data : list or array
        Example: [daily_screen_time, session_duration, app_switches, night_activity]

    Returns
    -------
    cluster (int) : raw cluster index
    label (str)   : 'light', 'moderate', or 'heavy'
    """
    X_scaled = scaler.transform([user_data])
    cluster = kmeans.predict(X_scaled)[0]
    label = cluster_labels[cluster]
    return cluster, label


# Example Usage
if __name__ == "__main__":
    sample_user = [250, 18, 30, 45]  # Example usage stats
    cluster, label = predict_cluster(sample_user)
    print(f"Predicted cluster: {cluster}, Usage group: {label}")
