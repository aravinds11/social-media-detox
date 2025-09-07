from modules.clustering import predict_cluster
from modules.prediction import predict_addiction

RECOMMENDATIONS = {
    "light": [
        "Keep tracking your usage — you’re in a healthy range!",
        "Try setting daily goals to maintain balance.",
        "Use your freed-up time for hobbies or exercise."
    ],
    "moderate": [
        "Take a 15-min break every hour of screen time.",
        "Try the Pomodoro technique to stay productive.",
        "Reduce night-time scrolling by setting a bedtime reminder."
    ],
    "heavy": [
        "Start with a digital detox challenge — 1 hour without social media daily.",
        "Replace evening scrolling with a short walk or reading.",
        "Mute non-essential notifications to reduce triggers."
    ],
    "addicted": [
        "Set strict app usage limits using built-in tools.",
        "Try mindfulness or journaling to cope with urges.",
        "Consider professional guidance if usage affects daily life."
    ]
}

def recommend(user_data):
    """
    Generates detox recommendations based on clustering & addiction prediction.

    Returns
    -------
    dict with:
        cluster_label (str)
        addiction_status (str)
        probability (float)
        suggestions (list of str)
    """
    cluster_result = predict_cluster(user_data)
    prediction_result = predict_addiction(user_data)

    cluster_label = cluster_result["label"]
    addiction_status = "Addicted" if prediction_result["prediction"] == 1 else "Healthy"

    if prediction_result["prediction"] == 1:
        suggestions = RECOMMENDATIONS["addicted"]
    else:
        suggestions = RECOMMENDATIONS[cluster_label]

    return {
        "cluster_label": cluster_label,
        "addiction_status": addiction_status,
        "probability": prediction_result["probability"],
        "suggestions": suggestions
    }

if __name__ == "__main__":
    sample_user = [250, 18, 30, 45]
    result = recommend(sample_user)
    print(result)
