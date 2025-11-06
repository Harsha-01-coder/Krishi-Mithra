import os
import io
import jwt
import bcrypt
import requests
import pymongo
from PIL import Image
from functools import wraps
from dotenv import load_dotenv
from urllib.parse import urlencode
import google.generativeai as genai
from bson.objectid import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timedelta, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_caching import Cache # 1. Import Cache

# Import your MongoDB URI and JWT Secret
from config import MONGO_URI, JWT_SECRET 

# Load environment variables from .env
load_dotenv() 

# --- SAFE API KEY LOADING ---
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")

app = Flask(__name__)

# --- 2. Configure Cache ---
app.config["CACHE_TYPE"] = "SimpleCache"  # In-memory cache
app.config["CACHE_DEFAULT_TIMEOUT"] = 900 # Default cache: 15 minutes
cache = Cache(app)
# --- End Cache Config ---

# --- 3. Configure CORS ---
# Explicitly allow your React app
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}})


# ---------------- Database (MongoDB) ----------------
try:
    client = pymongo.MongoClient(MONGO_URI)
    client.server_info() # Force connection check
    db = client.krishimitra_db # Your database name
    print("✅ MongoDB connection successful.")
except pymongo.errors.ConnectionFailure as e:
    print(f"❌ Error: Could not connect to MongoDB. {e}")
    db = None

if db is not None:
    try:
        # Ensure 'username' is unique for the 'users' collection
        db.users.create_index("username", unique=True)
        print("✅ Username index ensured.")
        # Create indexes for posts for faster sorting
        db.posts.create_index([("createdAt", pymongo.DESCENDING)])
        db.posts.create_index([("author_id", pymongo.ASCENDING)])
        print("✅ Post indexes ensured.")
    except Exception as e:
        print(f"⚠️ Error creating indexes: {e}")

# ---------------- Auth Routes (MongoDB Version) ----------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
        
    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    
    if db is None: return jsonify({"error": "Database not connected"}), 500
        
    try:
        user_data = {
            "username": username,
            "password": hashed_pw,
            "full_name": None, # Set defaults
            "default_location": None
        }
        db.users.insert_one(user_data)
        return jsonify({"message": "User created successfully"}), 201
        
    except pymongo.errors.DuplicateKeyError:
        return jsonify({"error": "Username already exists"}), 409
    except Exception as e:
        return jsonify({"error": f"An error occurred: {e}"}), 500

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    
    if db is None: return jsonify({"error": "Database not connected"}), 500

    user = db.users.find_one({"username": username})

    if user and bcrypt.checkpw(password.encode(), user["password"]):
        token = jwt.encode(
            {
                "id": str(user["_id"]), # Convert ObjectId to string for JWT
                "exp": datetime.now(timezone.utc) + timedelta(hours=5)
            },
            JWT_SECRET,
            algorithm="HS256"
        )
        return jsonify({"token": token})
        
    return jsonify({"error": "Invalid credentials"}), 401

# --- Auth Helper (MongoDB Version) ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
            
        if db is None:
             return jsonify({"error": "Database not connected"}), 500

        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            try:
                user_id = ObjectId(data['id'])
            except InvalidId:
                return jsonify({'error': 'Token contains an invalid user ID.'}), 401
                
            current_user = db.users.find_one({"_id": user_id})
            
            if not current_user:
                return jsonify({'error': 'User not found.'}), 404
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

# ---------------- Chatbot / Gemini Integration ----------------
try:
    if not GEMINI_API_KEY:
        print("⚠️ Error: GEMINI_API_KEY not found. Check your .env file.")
        model = None
    else:
        genai.configure(api_key=GEMINI_API_KEY)
        generation_config = { "temperature": 0.5, "max_output_tokens": 1024 }
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash", # Use a stable model name
            generation_config=generation_config,
        )
        print("✅ Gemini model (gemini-2.0-flash) configured successfully.")
except Exception as e:
    print(f"❌ Error configuring Gemini: {e}")
    model = None

# ---------------- User Profile Routes (MongoDB Version) ----------------
@app.route("/get-profile", methods=["GET"])
@token_required
def get_profile(current_user):
    return jsonify({
        "username": current_user.get('username'),
        "full_name": current_user.get('full_name'),
        "default_location": current_user.get('default_location')
    })

@app.route("/update-profile", methods=["POST"])
@token_required
def update_profile(current_user):
    data = request.get_json()
    new_location = data.get("location")
    new_name = data.get("fullName") # From Profile.jsx
    
    if not new_location and not new_name:
         return jsonify({"error": "No data provided."}), 400
         
    if db is None: return jsonify({"error": "Database not connected"}), 500
         
    try:
        update_fields = {}
        if new_location:
            update_fields["default_location"] = new_location
        if new_name:
            update_fields["full_name"] = new_name
            
        db.users.update_one(
            {"_id": current_user['_id']},
            {"$set": update_fields}
        )
        # Clear the dashboard cache for this user since location/name changed
        cache.delete_memoized(get_dashboard_data, current_user)
        return jsonify({"message": "Profile updated successfully!"})
    except Exception as e:
        print(f"Profile update error: {e}")
        return jsonify({"error": "Database error."}), 500

# ---------------- Caching Helper Functions (for Speed) ----------------

@cache.memoize(timeout=900) # Cache for 15 minutes
def get_weather(city):
    """ Fetches current weather. Results are cached. """
    if not WEATHER_API_KEY: return {"error": "Weather API key not set"}
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
        data = requests.get(url).json()
        if data["cod"] != 200:
             return {"error": data.get("message", "City not found")}
        # --- FIX: Added 'icon' ---
        return {
            "temperature": data["main"]["temp"], 
            "condition": data["weather"][0]["description"].title(),
            "humidity": data["main"]["humidity"], 
            "wind_speed": data["wind"]["speed"] * 3.6,
            "city_name": data["name"],
            "icon": data["weather"][0]["icon"]
        }
    except Exception as e:
        print("Weather API error:", e)
        return {"error": "Weather API error"}

@cache.memoize(timeout=900) # Cache for 15 minutes
def get_5_day_forecast(city):
    """ Fetches 5-day forecast. Results are cached. """
    if not WEATHER_API_KEY: return {"error": "Weather API key not set"}
    try:
        url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={WEATHER_API_KEY}&units=metric"
        data = requests.get(url).json()
        if data["cod"] != "200":
            return {"error": data.get("message", "Forecast not found")}
        daily_forecasts = {}
        for entry in data["list"]:
            date_str = datetime.fromtimestamp(entry["dt"]).strftime('%Y-%m-%d')
            if date_str not in daily_forecasts:
                daily_forecasts[date_str] = {
                    "day_name": datetime.fromtimestamp(entry["dt"]).strftime('%A'),
                    "min_temp": entry["main"]["temp_min"], "max_temp": entry["main"]["temp_max"],
                    "conditions": [entry["weather"][0]["description"]], "icon": entry["weather"][0]["icon"]
                }
            else:
                daily_forecasts[date_str]["min_temp"] = min(daily_forecasts[date_str]["min_temp"], entry["main"]["temp_min"])
                daily_forecasts[date_str]["max_temp"] = max(daily_forecasts[date_str]["max_temp"], entry["main"]["temp_max"])
                daily_forecasts[date_str]["conditions"].append(entry["weather"][0]["description"])
        
        final_forecast = []
        for date_key in sorted(daily_forecasts.keys())[:5]: # Get up to 5 days
            day_data = daily_forecasts[date_key]
            most_common_condition = max(set(day_data["conditions"]), key=day_data["conditions"].count)
            final_forecast.append({
                "day": day_data["day_name"], "date": date_key,
                "min_temp": round(day_data["min_temp"]), "max_temp": round(day_data["max_temp"]),
                "condition": most_common_condition.title(), "icon": day_data["icon"]
            })
        return final_forecast
    except Exception as e:
        print("Forecast API error:", e)
        return {"error": "Forecast API error"}

@cache.memoize(timeout=1800) # Cache for 30 minutes
def get_agri_advice(current_weather_tuple, forecast_tuple, city):
    """ Generates AI advice. Must pass tuples as args for caching. """
    current_weather = dict(current_weather_tuple)
    forecast = [dict(day) for day in forecast_tuple]

    if not model: return "Gemini AI model is not configured."
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

@cache.memoize(timeout=3600) # Cache news for 1 hour
def get_ai_news(location):
    """ Generates AI news. Results are cached. """
    if not model: return "AI model not configured."
    try:
        prompt = (
            f"Provide 3 recent, one-sentence news headlines for farmers in or near {location}, India. "
            f"Focus on crops, weather alerts, or new schemes. "
            f"Format as a simple list with * at the start of each line."
        )
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Dashboard Gemini News Error: {e}")
        return "Could not load news."

# ---------------- Main Dashboard Route ----------------
@app.route("/dashboard-data", methods=["GET"])
@token_required
@cache.memoize(timeout=300) # Cache the *entire* dashboard response for 5 min
def get_dashboard_data(current_user):
    """ Aggregates all data. This is now SUPER FAST. """
    location = current_user.get("default_location")
    user_data = {
        "full_name": current_user.get("full_name"),
        "username": current_user.get("username"),
        "location": location
    }

    if not location:
        return jsonify({
            "user": user_data,
            "error": "User location not set. Please update your profile."
        }), 200 # Send 200 so frontend can display the user's name

    weather_data = None
    try:
        current_weather = get_weather(location)
        if "error" not in current_weather:
            forecast = get_5_day_forecast(location)
            if "error" not in forecast:
                # Convert to tuples to use the advice cache
                current_weather_tuple = tuple(sorted(current_weather.items()))
                forecast_tuple = tuple(tuple(sorted(day.items())) for day in forecast)
                
                advice = get_agri_advice(current_weather_tuple, forecast_tuple, location)
                weather_data = {
                    "current": current_weather,
                    "forecast": forecast,
                    "advice": advice
                }
    except Exception as e:
        print(f"Dashboard Weather/Advice Error: {e}")

    news_data = get_ai_news(location)

    return jsonify({
        "user": user_data,
        "weather": weather_data,
        "news": news_data
    })

# ---------------- Forum Routes (FIXED & CONSISTENT) ----------------

@app.route("/api/create-post", methods=["POST"])
@token_required
def create_post(current_user):
    """ Creates a new forum post. """
    data = request.get_json()
    title = data.get("title")
    content = data.get("content") # Use 'content'

    if not title or not content:
        return jsonify({"error": "Title and content are required."}), 400
        
    if db is None: return jsonify({"error": "Database not connected"}), 500

    new_post = {
        "title": title,
        "content": content,
        "author_id": current_user["_id"],
        "author_username": current_user["username"],
        "createdAt": datetime.now(timezone.utc),
        "replies": []
    }
    
    try:
        result = db.posts.insert_one(new_post)
        
        # Send back the full post object, as React expects
        new_post["_id"] = str(result.inserted_id) 
        new_post["author_id"] = str(new_post["author_id"])
        
        return jsonify(new_post), 201
        
    except Exception as e:
        print(f"Post creation error: {e}")
        return jsonify({"error": "Could not create post."}), 500

@app.route("/api/posts", methods=["GET"])
def get_all_posts():
    """ Gets all posts to display on the main forum page. """
    if db is None: return jsonify({"error": "Database not connected"}), 500
    
    posts = []
    try:
        # We send all data, React will choose what to display
        for post in db.posts.find().sort("createdAt", -1):
            post["_id"] = str(post["_id"])
            post["author_id"] = str(post["author_id"])
            
            # Convert reply IDs for consistency
            replies = post.get("replies", [])
            for reply in replies:
                if "_id" in reply:
                    reply["_id"] = str(reply["_id"])
                if "reply_author_id" in reply:
                    reply["reply_author_id"] = str(reply["reply_author_id"])
            post["replies"] = replies
            
            posts.append(post)
        return jsonify(posts)
    except Exception as e:
        print(f"Get all posts error: {e}")
        return jsonify({"error": "Could not fetch posts."}), 500

@app.route("/api/post/<post_id>", methods=["GET"])
def get_one_post(post_id):
    """ Gets a single post and all its replies. """
    if db is None: return jsonify({"error": "Database not connected"}), 500
    
    try:
        post = db.posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            return jsonify({"error": "Post not found."}), 404
            
        # Convert all ObjectIds to strings for JSON
        post["_id"] = str(post["_id"])
        post["author_id"] = str(post["author_id"])
        
        replies = post.get("replies", [])
        for reply in replies:
            if "_id" in reply:
                reply["_id"] = str(reply["_id"])
            if "reply_author_id" in reply:
                reply["reply_author_id"] = str(reply["reply_author_id"])
            
        post["replies"] = replies
            
        return jsonify(post)
    except InvalidId:
        return jsonify({"error": "Invalid post ID."}), 400
    except Exception as e:
        print(f"Get one post error: {e}")
        return jsonify({"error": "Could not fetch post."}), 500

@app.route("/api/post/<post_id>/reply", methods=["POST"])
@token_required
def add_reply(current_user, post_id):
    """ Adds a reply to a specific post. """
    data = request.get_json()
    content = data.get("content") # Use 'content'

    if not content:
        return jsonify({"error": "Reply content is required."}), 400
        
    if db is None: return jsonify({"error": "Database not connected"}), 500

    try:
        new_reply = {
            "_id": ObjectId(), # Generate a new ID for the reply
            "content": content,
            "reply_author_id": current_user["_id"],
            "reply_author_username": current_user["username"],
            "createdAt": datetime.now(timezone.utc)
        }

        result = db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$push": {"replies": new_reply}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Post not found."}), 404

        # Convert IDs to strings before sending back
        new_reply["_id"] = str(new_reply["_id"])
        new_reply["reply_author_id"] = str(new_reply["reply_author_id"])
        
        return jsonify(new_reply), 201
        
    except InvalidId:
        return jsonify({"error": "Invalid post ID."}), 400
    except Exception as e:
        print(f"Reply error: {e}")
        return jsonify({"error": "Could not add reply."}), 500

@app.route("/api/my-posts", methods=["GET"])
@token_required
def get_my_posts(current_user):
    """ Gets all posts created by the logged-in user. """
    if db is None: return jsonify({"error": "Database not connected"}), 500
    
    posts = []
    try:
        for post in db.posts.find({"author_id": current_user["_id"]}).sort("createdAt", -1):
            post["_id"] = str(post["_id"])
            post["author_id"] = str(post["author_id"])
            
            # Convert reply IDs
            replies = post.get("replies", [])
            for reply in replies:
                reply["_id"] = str(reply["_id"])
                reply["reply_author_id"] = str(reply["reply_author_id"])
            post["replies"] = replies
            
            posts.append(post)
        return jsonify(posts)
    except Exception as e:
        print(f"Get my posts error: {e}")
        return jsonify({"error": "Could not fetch your posts."}), 500

@app.route("/api/post/<post_id>", methods=["PUT"])
@token_required
def edit_post(current_user, post_id):
    """ Edits an existing post. """
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")

    if not title or not content:
        return jsonify({"error": "Title and content are required."}), 400
        
    if db is None: return jsonify({"error": "Database not connected"}), 500

    try:
        result = db.posts.update_one(
            {
                "_id": ObjectId(post_id),
                "author_id": current_user["_id"]
            },
            {
                "$set": {
                    "title": title,
                    "content": content,
                    "updatedAt": datetime.now(timezone.utc)
                }
            }
        )
        if result.matched_count == 0:
            return jsonify({"error": "Post not found or you are not the author."}), 404
        return jsonify({"message": "Post updated successfully!"}), 200
        
    except InvalidId:
        return jsonify({"error": "Invalid post ID."}), 400
    except Exception as e:
        print(f"Edit post error: {e}")
        return jsonify({"error": "Could not update post."}), 500

@app.route("/api/post/<post_id>", methods=["DELETE"])
@token_required
def delete_post(current_user, post_id):
    """ Deletes an existing post. """
    if db is None: return jsonify({"error": "Database not connected"}), 500

    try:
        result = db.posts.delete_one(
            {
                "_id": ObjectId(post_id),
                "author_id": current_user["_id"]
            }
        )
        if result.deleted_count == 0:
            return jsonify({"error": "Post not found or you are not the author."}), 404
        return jsonify({"message": "Post deleted successfully!"}), 200
        
    except InvalidId:
        return jsonify({"error": "Invalid post ID."}), 400
    except Exception as e:
        print(f"Delete post error: {e}")
        return jsonify({"error": "Could not delete post."}), 500
        
# ---------------- Public Routes ----------------

@app.route("/chatbot", methods=["POST"])
def chatbot():
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
    data = request.get_json()
    print(f"📩 New contact message from {data.get('name')}")
    return jsonify({"message": "Message received!"})

# ---------------- Tool Routes ----------------

@app.route("/analyze-fertility", methods=["POST"])
def analyze_soil_fertility():
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

@app.route("/calculate-fertilizer", methods=["POST"])
def calculate_fertilizer():
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

@app.route("/weather", methods=["GET"])
# <-- CACHE LINE IS GONE
def weather_route():
    city = request.args.get('city')
    
    current_weather = get_weather(city) # This is still cached (good!)
    if "error" in current_weather:
        return jsonify(current_weather), 404
    
    forecast = get_5_day_forecast(city) # This is still cached (good!)
    if "error" in forecast:
        return jsonify(forecast), 500
    
    # Convert to tuples to use the advice cache
    current_weather_tuple = tuple(sorted(current_weather.items()))
    forecast_tuple = tuple(tuple(sorted(day.items())) for day in forecast)
    advice = get_agri_advice(current_weather_tuple, forecast_tuple, city) # This is still cached (good!)
    
    return jsonify({
        "current": current_weather,
        "forecast": forecast,
        "advice": advice
    })

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
        return jsonify({"error": "AI model is not configured."}), 500
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
            treatment = "AI did not provide a separate treatment section."
        return jsonify({
            "identification": identification,
            "treatment": treatment
        })
    except Exception as e:
        print(f"Gemini AI error in /identify-pest: {e}")
        return jsonify({"error": f"AI generation error: {e}"}), 500

@app.route("/market-prices", methods=["GET"])
@cache.memoize(timeout=1800) # Cache market prices for 30 min
def get_market_prices():
    MOCK_DATA_FALLBACK = [
        {"commodity": "Wheat", "state": "Punjab", "market": "Ludhiana (Mock Data)", "price": "2250", "date": "2025-10-30"},
        {"commodity": "Cotton", "state": "Gujarat", "market": "Rajkot (Mock Data)", "price": "7500", "date": "2025-10-30"}
    ]
    if not DATA_GOV_API_KEY:
        print("[Warning] DATA_GOV_API_KEY not configured. Returning mock data.")
        return jsonify(MOCK_DATA_FALLBACK)
    
    API_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
    base_url = f"https://api.data.gov.in/resource/{API_RESOURCE_ID}"
    state = request.args.get('state')
    commodity = request.args.get('commodity')
    params = {
        "api-key": DATA_GOV_API_KEY, "format": "json",
        "limit": 100, "sort[arrival_date]": "desc"
    }
    if state: params["filters[state]"] = state
    if commodity: params["filters[commodity]"] = commodity
    
    try:
        response = requests.get(base_url, params=params, timeout=10)
        if response.status_code == 401 or response.status_code == 403:
            print("[Error] Market API key is invalid. Returning mock data.")
            return jsonify(MOCK_DATA_FALLBACK)
        response.raise_for_status()
        data = response.json()
        if "records" not in data or not data["records"]:
            return jsonify({"error": "No data found for the selected filters."}), 404
        
        records = []
        for item in data["records"]:
            records.append({
                "commodity": item.get("commodity", "Unknown"),
                "state": item.get("state", "Unknown"),
                "market": item.get("market", "Unknown"),
                "price": item.get("modal_price", "N/A"),
                "date": item.get("arrival_date", "N/A")
            })
        return jsonify(records)
    except Exception as e:
        print(f"[Error] Market API error: {e}. Returning mock data.")
        return jsonify(MOCK_DATA_FALLBACK)

@app.route("/detailed-recommendation", methods=["POST"])
def detailed_recommendation():
    data = request.get_json()
    soil = data.get("soil")
    season = data.get("season")
    state = data.get("stateName")
    try:
        rainfall = float(data.get("rainfall"))
        temp = float(data.get("temp"))
    except (ValueError, TypeError):
        return jsonify({"error": "Rainfall and Temperature must be numbers."}), 400
    if not all([soil, season, state, data.get("rainfall"), data.get("temp")]):
        return jsonify({"error": "All fields are required."}), 400
    if not model:
        return jsonify({"error": "AI model is not configured."}), 500
    try:
        prompt = (
            f"You are an expert Indian agronomist. A farmer from {state} has provided their field conditions: "
            f"Soil Type: {soil}, Season: {season}, Avg Rainfall: {rainfall}mm, Avg Temp: {temp}°C.\n\n"
            f"Please provide a detailed recommendation. Follow this exact format:\n"
            f"1.  **Recommended Crops:** List the top 3-5 suitable crops as a simple list (e.g., 'Cucumber, Bottle Gourd, Okra').\n"
            f"2.  Then, write '---ANALYSIS---' as a separator on its own line.\n"
            f"3.  After the separator, write '### Detailed Analysis & Recommendations'.\n"
            f"4.  **Critical Analysis:** First, analyze the inputs. If any value is extreme or unlikely (like 55°C or 3mm rain), point it out politely, explain why it's a problem, and state that you are proceeding with a more realistic assumption (e.g., assuming 35°C or that irrigation is 100% required).\n"
            f"5.  **Suitability Analysis:** Explain *why* the recommended crops are a good fit (heat tolerance, soil adaptability, etc.).\n"
            f"6.  **Market & Yield Potential:** Briefly mention the market demand and expected yield for these crops in the {state} region.\n"
            f"7.  **Growing Tips:** Provide a numbered list of 3-5 essential growing tips for these crops under the given {soil} soil and {season} season conditions (e.g., irrigation, mulching, soil management)."
        )
        response = model.generate_content(prompt)
        full_text = response.text
        if "---ANALYSIS---" in full_text:
            parts = full_text.split("---ANALYSIS---", 1)
            crops_list = parts[0].strip()
            analysis_text = parts[1].strip()
        else:
            crops_list = "Could not determine specific crops."
            analysis_text = "AI response was not in the expected format."
        return jsonify({
            "crops": crops_list,
            "analysis": analysis_text
        })
    except Exception as e:
        print(f"Gemini AI error in /detailed-recommendation: {e}")
        return jsonify({"error": f"AI generation error: {e}"}), 500
        
# ---------------- Local Helper Functions ----------------

def analyze_fertility(n, p, k, ph):
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

def get_fertilizer_recommendation(n, p, k, crop):
    CROP_DATA = {
        "rice": {"N": 120, "P": 60, "K": 60}, "wheat": {"N": 150, "P": 60, "K": 40},
        "maize": {"N": 180, "P": 80, "K": 50}, "sugarcane": {"N": 250, "P": 80, "K": 120},
        "cotton": {"N": 160, "P": 70, "K": 80}, "potato": {"N": 180, "P": 100, "K": 120}
    }
    FERTILIZER_DATA = {
        "urea": {"N": 0.46, "P": 0, "K": 0}, "dap": {"N": 0.18, "P": 0.46, "K": 0},
        "mop": {"N": 0, "P": 0, "K": 0.60}
    }
    target_crop = CROP_DATA.get(crop.lower())
    if not target_crop: # <-- Fixed typo here
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
        "urea_kg": round(kg_urea, 2), "dap_kg": round(kg_dap, 2), "mop_kg": round(kg_mop, 2),
        "recommendations": [
            f"For your {crop.title()}, you need to add {n_gap} kg/ha of Nitrogen, {p_gap} kg/ha of Phosphorus, and {k_gap} kg/ha of Potassium.",
            "Apply in split doses as per local agricultural guidelines."
        ]
    }
        
# ---------------- Run Flask ----------------
if __name__ == "__main__":
    app.run(debug=True)