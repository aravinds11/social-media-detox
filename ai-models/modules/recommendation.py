from .clustering import predict_cluster
from .prediction import predict_addiction

# Detox recommendation rules
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

    Parameters
    ----------
    user_data : list
        [daily_screen_time, session_duration, app_switches, night_activity]

    Returns
    -------
    dict with:
        cluster_label (str): light/moderate/heavy
        addiction_status (str): healthy/addicted
        probability (float): probability of addiction
        suggestions (list of str): recommended actions
    """
    # Get cluster info
    cluster, cluster_label = predict_cluster(user_data)

    # Get addiction prediction
    prediction, probability = predict_addiction(user_data)
    addiction_status = "Addicted" if prediction == 1 else "Healthy"

    # Choose recommendations
    if prediction == 1:
        suggestions = RECOMMENDATIONS["addicted"]
    else:
        suggestions = RECOMMENDATIONS[cluster_label]

    return {
        "cluster_label": cluster_label,
        "addiction_status": addiction_status,
        "probability": round(probability, 2),
        "suggestions": suggestions
    }


# Example usage
if __name__ == "__main__":
    sample_user = [250, 18, 30, 45]
    recs = recommend(sample_user)
    print("Cluster:", recs["cluster_label"])
    print("Addiction Status:", recs["addiction_status"], f"(p={recs['probability']})")
    print("Suggestions:")
    for s in recs["suggestions"]:
        print(" -", s)
