import joblib
import os
import numpy as np


# Load Saved Model
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "trained_models")
MODEL_PATH = os.path.join(MODEL_DIR, "rf_addiction_pipeline.pkl")

# Load pipeline (Scaler + Random Forest)
model = joblib.load(MODEL_PATH)

# -------------------------
# Prediction Function
# -------------------------
def predict_addiction(user_data):
    """
    Predicts addiction risk for a new user.

    Parameters
    ----------
    user_data : list or array
        Example: [daily_screen_time, session_duration, app_switches, night_activity]

    Returns
    -------
    prediction (int) : 0 = healthy, 1 = addicted
    probability (float) : probability of being addicted
    """
    # Ensure input shape
    user_array = np.array(user_data).reshape(1, -1)

    # Predict label & probability
    prediction = model.predict(user_array)[0]
    probability = model.predict_proba(user_array)[0][1]  # probability of class 1

    return prediction, probability

# Example Usage
if __name__ == "__main__":
    sample_user = [250, 18, 30, 45]  # Example usage stats
    pred, prob = predict_addiction(sample_user)
    status = "Addicted" if pred == 1 else "Healthy"
    print(f"Prediction: {status}, Probability: {prob:.2f}")
