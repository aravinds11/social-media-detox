"""
Quick test runner for all AI modules:
- Clustering (weighted mapping)
- Prediction
- Recommendation (weighted mapping)
"""

import sys
from modules.clustering import predict_cluster, get_cluster_centers
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

    # Clustering
    cluster_result = predict_cluster(user)
    print(f"Clustering → {cluster_result}")

    # Prediction
    prediction_result = predict_addiction(user)
    status = "Addicted" if prediction_result["prediction"] == 1 else "Healthy"
    print(f"Prediction → {status} (p={prediction_result['probability']})")

    # Recommendation
    recs = recommend(user)
    print("\nRecommendations:")
    for s in recs["suggestions"]:
        print(f" - {s}")

    print("\n" + "-"*40 + "\n")


def run_tests():
    """Run tests on sample users"""
    print("\nTesting AI Modules (Weighted Mapping)...\n")

    # Show cluster centers once
    print("Cluster centers:\n", get_cluster_centers(), "\n")

    print("\nTesting AI Modules...\n")
    for user in SAMPLES:
        run_user_test(user)


if __name__ == "__main__":
    if len(sys.argv) == 5:
        try:
            custom_user = [float(x) for x in sys.argv[1:5]]
            run_user_test(custom_user)
        except ValueError:
            print("Invalid input. Please enter 4 numbers: screen_time session_duration app_switches night_activity")
    else:
        run_tests()
