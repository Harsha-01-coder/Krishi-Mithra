from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import jwt
import datetime
import requests
from config import MYSQL_CONFIG, JWT_SECRET, WEATHER_API_KEY

app = Flask(__name__)
CORS(app)

# ---------------- Database ----------------


def get_db_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)

# ---------------- Auth ----------------


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
            "INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_pw))
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
            {"id": user["id"], "exp": datetime.datetime.utcnow() +
             datetime.timedelta(hours=5)},
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
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    data = requests.get(url).json()
    if "main" in data and "weather" in data:
        return {"temperature": data["main"]["temp"], "condition": data["weather"][0]["description"]}
    return {"temperature": None, "condition": "No data"}


def get_soil(city):
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
            city,
            query_type,
            query_text,
            weather.get("temperature"),
            weather.get("condition"),
            soil.get("moisture"),
            soil.get("pH"),
            ", ".join(crops)
        ))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print("MySQL Insert Error:", e)

# ---------------- API Endpoints ----------------


@app.route("/weather")
def weather():
    city = request.args.get("city")
    if not city:
        return jsonify({"error": "City is required"}), 400
    weather_data = get_weather(city)
    soil_data = get_soil(city)
    crops = recommend_crops(weather_data, soil_data)
    save_query_to_db(
        city, "weather", f"Weather for {city}", weather_data, soil_data, crops)
    return jsonify({"city": city, "weather": weather_data, "soil": soil_data, "recommended_crops": crops})


@app.route("/soil", methods=["POST"])
def soil():
    data = request.get_json()
    city = detect_city(data.get("city", "")) or "unknown"
    moisture = float(data.get("moisture", 35))
    ph = float(data.get("pH", 6.5))
    soil_data = {"moisture": moisture, "pH": ph}
    weather_data = get_weather(city)
    crops = recommend_crops(weather_data, soil_data)
    save_query_to_db(
        city, "soil", f"Soil data for {city}", weather_data, soil_data, crops)
    return jsonify({"moisture": moisture, "pH": ph, "recommended_crops": crops})


@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()
    query_text = data.get("query", "").lower()
    city = detect_city(query_text)

    # Handle greetings
    greetings = ["hello", "hi", "hey", "good morning",
                 "good afternoon", "good evening"]
    if any(greet in query_text for greet in greetings):
        return jsonify({"answer": "Hello! 🌱 I am your Agri Assistant bot. You can ask me about crops, soil, or weather in your city."})

    # Handle agriculture queries
    if "weather" in query_text or "soil" in query_text or "crop" in query_text:
        if city:
            weather_data = get_weather(city)
            soil_data = get_soil(city)
            crops = recommend_crops(weather_data, soil_data)
            answer = (
                f"In {city.title()}, the current weather is {weather_data['temperature']}°C, "
                f"{weather_data['condition']}. The soil has pH {soil_data['pH']} and moisture {soil_data['moisture']}%. "
                f"Recommended crops: {', '.join(crops)}."
            )
            save_query_to_db(city, "chatbot", query_text,
                             weather_data, soil_data, crops)
            return jsonify({"answer": answer})
        else:
            return jsonify({"answer": "I could not detect the city. Please mention the city name to get accurate weather and crop info."})

    # Fallback for general conversation
    return jsonify({"answer": "I'm here to help with agriculture queries! 🌾 Ask me about crops, soil, or weather in your city."})


# ---------------- Run Flask ----------------
if __name__ == "__main__":
    app.run(debug=True)
