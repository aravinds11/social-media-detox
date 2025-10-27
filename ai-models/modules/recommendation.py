from modules.clustering import predict_cluster, get_personalized_insights, FEATURES
from modules.prediction import predict_addiction
import numpy as np

# Base recommendations by usage level
BASE_RECOMMENDATIONS = {
    "light": [
        "Keep tracking your usage - you're in a healthy range!",
        "Try setting daily goals to maintain balance.",
        "Use your freed-up time for hobbies or exercise.",
        "Share your healthy habits with friends to inspire them."
    ],
    "moderate": [
        "Take a 15-min break every hour of screen time.",
        "Try the Pomodoro technique to stay productive.",
        "Reduce night-time scrolling by setting a bedtime reminder.",
        "Replace one social media session with a real-world activity."
    ],
    "heavy": [
        "Start with a digital detox challenge - 1 hour without social media daily.",
        "Replace evening scrolling with a short walk or reading.",
        "Mute non-essential notifications to reduce triggers.",
        "Set app timers to gradually reduce daily usage by 20%."
    ],
    "addicted": [
        "Set strict app usage limits using built-in tools.",
        "Try mindfulness or journaling to cope with urges.",
        "Consider professional guidance if usage affects daily life.",
        "Remove social media apps from your home screen.",
        "Identify triggers (boredom, stress) and find healthier alternatives."
    ]
}

# Feature-specific targeted recommendations
TARGETED_RECOMMENDATIONS = {
    "daily_screen_time": {
        "high": [
            "Challenge yourself: reduce screen time by 10% this week.",
            "Use grayscale mode to make your phone less appealing.",
            "Schedule 'phone-free' hours during your day."
        ],
        "moderate": [
            "Track which apps consume most time and set limits.",
            "Use the 20-20-20 rule: every 20 min, look 20 ft away for 20 sec."
        ]
    },
    "session_duration": {
        "high": [
            "Long sessions detected: Set a 30-minute usage timer.",
            "After each session, do a 5-minute stretching routine.",
            "Use app blockers to enforce automatic breaks."
        ],
        "moderate": [
            "Take micro-breaks between scrolling sessions.",
            "Stand up and move after every 20 minutes of use."
        ]
    },
    "app_switches": {
        "high": [
            "High app switching indicates distraction. Try single-tasking.",
            "Disable notification badges to reduce switching temptation.",
            "Use focus mode to limit available apps during work/study."
        ],
        "moderate": [
            "Group similar tasks to reduce context switching.",
            "Schedule specific times for checking different apps."
        ]
    },
    "night_activity": {
        "high": [
            "Night usage is harming your sleep. Set a firm digital curfew.",
            "Enable blue light filter 2 hours before bedtime.",
            "Try a bedtime routine without screens: read a book instead.",
            "Place your phone outside the bedroom while sleeping."
        ],
        "moderate": [
            "Reduce screen brightness in the evening.",
            "Use bedtime mode to limit app access after 10 PM.",
            "Try meditation or journaling before bed instead of scrolling."
        ]
    }
}

# Positive reinforcement messages
ENCOURAGEMENT = {
    "light": [
        "Great job maintaining healthy digital habits!",
        "You're setting a great example for balanced technology use!",
        "Keep up the excellent work - your digital wellness is on track!"
    ],
    "moderate": [
        "You're making progress! Small changes lead to big results.",
        "Every step toward balance counts. Keep it up!",
        "You're on the right path to digital wellness!"
    ],
    "heavy": [
        "Taking control starts now. You can do this!",
        "Change is challenging but you're stronger than the habit.",
        "Remember: every hour you reclaim is an hour back to yourself."
    ],
    "addicted": [
        "Seeking help is a sign of strength, not weakness.",
        "Recovery is a journey, not a destination. Be patient with yourself.",
        "You deserve a life free from digital dependency."
    ]
}


def is_valid_user_data(user_data):
    """
    Check if user data is valid and meaningful.
    
    Returns
    -------
    tuple: (is_valid, issue_description)
    """
    # Check for all zeros
    if all(val == 0 for val in user_data):
        return False, "zero_usage"
    
    # Check for negative values
    if any(val < 0 for val in user_data):
        return False, "negative_values"
    
    # Check for unrealistic values (screen time > 24 hours, etc.)
    if user_data[0] > 1440:  # More than 24 hours
        return False, "unrealistic_screen_time"
    
    # Check if night activity exceeds total screen time
    if user_data[3] > user_data[0]:
        return False, "invalid_night_activity"
    
    return True, None


def get_targeted_suggestions(user_data, cluster_label):
    """
    Generate feature-specific recommendations based on individual metrics.
    
    Parameters
    ----------
    user_data : list
        [daily_screen_time, session_duration, app_switches, night_activity]
    cluster_label : str
        Overall usage classification
    
    Returns
    -------
    list : Targeted recommendations addressing specific problem areas
    """
    suggestions = []
    seen_suggestions = set()  # Prevent duplicates
    
    # Define thresholds for each feature
    thresholds = {
        "daily_screen_time": {"moderate": 180, "high": 300},
        "session_duration": {"moderate": 25, "high": 35},
        "app_switches": {"moderate": 35, "high": 50},
        "night_activity": {"moderate": 30, "high": 60}
    }
    
    # Check each feature and add targeted recommendations
    for i, (feature, value) in enumerate(zip(FEATURES, user_data)):
        if value >= thresholds[feature]["high"]:
            for suggestion in TARGETED_RECOMMENDATIONS[feature]["high"][:2]:
                if suggestion not in seen_suggestions:
                    suggestions.append(suggestion)
                    seen_suggestions.add(suggestion)
        elif value >= thresholds[feature]["moderate"]:
            for suggestion in TARGETED_RECOMMENDATIONS[feature]["moderate"][:1]:
                if suggestion not in seen_suggestions:
                    suggestions.append(suggestion)
                    seen_suggestions.add(suggestion)
    
    return suggestions


def get_progressive_goals(user_data, cluster_label):
    """
    Generate achievable, progressive goals based on current usage.
    
    Returns
    -------
    dict : Short-term and long-term goals
    """
    screen_time = user_data[0]
    night_activity = user_data[3]
    
    # Handle edge case: very low or zero usage
    if screen_time < 30:
        return {
            "short_term": [
                "Continue maintaining minimal screen time usage",
                "Stay mindful of potential future increases in usage",
                "Encourage healthy habits in others"
            ],
            "long_term": [
                "Maintain your excellent digital wellness habits",
                "Help others develop healthier relationships with technology",
                "Continue prioritizing real-world activities"
            ]
        }
    
    # Calculate reduction targets (10-20% reduction is sustainable)
    if cluster_label == "heavy":
        reduction_pct = 0.15
    elif cluster_label == "moderate":
        reduction_pct = 0.10
    else:
        reduction_pct = 0.05
    
    target_screen_time = max(60, int(screen_time * (1 - reduction_pct)))  # Minimum 60 min goal
    target_night_activity = max(15, int(night_activity * 0.5))  # Aim for 50% reduction or 15 min max
    
    return {
        "short_term": [
            f"Reduce daily screen time to {target_screen_time} minutes (currently {int(screen_time)} min)",
            f"Limit nighttime usage to {target_night_activity} minutes (currently {int(night_activity)} min)",
            "Complete 3 days without exceeding your screen time goal"
        ],
        "long_term": [
            f"Maintain screen time under {int(target_screen_time * 0.9)} minutes for 2 weeks",
            "Build a consistent 'digital sunset' routine 1 hour before bed",
            "Replace one hour of daily screen time with a hobby or exercise"
        ]
    }


def get_alternative_activities(cluster_label, time_available):
    """
    Suggest healthy alternatives based on reclaimed time.
    
    Parameters
    ----------
    cluster_label : str
        Usage classification
    time_available : int
        Estimated minutes user could reclaim
    
    Returns
    -------
    list : Activity suggestions tailored to available time
    """
    activities = {
        "5-15": [
            "Practice deep breathing exercises",
            "Do a quick stretching routine",
            "Drink water and take a mindful walk around your space",
            "Listen to a favorite song and dance"
        ],
        "15-30": [
            "Go for a short walk outside",
            "Read a chapter of a book",
            "Practice a musical instrument",
            "Call a friend or family member",
            "Try a guided meditation"
        ],
        "30-60": [
            "Exercise or go for a run",
            "Cook a healthy meal",
            "Work on a creative project",
            "Learn something new with an online course",
            "Play a board game with family"
        ],
        "60+": [
            "Visit a museum or library",
            "Join a sports activity or class",
            "Volunteer in your community",
            "Start a new hobby (painting, gardening, etc.)",
            "Spend quality time with loved ones"
        ]
    }
    
    if time_available < 15:
        return activities["5-15"]
    elif time_available < 30:
        return activities["15-30"]
    elif time_available < 60:
        return activities["30-60"]
    else:
        return activities["60+"]


def recommend(user_data):
    """
    Generates comprehensive detox recommendations using weighted scoring
    and personalized insights.
    
    Parameters
    ----------
    user_data : list
        [daily_screen_time, session_duration, app_switches, night_activity]
    
    Returns
    -------
    dict with recommendations or error information
    """
    # Validate input
    is_valid, issue = is_valid_user_data(user_data)
    
    if not is_valid:
        if issue == "zero_usage":
            return {
                "error": True,
                "message": "No usage data detected. Please use the app to collect usage statistics.",
                "suggestion": "Start tracking your social media usage for personalized recommendations."
            }
        elif issue == "negative_values":
            return {
                "error": True,
                "message": "Invalid data: negative values detected.",
                "suggestion": "Please ensure all usage values are non-negative."
            }
        elif issue == "unrealistic_screen_time":
            return {
                "error": True,
                "message": "Invalid data: screen time exceeds 24 hours.",
                "suggestion": "Please check your input data for errors."
            }
        elif issue == "invalid_night_activity":
            return {
                "error": True,
                "message": "Invalid data: night activity cannot exceed total screen time.",
                "suggestion": "Please verify your usage data."
            }
    
    # Get clustering and prediction results
    cluster_result = get_personalized_insights(user_data)
    prediction_result = predict_addiction(user_data)
    
    cluster_label = cluster_result["label"]
    addiction_status = "Addicted" if prediction_result["prediction"] == 1 else "Healthy"
    
    # Determine primary recommendations
    if prediction_result["prediction"] == 1:
        primary_suggestions = BASE_RECOMMENDATIONS["addicted"][:3]
        recommendation_category = "addicted"
    else:
        primary_suggestions = BASE_RECOMMENDATIONS[cluster_label][:3]
        recommendation_category = cluster_label
    
    # Get targeted suggestions for specific problem areas
    targeted_tips = get_targeted_suggestions(user_data, cluster_label)
    
    # Generate progressive goals
    goals = get_progressive_goals(user_data, cluster_label)
    
    # Estimate time that could be reclaimed (for heavy/addicted users)
    if cluster_label in ["heavy", "moderate"] or prediction_result["prediction"] == 1:
        reclaimable_time = max(15, int(user_data[0] * 0.15))  # 15% reduction target, min 15 min
    else:
        reclaimable_time = 30  # Default for light users
    
    alternative_activities = get_alternative_activities(cluster_label, reclaimable_time)
    
    # Select encouragement message
    encouragement = np.random.choice(ENCOURAGEMENT[recommendation_category])
    
    return {
        "error": False,
        "cluster_label": cluster_label,
        "addiction_status": addiction_status,
        "probability": prediction_result["probability"],
        "usage_score": cluster_result["score"],
        "score_breakdown": cluster_result["breakdown"],
        "suggestions": primary_suggestions,
        "targeted_tips": targeted_tips[:3],  # Limit to top 3
        "goals": goals,
        "alternative_activities": alternative_activities[:4],  # Limit to 4
        "encouragement": encouragement,
        "insights": cluster_result["insights"],
        "reclaimable_time": reclaimable_time
    }


def get_summary_report(user_data):
    """
    Generate a comprehensive summary report for display in the app.
    
    Returns
    -------
    str : Formatted text summary
    """
    rec = recommend(user_data)
    
    # Handle error cases
    if rec.get("error"):
        return f"""
+--------------------------------------------------------------+
|         DIGITAL WELLNESS ASSESSMENT REPORT                   |
+--------------------------------------------------------------+

WARNING: {rec['message']}

TIP: {rec['suggestion']}

--------------------------------------------------------------
"""
    
    report = f"""
+--------------------------------------------------------------+
|         DIGITAL WELLNESS ASSESSMENT REPORT                   |
+--------------------------------------------------------------+

USAGE CLASSIFICATION: {rec['cluster_label'].upper()}
   Overall Score: {rec['usage_score']}/500
   Status: {rec['addiction_status']} (Risk: {rec['probability']*100:.0f}%)

PERSONALIZED INSIGHTS:
"""
    for insight in rec['insights']:
        report += f"   - {insight}\n"
    
    report += f"\nYOUR GOALS:\n"
    report += "   Short-term:\n"
    for goal in rec['goals']['short_term']:
        report += f"   - {goal}\n"
    
    report += f"\nTOP RECOMMENDATIONS:\n"
    for i, suggestion in enumerate(rec['suggestions'], 1):
        report += f"   {i}. {suggestion}\n"
    
    if rec['targeted_tips']:
        report += f"\nTARGETED TIPS:\n"
        for tip in rec['targeted_tips']:
            report += f"   - {tip}\n"
    
    report += f"\nALTERNATIVE ACTIVITIES ({rec['reclaimable_time']} min available):\n"
    for activity in rec['alternative_activities']:
        report += f"   - {activity}\n"
    
    report += f"\nENCOURAGEMENT:\n"
    report += f"   {rec['encouragement']}\n"
    report += "-" * 62 + "\n"
    
    return report


if __name__ == "__main__":
    # Test with different user profiles
    test_users = [
        ([120, 10, 15, 5], "Light User"),
        ([240, 20, 30, 20], "Moderate User"),
        ([400, 35, 60, 50], "Heavy User"),
        ([0, 0, 0, 0], "Edge Case: Zero Usage"),
    ]
    
    for user_data, description in test_users:
        print(f"\n{'='*62}")
        print(f"Testing: {description} - {user_data}")
        print('='*62)
        print(get_summary_report(user_data))
