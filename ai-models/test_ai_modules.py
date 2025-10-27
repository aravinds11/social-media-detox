"""
Enhanced test runner for all AI modules:
- Clustering (weighted scoring)
- Prediction (addiction risk)
- Recommendation (comprehensive personalized advice)
"""

import sys
from modules.clustering import predict_cluster, get_cluster_centers, get_personalized_insights
from modules.prediction import predict_addiction
from modules.recommendation import recommend, get_summary_report


# Sample users with different usage patterns
SAMPLES = [
    ([120, 10, 15, 5], "Light User - Healthy habits"),
    ([240, 20, 30, 20], "Moderate User - Manageable usage"),
    ([400, 35, 60, 50], "Heavy User - High risk"),
    ([500, 45, 70, 90], "Extreme User - Critical intervention needed"),
]


def run_quick_test(user):
    """Run a quick classification test"""
    print(f"\n--- Testing User: {user} ---")

    # Clustering with scoring
    cluster_result = predict_cluster(user)
    print(f"Classification: {cluster_result['label'].upper()}")
    print(f"   Score: {cluster_result['score']} (Breakdown: {cluster_result['breakdown']})")

    # Prediction
    prediction_result = predict_addiction(user)
    status = "ADDICTED" if prediction_result["prediction"] == 1 else "Healthy"
    print(f"Prediction: {status} (probability={prediction_result['probability']})")

    # Basic recommendations
    recs = recommend(user)
    print(f"\nTop 3 Recommendations:")
    for i, s in enumerate(recs["suggestions"], 1):
        print(f"   {i}. {s}")

    print("\n" + "-"*60 + "\n")


def run_detailed_test(user):
    """Run a comprehensive test with full report"""
    print(f"\n{'='*70}")
    print(f"DETAILED ANALYSIS FOR USER: {user}")
    print('='*70)
    
    # Get personalized insights
    insights = get_personalized_insights(user)
    
    print(f"\nUSAGE CLASSIFICATION")
    print(f"   Category: {insights['label'].upper()}")
    print(f"   Overall Score: {insights['score']}/500")
    print(f"   Score Breakdown:")
    for feature, value in insights['breakdown'].items():
        print(f"      • {feature}: {value}")
    
    print(f"\nBEHAVIORAL INSIGHTS:")
    for insight in insights['insights']:
        print(f"   • {insight}")
    
    # Addiction prediction
    prediction = predict_addiction(user)
    risk_level = "HIGH" if prediction['probability'] > 0.7 else "MODERATE" if prediction['probability'] > 0.4 else "LOW"
    print(f"\nADDICTION RISK ASSESSMENT")
    print(f"   Status: {'ADDICTED' if prediction['prediction'] == 1 else 'HEALTHY'}")
    print(f"   Risk Level: {risk_level}")
    print(f"   Probability: {prediction['probability']*100:.1f}%")
    print(f"   Class Probabilities: Healthy={prediction['probabilities']['healthy']}, Addicted={prediction['probabilities']['addicted']}")
    
    # Comprehensive recommendations
    recs = recommend(user)
    
    print(f"\nPERSONALIZED GOALS")
    print(f"   Short-term goals:")
    for goal in recs['goals']['short_term']:
        print(f"      • {goal}")
    print(f"   Long-term goals:")
    for goal in recs['goals']['long_term'][:2]:
        print(f"      • {goal}")
    
    print(f"\nPRIMARY RECOMMENDATIONS:")
    for i, suggestion in enumerate(recs['suggestions'], 1):
        print(f"   {i}. {suggestion}")
    
    if recs['targeted_tips']:
        print(f"\nTARGETED TIPS (Problem-specific):")
        for tip in recs['targeted_tips']:
            print(f"   • {tip}")
    
    print(f"\nALTERNATIVE ACTIVITIES ({recs['reclaimable_time']} minutes available):")
    for activity in recs['alternative_activities']:
        print(f"   • {activity}")
    
    print(f"\nENCOURAGEMENT:")
    print(f"   {recs['encouragement']}")
    
    print("\n" + "="*70 + "\n")


def run_summary_report_test(user, description):
    """Run test with formatted summary report"""
    print(get_summary_report(user))


def run_all_tests(mode="quick"):
    """
    Run tests on sample users
    
    Parameters
    ----------
    mode : str
        'quick' - basic output
        'detailed' - comprehensive analysis
        'report' - formatted report
    """
    print(f"\n{'='*70}")
    print("AI-BASED SOCIAL MEDIA DETOXIFICATION - MODULE TESTING")
    print(f"{'='*70}")
    
    # Show reference cluster patterns
    print("\nREFERENCE USAGE PATTERNS:")
    print(get_cluster_centers())
    print()
    
    # Run tests based on mode
    if mode == "quick":
        print("\n--- QUICK TEST MODE ---\n")
        for user, _ in SAMPLES:
            run_quick_test(user)
    
    elif mode == "detailed":
        print("\n--- DETAILED TEST MODE ---\n")
        for user, description in SAMPLES:
            run_detailed_test(user)
    
    elif mode == "report":
        print("\n--- SUMMARY REPORT MODE ---\n")
        for user, description in SAMPLES:
            print(f"\n{'#'*70}")
            print(f"# {description}")
            print(f"# Input: {user}")
            print(f"{'#'*70}")
            run_summary_report_test(user, description)
    
    print("\nTesting completed!\n")


def run_custom_test(user_data, mode="detailed"):
    """Run test on custom user input"""
    if mode == "quick":
        run_quick_test(user_data)
    elif mode == "report":
        run_summary_report_test(user_data, "Custom User")
    else:
        run_detailed_test(user_data)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Test AI modules for social media detox app")
    parser.add_argument('--mode', choices=['quick', 'detailed', 'report'], 
                       default='quick', help='Test mode')
    parser.add_argument('--user', nargs=4, type=float, metavar=('SCREEN', 'SESSION', 'SWITCHES', 'NIGHT'),
                       help='Custom user data: screen_time session_duration app_switches night_activity')
    
    args = parser.parse_args()
    
    if args.user:
        print(f"\n{'='*70}")
        print("TESTING CUSTOM USER INPUT")
        print(f"{'='*70}")
        run_custom_test(args.user, args.mode)
    else:
        run_all_tests(args.mode)
