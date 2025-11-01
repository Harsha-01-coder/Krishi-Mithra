from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import jwt
import datetime
import requests
import os
from dotenv import load_dotenv
import google.generativeai as genai # <-- 1. Import the new library

# Removed WEATHER_API_KEY from config import
from config import MYSQL_CONFIG, JWT_SECRET

# Load environment variables from .env
load_dotenv() 

# Added your API key directly
WEATHER_API_KEY = "27603af9c613c33eb8ee606d7202da60"

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
    # Placeholder for soil data (now overridden by /soil route)
    return {"moisture": 35, "pH": 6.5}

def recommend_crops(weather, soil):
    ph = soil["pH"]
    temp = weather.get("temperature", 25)
    crops = []
    
    # Simple recommendation logic
    if 6 <= ph <= 7.5:
        if 25 <= temp <= 35:
            crops.extend(["Rice", "Sugarcane", "Cotton"])
        elif 20 <= temp < 25:
            crops.extend(["Maize", "Groundnut"])
        else:
            crops.extend(["Wheat", "Barley"])
    elif 5.5 <= ph < 6:
        if 20 <= temp <= 30:
            crops.extend(["Potato", "Soybean", "Sunflower"])
        else:
            crops.extend(["Oats", "Rye"])
    else:
        crops = ["Acid-tolerant varieties"] # General fallback

    # Filter out empty strings if any
    crops = [c for c in crops if c]
    
    if not crops:
        crops = ["No specific crops recommended for these extreme conditions."]

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
# 1. ADDED YOUR GEMINI KEY DIRECTLY
GEMINI_API_KEY = "AIzaSyC4UtPtkt6HcUd1pwQal6OP08DbBzc_yeo"
print(f"Loaded GEMINI_API_KEY: {GEMINI_API_KEY is not None}")  # Debug log

# 2. Configure the Google AI client
try:
    genai.configure(api_key=GEMINI_API_KEY)
    # Set up the model
    generation_config = {
        "temperature": 0.7,
        "max_output_tokens": 300,
    }
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash", # <-- 1. REVERTED TO THIS MODEL
        generation_config=generation_config,
    )
    print("Gemini model (gemini-2.5-flash) configured successfully.") # <-- 2. Updated log
except Exception as e:
    print(f"Error configuring Gemini: {e}")
    model = None


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
    if model:
        try:
            # 3. Call the API using the new library
            response = model.generate_content(query_text)
            
            # 4. Extract the text
            answer = response.text

            save_query_to_db(city or "unknown", "chatbot", query_text, {}, {}, [])
            return jsonify({"answer": answer})

        except Exception as e:
            print(f"Gemini API general error: {e}")
            return jsonify({"answer": "Error connecting to Gemini API."})
    else:
        return jsonify({"answer": "Gemini model is not configured. Check API key."})

# ---------------- Soil Analysis Route ----------------
@app.route("/soil", methods=["POST"])
def soil_analysis():
    data = request.get_json()
    city = data.get("city")
    moisture = data.get("moisture")
    ph = data.get("pH")

    # Basic validation
    if not city or moisture is None or ph is None:
        return jsonify({"error": "Missing city, moisture, or pH"}), 400

    try:
        # Use the soil data from the React component
        soil_data = {"moisture": float(moisture), "pH": float(ph)}
        
        # Get weather for the city
        weather_data = get_weather(city)
        
        # Get recommendations
        crops = recommend_crops(weather_data, soil_data)
        
        # Save this query to your database
        save_query_to_db(
            city, 
            "soil_sensor", 
            f"Moisture: {moisture}%, pH: {ph}", 
            weather_data, 
            soil_data, 
            crops
        )
        
        # Return the data React is expecting
        return jsonify({"recommended_crops": crops})

    except Exception as e:
        print(f"Error in /soil route: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

# ---------------- Weather Route ----------------
@app.route("/weather", methods=["GET"])
def weather_route():
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "City parameter is required"}), 400

    try:
        weather_data = get_weather(city)
        
        # Return a 404 if OpenWeatherMap couldn't find the city
        if weather_data.get("temperature") is None:
            return jsonify({"error": f"Weather data not found for city: {city}"}), 404

        # Use placeholder soil data to get crop recommendations
        soil_data = get_soil(city) 
        crops = recommend_crops(weather_data, soil_data)
        
        # Return the combined data
        return jsonify({
            "weather": weather_data,
            "recommended_crops": crops
        })
    except Exception as e:
        print(f"Error in /weather route: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500


# ---------------- Run Flask ----------------
if __name__ == "__main__":
    app.run(debug=True)

