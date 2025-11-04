from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import jwt
import datetime
import requests
import os
from dotenv import load_dotenv
import google.generativeai as genai
from datetime import datetime
from urllib.parse import urlencode
from PIL import Image  # <-- Import for Pest ID
import io               # <-- Import for Pest ID

from config import MYSQL_CONFIG, JWT_SECRET

# Load environment variables from .env
load_dotenv() 

# --- SAFE API KEY LOADING ---
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")

app = Flask(__name__)
CORS(app)

# ---------------- Database ----------------
def get_db_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)

# ---------------- Auth Routes ----------------
@app.route("/signup", methods=["POST"])
def signup():
    # ... (code for signup) ...
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_pw))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "User created successfully"}), 201
    except mysql.connector.errors.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409

@app.route("/login", methods=["POST"])
def login():
    # ... (code for login) ...
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
            {"id": user["id"], "exp": datetime.utcnow() + datetime.timedelta(hours=5)},
            JWT_SECRET,
            algorithm="HS256"
        )
        return jsonify({"token": token})
    return jsonify({"error": "Invalid credentials"}), 401

# ---------------- Chatbot / Gemini Integration ----------------
try:
    if not GEMINI_API_KEY:
        print("Error: GEMINI_API_KEY not found. Check your .env file.")
        model = None
    else:
        genai.configure(api_key=GEMINI_API_KEY)
        generation_config = { "temperature": 0.5, "max_output_tokens": 1024 }
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash", # Use the stable model
            generation_config=generation_config,
        )
        print("Gemini model (gemini-2.0-flash) configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini: {e}")
    model = None

# ---------------- Helper Functions ----------------
@app.route("/chatbot", methods=["POST"])
def chatbot():
    # ... (code for chatbot) ...
    data = request.get_json()
    query_text = data.get("query", "").strip()
    if model:
        try:
            response = model.generate_content(query_text)
            return jsonify({"answer": response.text})
        except Exception as e:
            return jsonify({"answer": f"Error from Gemini: {e}"})
    return jsonify({"answer": "Chatbot model not configured."})

@app.route("/contact", methods=["POST"])
def contact():
    # ... (code for contact) ...
    data = request.get_json()
    print(f"📩 New contact message from {data.get('name')}")
    return jsonify({"message": "Message received!"})

# ---------------- Soil Analysis Route ----------------
@app.route("/analyze-fertility", methods=["POST"])
def analyze_soil_fertility():
    # ... (code for soil analysis) ...
    data = request.get_json()
    try:
        n, p, k, ph = float(data["n"]), float(data["p"]), float(data["k"]), float(data["ph"])
        location = data["location"]
        weather_data = get_weather(location)
        levels, recommendations = analyze_fertility(n, p, k, ph)
        return jsonify({
            "location": location,
            "weather": weather_data,
            "levels": levels,
            "recommendations": recommendations
        })
    except Exception as e:
        return jsonify({"error": f"Error in /analyze-fertility: {e}"}), 500

def analyze_fertility(n, p, k, ph):
    # ... (helper function for soil) ...
    levels, recommendations = {}, []
    if ph < 5.5: levels["ph_level"] = "Acidic"; recommendations.append("Apply lime.")
    else: levels["ph_level"] = "Neutral"
    if n < 100: levels["n_level"] = "Low"; recommendations.append("Apply Nitrogen fertilizer.")
    else: levels["n_level"] = "Medium"
    if p < 20: levels["p_level"] = "Low"; recommendations.append("Apply Phosphorus fertilizer.")
    else: levels["p_level"] = "Medium"
    if k < 100: levels["k_level"] = "Low"; recommendations.append("Apply Potassium fertilizer.")
    else: levels["k_level"] = "Medium"
    return levels, recommendations

# ---------------- Weather Functions ----------------
def get_weather(city):
    # ... (helper function for weather) ...
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
        data = requests.get(url).json()
        if data["cod"] != 200:
             return {"error": data.get("message", "City not found")}
        return {
            "temperature": data["main"]["temp"],
            "condition": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"] * 3.6,
            "city_name": data["name"]
        }
    except Exception as e:
        print("Weather API error:", e)
        return {"error": "Weather API error"}

def get_5_day_forecast(city):
    # ... (helper function for forecast) ...
    try:
        url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={WEATHER_API_KEY}&units=metric"
        data = requests.get(url).json()
        if data["cod"] != "200":
            return {"error": data.get("message", "Forecast not found")}
        daily_forecasts = {}
        for entry in data["list"]:
            date = datetime.fromtimestamp(entry["dt"]).strftime('%Y-%m-%d')
            if date not in daily_forecasts:
                daily_forecasts[date] = {
                    "day_name": datetime.fromtimestamp(entry["dt"]).strftime('%A'),
                    "min_temp": entry["main"]["temp_min"],
                    "max_temp": entry["main"]["temp_max"],
                    "conditions": [entry["weather"][0]["description"]],
                    "icon": entry["weather"][0]["icon"]
                }
            else:
                daily_forecasts[date]["min_temp"] = min(daily_forecasts[date]["min_temp"], entry["main"]["temp_min"])
                daily_forecasts[date]["max_temp"] = max(daily_forecasts[date]["max_temp"], entry["main"]["temp_max"])
                daily_forecasts[date]["conditions"].append(entry["weather"][0]["description"])
        final_forecast = []
        for date_key in sorted(daily_forecasts.keys())[:5]:
            day_data = daily_forecasts[date_key]
            most_common_condition = max(set(day_data["conditions"]), key=day_data["conditions"].count)
            final_forecast.append({
                "day": day_data["day_name"],
                "date": date_key,
                "min_temp": round(day_data["min_temp"]),
                "max_temp": round(day_data["max_temp"]),
                "condition": most_common_condition.title(),
                "icon": day_data["icon"]
            })
        return final_forecast
    except Exception as e:
        print("Forecast API error:", e)
        return {"error": "Forecast API error"}

def get_agri_advice(current_weather, forecast, city):
    # ... (helper function for AI advice) ...
    if not model:
        return "Gemini AI model is not configured. Cannot generate advice."
    try:
        prompt = (
            f"You are an expert agricultural advisor for India. A farmer in {city} needs advice.\n"
            f"Current weather: {current_weather['condition']}, {current_weather['temperature']}°C, {current_weather['humidity']}% humidity.\n"
            f"5-day forecast:\n"
        )
        for day in forecast:
            prompt += f"- {day['day']}: Max {day['max_temp']}°C, Min {day['min_temp']}°C, {day['condition']}\n"
        prompt += "\nBased ONLY on this weather, provide 3-5 concise bullet points of agricultural advice (irrigation, protection, livestock)."
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini advice error: {e}")
        return "Error generating advice."

@app.route("/weather", methods=["GET"])
def weather_route():
    # ... (code for weather route) ...
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "City parameter is required"}), 400
    current_weather = get_weather(city)
    if "error" in current_weather:
        return jsonify(current_weather), 404
    forecast = get_5_day_forecast(city)
    if "error" in forecast:
        return jsonify(forecast), 500
    advice = get_agri_advice(current_weather, forecast, city)
    return jsonify({
        "current": current_weather,
        "forecast": forecast,
        "advice": advice
    })

# ---------------- Fertilizer Calculator ----------------
def get_fertilizer_recommendation(n, p, k, crop):
    # ... (helper function for fertilizer) ...
    CROP_DATA = {
        "rice": {"N": 120, "P": 60, "K": 60},
        "wheat": {"N": 150, "P": 60, "K": 40},
        "maize": {"N": 180, "P": 80, "K": 50},
        "sugarcane": {"N": 250, "P": 80, "K": 120},
        "cotton": {"N": 160, "P": 70, "K": 80},
        "potato": {"N": 180, "P": 100, "K": 120}
    }
    FERTILIZER_DATA = {
        "urea": {"N": 0.46, "P": 0, "K": 0},
        "dap": {"N": 0.18, "P": 0.46, "K": 0},
        "mop": {"N": 0, "P": 0, "K": 0.60}
    }
    target_crop = CROP_DATA.get(crop.lower())
    if not target_crop:
        return {"error": "Crop not found in our database."}
    
    n_gap = max(0, target_crop["N"] - n)
    p_gap = max(0, target_crop["P"] - p)
    k_gap = max(0, target_crop["K"] - k)
    
    kg_mop = k_gap / FERTILIZER_DATA["mop"]["K"] if k_gap > 0 else 0
    kg_dap = p_gap / FERTILIZER_DATA["dap"]["P"] if p_gap > 0 else 0
    n_from_dap = kg_dap * FERTILIZER_DATA["dap"]["N"]
    n_still_needed = max(0, n_gap - n_from_dap)
    kg_urea = n_still_needed / FERTILIZER_DATA["urea"]["N"] if n_still_needed > 0 else 0
    
    return {
        "urea_kg": round(kg_urea, 2),
        "dap_kg": round(kg_dap, 2),
        "mop_kg": round(kg_mop, 2),
        "recommendations": [
            f"For {crop.title()}, you need to add {n_gap} kg/ha N, {p_gap} kg/ha P, and {k_gap} kg/ha K.",
            "Apply in split doses as per local guidelines."
        ]
    }

@app.route("/calculate-fertilizer", methods=["POST"])
def calculate_fertilizer():
    # ... (code for fertilizer route) ...
    data = request.get_json()
    try:
        n = float(data.get("n"))
        p = float(data.get("p"))
        k = float(data.get("k"))
        crop = data.get("crop")
        if not all([data.get("n"), data.get("p"), data.get("k"), crop]):
            return jsonify({"error": "Missing N, P, K, or crop."}), 400
        result = get_fertilizer_recommendation(n, p, k, crop)
        if "error" in result:
             return jsonify(result), 404
        return jsonify(result)
    except Exception as e:
        print(f"Error in /calculate-fertilizer: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

# ---------------- Market Prices Route ----------------
@app.route("/market-prices", methods=["GET"])
def get_market_prices():
    # ... (code for market prices route) ...
    if not DATA_GOV_API_KEY:
        return jsonify({"error": "Market data API key not configured."}), 500
    API_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
    base_url = "https://api.data.gov.in/resource/" + API_RESOURCE_ID
    params = {
        "api-key": DATA_GOV_API_KEY, "format": "json", "offset": 0, "limit": 20,
        "sort[arrival_date]": "desc"
    }
    state = request.args.get('state')
    commodity = request.args.get('commodity')
    if state: params["filters[state]"] = state
    if commodity: params["filters[commodity]"] = commodity

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        processed_records = []
        for record in data.get("records", []):
            processed_records.append({
                "commodity": record.get("commodity"),
                "state": record.get("state"),
                "market": record.get("market"),
                "price": record.get("modal_price"),
                "date": record.get("arrival_date")
            })
        return jsonify(processed_records)
    except requests.exceptions.RequestException as e:
        print(f"data.gov.in API error: {e}")
        return jsonify({"error": "Failed to fetch market data."}), 502
    except Exception as e:
        print(f"Error processing market data: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

# ---------------- Pest & Disease Identification Route (UPGRADED) ----------------
# --- THIS IS THE CORRECTLY INDENTED FUNCTION ---
@app.route("/identify-pest", methods=["POST"])
def identify_pest():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400
        
    image_file = request.files['image']
    crop = request.form.get("crop")
    symptoms = request.form.get("symptoms")

    if not crop:
        return jsonify({"error": "Crop type is required."}), 400
        
    if not model:
        return jsonify({"error": "AI model is not configured. Check API key."}), 500

    try:
        img = Image.open(image_file.stream)
        
        prompt = (
            f"You are an expert plant pathologist in India. "
            f"A farmer uploaded this image of their '{crop}' crop. "
            f"Farmer's notes: '{symptoms}'.\n\n"
            f"1. Start with 'Namaskar Kisan Bhai,' and identify the disease in the image. "
            f"Explain the visual clues. Keep this under 150 words.\n\n"
            f"2. Write '---TREATMENT---' on its own line.\n\n"
            f"3. After the separator, start with 'Namaskar Kisan Bhai,' again and provide a detailed "
            f"treatment plan (Organic, Chemical, and Prevention sections)."
        )

        response = model.generate_content([prompt, img])
        full_text = response.text
        
        if "---TREATMENT---" in full_text:
            parts = full_text.split("---TREATMENT---", 1)
            identification = parts[0].strip()
            treatment = parts[1].strip()
        else:
            identification = full_text
            treatment = "AI did not provide a separate treatment section. The full response is above."

        return jsonify({
            "identification": identification,
            "treatment": treatment
        })
    
    except Exception as e:
        print(f"Gemini AI error in /identify-pest: {e}")
        return jsonify({"error": f"AI generation error: {e}"}), 500
        
        # --- Add this new import at the top ---
from functools import wraps

# --- Add this helper function (decorator) right after your Auth Routes ---

def token_required(f):
    """
    A decorator to protect routes that require a logged-in user.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check if 'Authorization' header is present
        if 'Authorization' in request.headers:
            # Get token from 'Bearer <token>'
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            # Decode the token
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            # Find the user
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE id=%s", (data['id'],))
            current_user = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if not current_user:
                return jsonify({'error': 'User not found.'}), 404
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid!'}), 401

        # Pass the logged-in user to the route
        return f(current_user, *args, **kwargs)

    return decorated


# --- Add these NEW ROUTES for the dashboard ---

@app.route("/get-profile", methods=["GET"])
@token_required
def get_profile(current_user):
    """
    Gets the logged-in user's profile data.
    """
    # current_user is passed by the @token_required decorator
    return jsonify({
        "username": current_user['username'],
        "full_name": current_user['full_name'],
        "default_location": current_user['default_location']
    })

@app.route("/update-profile", methods=["POST"])
@token_required
def update_profile(current_user):
    """
    Updates the user's location or name.
    """
    data = request.get_json()
    new_location = data.get("location")
    
    if not new_location:
         return jsonify({"error": "Location is required."}), 400
         
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET default_location = %s WHERE id = %s",
            (new_location, current_user['id'])
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Profile updated successfully!"})
    except Exception as e:
        print(f"Profile update error: {e}")
        return jsonify({"error": "Database error."}), 500

@app.route("/get-dashboard-news", methods=["GET"])
@token_required
def get_dashboard_news(current_user):
    """
    Uses Gemini AI to get personalized news.
    """
    location = current_user.get("default_location")
    if not location:
        return jsonify({"error": "User location not set."}), 400
        
    if not model:
        return jsonify({"error": "AI model not configured."}), 500
        
    try:
        prompt = (
            f"You are a helpful agricultural news assistant. "
            f"Provide 3 recent, one-sentence news headlines for farmers in or near {location}, India. "
            f"Focus on crops, weather alerts, or new schemes relevant to that region. "
            f"Format as a simple list with bullet points (* Headline 1...)."
        )
        response = model.generate_content(prompt)
        
        return jsonify({"news_headlines": response.text})
    except Exception as e:
        print(f"Gemini news error: {e}")
        return jsonify({"error": "AI error generating news."}), 500
    
# ---------------- Run Flask ----------------
if __name__ == "__main__":
    app.run(debug=True)