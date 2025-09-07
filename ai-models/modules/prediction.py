import joblib
import os
import pandas as pd

# Path to trained model
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "trained_models")
MODEL_PATH = os.path.join(MODEL_DIR, "rf_addiction_pipeline.pkl")

model = joblib.load(MODEL_PATH)

FEATURES = ["daily_screen_time", "session_duration", "app_switches", "night_activity"]

def predict_addiction(user_data):
    """
    Predicts addiction risk for a new user.

    Returns
    -------
    dict with:
        prediction (int): 0 = healthy, 1 = addicted
        probability (float): probability of addiction
        probabilities (dict): class-wise probabilities
    """
    if len(user_data) != len(FEATURES):
        raise ValueError(f"Expected {len(FEATURES)} features: {FEATURES}, got {len(user_data)}")

    user_df = pd.DataFrame([user_data], columns=FEATURES)

    prediction = int(model.predict(user_df)[0])
    probs = model.predict_proba(user_df)[0]

    return {
        "prediction": prediction,
        "probability": round(float(probs[1]), 2),
        "probabilities": {"healthy": round(float(probs[0]), 2), "addicted": round(float(probs[1]), 2)}
    }

if __name__ == "__main__":
    sample_user = [250, 18, 30, 45]
    result = predict_addiction(sample_user)
    print(result)
