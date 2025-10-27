import joblib
import os
import pandas as pd
import numpy as np

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
        note (str, optional): warning for edge cases
    """
    if len(user_data) != len(FEATURES):
        raise ValueError(f"Expected {len(FEATURES)} features: {FEATURES}, got {len(user_data)}")

    # Edge case handling
    result = {}
    
    # Check for zero usage
    if all(val == 0 for val in user_data):
        result["note"] = "No usage detected - prediction may not be meaningful"
        result["prediction"] = 0
        result["probability"] = 0.0
        result["probabilities"] = {"healthy": 1.0, "addicted": 0.0}
        return result
    
    # Check for very low usage (likely healthy)
    if user_data[0] < 30:  # Less than 30 minutes daily
        result["note"] = "Very low usage detected - likely healthy"
        result["prediction"] = 0
        result["probability"] = 0.0
        result["probabilities"] = {"healthy": 1.0, "addicted": 0.0}
        return result
    
    # Check for negative values
    if any(val < 0 for val in user_data):
        raise ValueError("Negative values not allowed in user data")
    
    # Check for unrealistic values
    if user_data[0] > 1440:  # More than 24 hours
        result["note"] = "Unrealistic screen time detected (>24 hours)"
    
    if user_data[3] > user_data[0]:  # Night activity exceeds total screen time
        result["note"] = "Invalid data: night activity exceeds total screen time"
    
    # Normal prediction
    user_df = pd.DataFrame([user_data], columns=FEATURES)
    
    try:
        prediction = int(model.predict(user_df)[0])
        probs = model.predict_proba(user_df)[0]
        
        result.update({
            "prediction": prediction,
            "probability": round(float(probs[1]), 2),
            "probabilities": {
                "healthy": round(float(probs[0]), 2), 
                "addicted": round(float(probs[1]), 2)
            }
        })
    except Exception as e:
        # Fallback if model prediction fails
        result.update({
            "prediction": 0,
            "probability": 0.0,
            "probabilities": {"healthy": 1.0, "addicted": 0.0},
            "note": f"Prediction failed: {str(e)}"
        })
    
    return result

if __name__ == "__main__":
    # Test various cases
    test_cases = [
        ([250, 18, 30, 45], "Normal usage"),
        ([0, 0, 0, 0], "Zero usage"),
        ([15, 5, 3, 2], "Very low usage"),
        ([500, 45, 80, 120], "Extreme usage"),
    ]
    
    for user_data, description in test_cases:
        print(f"\n{description}: {user_data}")
        result = predict_addiction(user_data)
        print(result)
        if "note" in result:
            print(f"Note: {result['note']}")