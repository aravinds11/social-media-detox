import numpy as np
import pandas as pd

FEATURES = ["daily_screen_time", "session_duration", "app_switches", "night_activity"]

# Feature weights (emphasize screen time, consider others)
WEIGHTS = np.array([0.5, 0.2, 0.2, 0.1])

# Thresholds based on research and initial cluster analysis
# These can be tuned based on user feedback and medical guidelines
THRESHOLDS = {
    "light_to_moderate": 150,    # ~2.5 hours daily screen time weighted
    "moderate_to_heavy": 250,    # ~4+ hours daily screen time weighted
}


def calculate_usage_score(user_data):
    """
    Calculate weighted usage score for a user.
    
    Parameters
    ----------
    user_data : list or array
        [daily_screen_time, session_duration, app_switches, night_activity]
    
    Returns
    -------
    float : Weighted usage score
    """
    if len(user_data) != len(FEATURES):
        raise ValueError(f"Expected {len(FEATURES)} features: {FEATURES}, got {len(user_data)}")
    
    return np.dot(user_data, WEIGHTS)


def predict_cluster(user_data):
    """
    Classifies user into usage categories using weighted scoring.
    
    This approach is transparent, interpretable, and aligns with the
    app's goal of helping users understand their digital habits.
    
    Parameters
    ----------
    user_data : list or array
        [daily_screen_time, session_duration, app_switches, night_activity]
    
    Returns
    -------
    dict with:
        cluster (int) : cluster index (0=light, 1=moderate, 2=heavy)
        label (str)   : 'light', 'moderate', or 'heavy'
        score (float) : weighted usage score (for transparency)
        breakdown (dict) : contribution of each feature
    """
    if len(user_data) != len(FEATURES):
        raise ValueError(f"Expected {len(FEATURES)} features: {FEATURES}, got {len(user_data)}")
    
    score = calculate_usage_score(user_data)
    
    # Classify based on thresholds
    if score < THRESHOLDS["light_to_moderate"]:
        cluster = 0
        label = "light"
    elif score < THRESHOLDS["moderate_to_heavy"]:
        cluster = 1
        label = "moderate"
    else:
        cluster = 2
        label = "heavy"
    
    # Provide breakdown for transparency (useful for UI)
    breakdown = {
        feature: round(value * weight, 2)
        for feature, value, weight in zip(FEATURES, user_data, WEIGHTS)
    }
    
    return {
        "cluster": cluster,
        "label": label,
        "score": round(score, 2),
        "breakdown": breakdown
    }


def get_cluster_centers():
    """
    Return reference usage patterns for each cluster.
    These are based on typical user behaviors and medical guidelines.
    """
    reference_patterns = {
        "light": [120, 15, 20, 10],      # ~2 hours, healthy usage
        "moderate": [240, 25, 35, 30],    # ~4 hours, manageable
        "heavy": [420, 40, 60, 80],       # ~7 hours, concerning
    }
    
    df = pd.DataFrame.from_dict(reference_patterns, orient='index', columns=FEATURES)
    df['weighted_score'] = df.apply(lambda row: calculate_usage_score(row.values), axis=1)
    
    return df


def get_personalized_insights(user_data):
    """
    Provide actionable insights based on user's specific usage pattern.
    
    Returns
    -------
    dict with personalized messages about each feature
    """
    result = predict_cluster(user_data)
    insights = []
    
    # Screen time insight
    if user_data[0] > 300:
        insights.append(f"Your daily screen time ({user_data[0]} min) is quite high. Consider setting a daily limit.")
    elif user_data[0] > 180:
        insights.append(f"Your screen time ({user_data[0]} min) is moderate. Try reducing by 30 min/day.")
    else:
        insights.append(f"Your screen time ({user_data[0]} min) is in a healthy range!")
    
    # Session duration insight
    if user_data[1] > 30:
        insights.append(f"Long sessions ({user_data[1]} min) can lead to fatigue. Take breaks every 25-30 minutes.")
    
    # App switches insight
    if user_data[2] > 50:
        insights.append(f"High app switching ({user_data[2]}/day) may indicate distraction. Try focused time blocks.")
    
    # Night activity insight
    if user_data[3] > 60:
        insights.append(f"Night usage ({user_data[3]} min) can affect sleep. Set a 'digital sunset' 1 hour before bed.")
    elif user_data[3] > 30:
        insights.append(f"Consider reducing nighttime usage ({user_data[3]} min) for better sleep quality.")
    
    return {
        **result,
        "insights": insights
    }


if __name__ == "__main__":
    print("Reference Cluster Patterns:\n", get_cluster_centers(), "\n")
    
    # Test cases
    test_users = [
        [120, 10, 15, 5],    # Light user
        [240, 20, 30, 20],   # Moderate user
        [400, 35, 60, 50],   # Heavy user
    ]
    
    for user in test_users:
        print(f"\n--- User: {user} ---")
        result = get_personalized_insights(user)
        print(f"Classification: {result['label']} (score: {result['score']})")
        print(f"Score Breakdown: {result['breakdown']}")
        print("\nPersonalized Insights:")
        for insight in result['insights']:
            print(f"  • {insight}")