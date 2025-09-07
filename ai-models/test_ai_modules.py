"""
Quick test runner for all AI modules:
- Clustering
- Prediction
- Recommendation
"""

import sys
from modules.clustering import predict_cluster
from modules.prediction import predict_addiction
from modules.recommendation import recommend


# Default sample users [daily_screen_time, session_duration, app_switches, night_activity]
SAMPLES = [
    [120, 10, 15, 5],    # Light user
    [240, 20, 30, 20],   # Moderate user
    [400, 35, 60, 50],   # Heavy user
]


def run_user_test(user):
    """Run clustering, prediction, and recommendation for a single user"""
    print(f"\n--- Testing User: {user} ---")

    cluster_result = predict_cluster(user)
    print(f"Clustering → {cluster_result}")

    prediction_result = predict_addiction(user)
    status = "Addicted" if prediction_result["prediction"] == 1 else "Healthy"
    print(f"Prediction → {status} (p={prediction_result['probability']})")

    recs = recommend(user)
    print("Recommendations:")
    for s in recs["suggestions"]:
        print(f" - {s}")

    print("\n" + "-"*40 + "\n")


def run_tests():
    """Run tests on sample users"""
    print("\n🔍 Testing AI Modules...\n")
    for user in SAMPLES:
        run_user_test(user)


if __name__ == "__main__":
    if len(sys.argv) == 5:
        # User passed a custom input
        try:
            custom_user = [float(x) for x in sys.argv[1:5]]
            run_user_test(custom_user)
        except ValueError:
            print("❌ Invalid input. Please enter 4 numbers: screen_time session_duration app_switches night_activity")
    else:
        # Run with default sample users
        run_tests()
