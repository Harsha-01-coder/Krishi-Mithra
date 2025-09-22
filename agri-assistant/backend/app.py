from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import joblib
import numpy as np
from utils.soil_analysis import analyze_soil

app = Flask(__name__)
CORS(app)

# Load crop recommendation model
crop_model = joblib.load("model/crop_model.pkl")

# Weather API key (you can use OpenWeatherMap)
WEATHER_API_KEY = "YOUR_API_KEY"


@app.route("/weather", methods=["GET"])
def get_weather():
    city = request.args.get("city")
    days = request.args.get("days", 3)
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&cnt={int(days)*8}&appid={WEATHER_API_KEY}&units=metric"
    response = requests.get(url).json()
    forecast = [{"date": item["dt_txt"], "temp": item["main"]["temp"],
                 "weather": item["weather"][0]["description"]} for item in response["list"]]
    return jsonify(forecast)


@app.route("/soil", methods=["POST"])
def soil_check():
    data = request.json
    # data = {"moisture": xx, "pH": xx, "nitrogen": xx, "phosphorus": xx, "potassium": xx}
    crop = analyze_soil(data, crop_model)
    return jsonify({"recommended_crop": crop})


if __name__ == "__main__":
    app.run(debug=True)
