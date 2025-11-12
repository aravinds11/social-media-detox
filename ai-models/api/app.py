from flask import Flask, jsonify, request
from flask_cors import CORS
import sys, os, traceback

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from modules.clustering import predict_cluster, get_personalized_insights
from modules.prediction import predict_addiction
from modules.recommendation import recommend, get_summary_report

app = Flask(__name__)
CORS(app)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "AI Models Flask API running"})

@app.route("/analyze", methods=["POST"])
def analyze_user():
    """
    Endpoint to run full AI pipeline:
    - Cluster classification
    - Addiction prediction
    - Recommendations
    """
    try:
        data = request.get_json(force=True)
        user_data = data.get("usage")

        if not user_data or len(user_data) != 4:
            return jsonify({
                "error": True,
                "message": "usage must be a list of 4 values: [screen_time, session_duration, app_switches, night_activity]"
            }), 400

        cluster = predict_cluster(user_data)
        prediction = predict_addiction(user_data)
        recs = recommend(user_data)

        return jsonify({
            "error": False,
            "cluster": cluster,
            "prediction": prediction,
            "recommendations": recs
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": True, "message": str(e)}), 500


@app.route("/summary", methods=["POST"])
def summary():
    """Return formatted summary report (text-based)"""
    try:
        data = request.get_json(force=True)
        user_data = data.get("usage")
        if not user_data:
            return jsonify({"error": True, "message": "usage data required"}), 400

        report = get_summary_report(user_data)
        return jsonify({"report": report})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": True, "message": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
