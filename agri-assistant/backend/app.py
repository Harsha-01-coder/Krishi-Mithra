from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import jwt
import datetime
import requests
import os
from dotenv import load_dotenv
from config import MYSQL_CONFIG, JWT_SECRET, WEATHER_API_KEY

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# ---------------- Database ----------------
def get_db_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)

# ---------------- Auth Routes ----------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s)",
            (username, hashed_pw)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "User created successfully"}), 201
    except mysql.connector.errors.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user and bcrypt.checkpw(password.encode(), user["password"].encode()):
        token = jwt.encode(
            {"id": user["id"], "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=5)},
            JWT_SECRET,
            algorithm="HS256"
        )
        return jsonify({"token": token})
    return jsonify({"error": "Invalid credentials"}), 401

# ---------------- Helper Functions ----------------
known_cities = ["bengaluru", "mumbai", "delhi", "chennai", "kolkata"]

def detect_city(query):
    query = query.lower()
    for city in known_cities:
        if city in query:
            return city
    return None

def get_weather(city):
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
        data = requests.get(url).json()
        if "main" in data and "weather" in data:
            return {"temperature": data["main"]["temp"], "condition": data["weather"][0]["description"]}
    except Exception as e:
        print("Weather API error:", e)
    return {"temperature": None, "condition": "No data"}

def get_soil(city):
    # Placeholder for soil data
    return {"moisture": 35, "pH": 6.5}

def recommend_crops(weather, soil):
    ph = soil["pH"]
    temp = weather.get("temperature", 25)
    crops = []
    if 6 <= ph <= 7:
        crops = ["Tomato", "Cabbage", "Spinach"]
    elif 5 <= ph < 6:
        crops = ["Carrot", "Potato"]
    else:
        crops = ["Corn", "Maize"]
    crops = [c for c in crops if 20 <= temp <= 30]
    return crops

def save_query_to_db(city, query_type, query_text, weather, soil, crops):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_queries 
            (city, query_type, query_text, weather_temp, weather_condition, soil_moisture, soil_ph, recommended_crops)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            city, query_type, query_text, weather.get("temperature"),
            weather.get("condition"), soil.get("moisture"), soil.get("pH"),
            ", ".join(crops)
        ))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print("MySQL Insert Error:", e)

# ---------------- Chatbot / Gemini Integration ----------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"Loaded GEMINI_API_KEY: {GEMINI_API_KEY}")  # Debug log

GEMINI_URL = "https://gemini.googleapis.com/v1/assistant:generateMessage"

@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()
    query_text = data.get("query", "").strip()
    city = detect_city(query_text.lower())

    # -------- Agriculture Queries (Local) --------
    agri_keywords = ["weather", "soil", "crop", "crops"]
    if city and any(word in query_text.lower() for word in agri_keywords):
        weather_data = get_weather(city)
        soil_data = get_soil(city)
        crops = recommend_crops(weather_data, soil_data)
        answer = (
            f"In {city.title()}, the current weather is {weather_data['temperature']}°C, "
            f"{weather_data['condition']}. The soil has pH {soil_data['pH']} and moisture {soil_data['moisture']}%. "
            f"Recommended crops: {', '.join(crops)}."
        )
        save_query_to_db(city, "chatbot", query_text, weather_data, soil_data, crops)
        return jsonify({"answer": answer})

    # -------- Fallback to Gemini API (General Queries) --------
    if GEMINI_API_KEY:
        try:
            headers = {
                "Authorization": f"Bearer {GEMINI_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "prompt": query_text,
                "temperature": 0.7,
                "maxOutputTokens": 300
            }
            response = requests.post(GEMINI_URL, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()

            # Gemini's answer extraction
            answer = ""
            if "message" in result and "content" in result["message"]:
                content = result["message"]["content"]
                if isinstance(content, list):
                    answer = " ".join([c.get("text", "") for c in content])
                else:
                    answer = content
            else:
                answer = "I couldn't get a response from Gemini."

            # Optionally log all queries
            save_query_to_db(city or "unknown", "chatbot", query_text, {}, {}, [])

            return jsonify({"answer": answer})

        except Exception as e:
            print("Gemini API error:", e)
            return jsonify({"answer": "Error connecting to Gemini API."})
    else:
        return jsonify({"answer": "No Gemini API key configured."})

# ---------------- Run Flask ----------------
if __name__ == "__main__":
    app.run(debug=True)
