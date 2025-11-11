import os
import io
import jwt
import bcrypt
import requests
import pymongo
import time  # <-- Import time for sleeping
import random  # <-- Import random for jitter
import re  # <-- Import regular expressions for searching
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
from flask_caching import Cache

# --- IMPORTANT ---
# You must have a 'config.py' file in the same directory
# This file should contain:
# MONGO_URI = "your_mongodb_connection_string"
# JWT_SECRET = "your_very_secret_jwt_key"
# -----------------
try:
    from config import MONGO_URI, JWT_SECRET
except ImportError:
    print("❌ Error: config.py not found.")
    print("Please create config.py with MONGO_URI and JWT_SECRET.")
    # Set placeholder values to avoid crashing the app immediately
    MONGO_URI = None
    JWT_SECRET = "DEFAULT_SECRET_PLEASE_CHANGE"

# Load environment variables from .env
load_dotenv()

# --- SAFE API KEY LOADING ---
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")

app = Flask(__name__)

# --- Configure Cache ---
app.config["CACHE_TYPE"] = "SimpleCache"  # In-memory cache
app.config["CACHE_DEFAULT_TIMEOUT"] = 900  # Default cache: 15 minutes
cache = Cache(app)
# --- End Cache Config ---

# --- Configure CORS ---
# Allow requests from your React development server
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}})


# ---------------- Database (MongoDB) ----------------
try:
    if not MONGO_URI:
        raise pymongo.errors.ConfigurationError("MONGO_URI not set.")
        
    client = pymongo.MongoClient(MONGO_URI)
    client.server_info()  # Force connection check
    db = client.krishimitra_db  # Your database name
    print("✅ MongoDB connection successful.")
except (pymongo.errors.ConnectionFailure, pymongo.errors.ConfigurationError) as e:
    print(f"❌ Error: Could not connect to MongoDB. {e}")
    db = None

if db is not None:
    try:
        # User indexes
        db.users.create_index("username", unique=True)
        print("✅ Username index ensured.")
        
        # Post indexes
        db.posts.create_index([("createdAt", pymongo.DESCENDING)])
        db.posts.create_index([("author_id", pymongo.ASCENDING)])
        print("✅ Post indexes ensured.")

        # --- TIER 1 FEATURE: PRODUCT INDEXES ---
        db.products.create_index([("name", "text"), ("description", "text"), ("tags", pymongo.ASCENDING)])
        db.products.create_index("category")
        print("✅ Product marketplace indexes ensured.")
        # --- End Tier 1 ---

    except Exception as e:
        print(f"⚠️ Error creating indexes: {e}")

# ---------------- Auth Routes (Unchanged) ----------------
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
        user_data = {"username": username, "password": hashed_pw, "full_name": None, "default_location": None}
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
            {"id": str(user["_id"]), "exp": datetime.now(timezone.utc) + timedelta(hours=5)},
            JWT_SECRET,
            algorithm="HS256"
        )
        return jsonify({"token": token})
    return jsonify({"error": "Invalid credentials"}), 401

# --- Auth Helper (Unchanged) ---
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

# ---------------- Gemini Integration (Unchanged) ----------------
try:
    if not GEMINI_API_KEY:
        print("⚠️ Error: GEMINI_API_KEY not found. Check your .env file.")
        model = None
    else:
        genai.configure(api_key=GEMINI_API_KEY)
        generation_config = {"temperature": 0.5, "max_output_tokens": 1024}
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash", # Using a specific model name
            generation_config=generation_config,
        )
        print("✅ Gemini model (gemini-2.0-flash) configured successfully.")
except Exception as e:
    print(f"❌ Error configuring Gemini: {e}")
    model = None

def generate_content_with_backoff(model, content, retries=5, delay=2):
    """Handles API retries on 429 errors."""
    attempt = 0
    while attempt < retries:
        try:
            response = model.generate_content(content)
            return response
        except Exception as e:
            if "429" in str(e):
                print(f"⚠️ Gemini API 429 (Rate Limit). Retrying in {delay}s... (Attempt {attempt + 1}/{retries})")
                time.sleep(delay + random.uniform(0, 1))
                delay *= 2
                attempt += 1
            else:
                print(f"❌ Gemini API Error (Not 429): {e}")
                raise e # Re-raise other errors
    
    # If all retries fail
    from types import SimpleNamespace
    error_text = "Error: API Resource Exhausted (429). Please try again in a few moments."
    # Return a mock response object to avoid crashing the caller
    return SimpleNamespace(text=error_text)

# ---------------- User Profile Routes (Unchanged) ----------------
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
    new_name = data.get("fullName")
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
        # Clear cached dashboard data for this user
        cache.delete_memoized(get_dashboard_data, current_user)
        return jsonify({"message": "Profile updated successfully!"})
    except Exception as e:
        print(f"Profile update error: {e}")
        return jsonify({"error": "Database error."}), 500

# ---------------- Caching Helpers (Unchanged) ----------------
@cache.memoize(timeout=900) # Cache for 15 minutes
def get_weather(city):
    """ Fetches current weather. Results are cached. """
    if not WEATHER_API_KEY: return {"error": "Weather API key not set"}
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
        data = requests.get(url).json()
        if data["cod"] != 200:
            return {"error": data.get("message", "City not found")}
        return {
            "temperature": data["main"]["temp"],
            "condition": data["weather"][0]["description"].title(),
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"] * 3.6, # km/h
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
                # Update min/max temps for the day
                daily_forecasts[date_str]["min_temp"] = min(daily_forecasts[date_str]["min_temp"], entry["main"]["temp_min"])
                daily_forecasts[date_str]["max_temp"] = max(daily_forecasts[date_str]["max_temp"], entry["main"]["temp_max"])
                daily_forecasts[date_str]["conditions"].append(entry["weather"][0]["description"])
        
        final_forecast = []
        for date_key in sorted(daily_forecasts.keys())[:5]: # Get up to 5 days
            day_data = daily_forecasts[date_key]
            # Find the most common condition for the day
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
        
        response = generate_content_with_backoff(model, prompt)
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
        response = generate_content_with_backoff(model, prompt)
        return response.text
    except Exception as e:
        print(f"Dashboard Gemini News Error: {e}")
        return "Could not load news."

# ---------------- Main Dashboard Route (Unchanged) ----------------
@app.route("/dashboard-data", methods=["GET"])
@token_required
@cache.memoize(timeout=300) # Cache dashboard data per user for 5 min
def get_dashboard_data(current_user):
    location = current_user.get("default_location")
    user_data = {
        "full_name": current_user.get("full_name"),
        "username": current_user.get("username"),
        "location": location
    }
    
    if not location:
        return jsonify({ "user": user_data, "error": "User location not set. Please update your profile." }), 200 
    
    weather_data = None
    try:
        current_weather = get_weather(location)
        if "error" not in current_weather:
            forecast = get_5_day_forecast(location)
            if "error" not in forecast:
                # Convert dicts to tuples for caching
                current_weather_tuple = tuple(sorted(current_weather.items()))
                forecast_tuple = tuple(tuple(sorted(day.items())) for day in forecast)
                
                advice = get_agri_advice(current_weather_tuple, forecast_tuple, location)
                weather_data = { "current": current_weather, "forecast": forecast, "advice": advice }
    except Exception as e:
        print(f"Dashboard Weather/Advice Error: {e}")

    news_data = get_ai_news(location)
    
    return jsonify({ "user": user_data, "weather": weather_data, "news": news_data })

# ---------------- Forum Routes (Unchanged) ----------------
@app.route("/api/create-post", methods=["POST"])
@token_required
def create_post(current_user):
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")
    if not title or not content:
        return jsonify({"error": "Title and content are required."}), 400
    if db is None: return jsonify({"error": "Database not connected"}), 500
    
    current_time = datetime.now(timezone.utc)
    new_post = {
        "title": title, "content": content, "author_id": current_user["_id"],
        "author_username": current_user["username"], "createdAt": current_time, "replies": []
    }
    
    try:
        result = db.posts.insert_one(new_post)
        response_post = {
            "id": str(result.inserted_id), "title": new_post["title"], "content": new_post["content"],
            "author_id": str(new_post["author_id"]), "username": new_post["author_username"],
            "created_at": current_time.isoformat(), "replies": []
        }
        return jsonify(response_post), 201
    except Exception as e:
        print(f"Post creation error: {e}")
        return jsonify({"error": "Could not create post."}), 500

@app.route("/api/posts", methods=["GET"])
def get_all_posts():
    if db is None: return jsonify({"error": "Database not connected"}), 500
    posts = []
    try:
        for post in db.posts.find().sort("createdAt", -1):
            formatted_post = {
                "id": str(post["_id"]), "title": post["title"], "content": post["content"],
                "author_id": str(post["author_id"]), "username": post["author_username"],
                "created_at": post["createdAt"].isoformat(),
            }
            replies = post.get("replies", [])
            formatted_replies = []
            for reply in replies:
                created_at_str = reply["createdAt"].isoformat() if isinstance(reply["createdAt"], datetime) else reply["createdAt"]
                formatted_replies.append({
                    "id": str(reply["_id"]), "content": reply["content"],
                    "author_id": str(reply["reply_author_id"]), "username": reply["reply_author_username"],
                    "created_at": created_at_str
                })
            formatted_post["replies"] = formatted_replies
            posts.append(formatted_post)
        return jsonify(posts)
    except Exception as e:
        print(f"Get all posts error: {e}")
        return jsonify({"error": "Could not fetch posts."}), 500

@app.route("/api/post/<post_id>", methods=["GET"])
def get_one_post(post_id):
    if db is None: return jsonify({"error": "Database not connected"}), 500
    try:
        post = db.posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            return jsonify({"error": "Post not found."}), 404
        
        formatted_post = {
            "id": str(post["_id"]), "title": post["title"], "content": post["content"],
            "author_id": str(post["author_id"]), "username": post["author_username"],
            "created_at": post["createdAt"].isoformat(),
        }
        replies = post.get("replies", [])
        formatted_replies = []
        for reply in replies:
            created_at_str = reply["createdAt"].isoformat() if isinstance(reply["createdAt"], datetime) else reply["createdAt"]
            formatted_replies.append({
                "id": str(reply["_id"]), "content": reply["content"],
                "author_id": str(reply["reply_author_id"]), "username": reply["reply_author_username"],
                "created_at": created_at_str
            })
        formatted_post["replies"] = formatted_replies
        return jsonify(formatted_post)
    except InvalidId:
        return jsonify({"error": "Invalid post ID."}), 400
    except Exception as e:
        print(f"Get one post error: {e}")
        return jsonify({"error": "Could not fetch post."}), 500

@app.route("/api/post/<post_id>/reply", methods=["POST"])
@token_required
def add_reply(current_user, post_id):
    data = request.get_json()
    content = data.get("content")
    if not content:
        return jsonify({"error": "Reply content is required."}), 400
    if db is None: return jsonify({"error": "Database not connected"}), 500
    
    current_time = datetime.now(timezone.utc)
    try:
        new_reply = {
            "_id": ObjectId(), "content": content, "reply_author_id": current_user["_id"],
            "reply_author_username": current_user["username"], "createdAt": current_time
        }
        result = db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$push": {"replies": new_reply}}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Post not found."}), 404
        
        formatted_reply = {
            "id": str(new_reply["_id"]), "content": new_reply["content"],
            "author_id": str(new_reply["reply_author_id"]), "username": new_reply["reply_author_username"],
            "created_at": current_time.isoformat()
        }
        return jsonify(formatted_reply), 201
    except InvalidId:
        return jsonify({"error": "Invalid post ID."}), 400
    except Exception as e:
        print(f"Reply error: {e}")
        return jsonify({"error": "Could not add reply."}), 500

@app.route("/api/my-posts", methods=["GET"])
@token_required
def get_my_posts(current_user):
    if db is None: return jsonify({"error": "Database not connected"}), 500
    posts = []
    try:
        for post in db.posts.find({"author_id": current_user["_id"]}).sort("createdAt", -1):
            formatted_post = {
                "id": str(post["_id"]), "title": post["title"], "content": post["content"],
                "author_id": str(post["author_id"]), "username": post["author_username"],
                "created_at": post["createdAt"].isoformat(),
            }
            replies = post.get("replies", [])
            formatted_replies = []
            for reply in replies:
                created_at_str = reply["createdAt"].isoformat() if isinstance(reply["createdAt"], datetime) else reply["createdAt"]
                formatted_replies.append({
                    "id": str(reply["_id"]), "content": reply["content"],
                    "author_id": str(reply["reply_author_id"]), "username": reply["reply_author_username"],
                    "created_at": created_at_str
                })
            formatted_post["replies"] = formatted_replies
            posts.append(formatted_post)
        return jsonify(posts)
    except Exception as e:
        print(f"Get my posts error: {e}")
        return jsonify({"error": "Could not fetch your posts."}), 500

@app.route("/api/post/<post_id>", methods=["PUT"])
@token_required
def edit_post(current_user, post_id):
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")
    if not title or not content:
        return jsonify({"error": "Title and content are required."}), 400
    if db is None: return jsonify({"error": "Database not connected"}), 500
    
    try:
        result = db.posts.update_one(
            {"_id": ObjectId(post_id), "author_id": current_user["_id"]},
            {"$set": {"title": title, "content": content, "updatedAt": datetime.now(timezone.utc)}}
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
    if db is None: return jsonify({"error": "Database not connected"}), 500
    try:
        result = db.posts.delete_one(
            {"_id": ObjectId(post_id), "author_id": current_user["_id"]}
        )
        if result.deleted_count == 0:
            return jsonify({"error": "Post not found or you are not the author."}), 404
        return jsonify({"message": "Post deleted successfully!"}), 200
    except InvalidId:
        return jsonify({"error": "Invalid post ID."}), 400
    except Exception as e:
        print(f"Delete post error: {e}")
        return jsonify({"error": "Could not delete post."}), 500

# ---------------- Public Routes (Unchanged) ----------------
@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()
    query_text = data.get("query", "").strip()
    if not query_text:
        return jsonify({"answer": "Please enter a query."})
    if model:
        try:
            response = generate_content_with_backoff(model, query_text)
            return jsonify({"answer": response.text})
        except Exception as e:
            return jsonify({"answer": f"Error communicating with AI: {e}"})
    return jsonify({"answer": "Chatbot model not configured."})

@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json()
    print(f"📩 New contact message from {data.get('name')}")
    # This is a placeholder. In a real app, you'd email this or save to DB.
    return jsonify({"message": "Message received!"})


#
# --- ALL NEW/UPDATED CODE IS BELOW ---
#

# ---------------- TIER 1 FEATURE: MARKETPLACE ROUTES ----------------

def format_product(product):
    """Helper function to convert MongoDB doc to JSON-friendly format."""
    return {
        "id": str(product["_id"]),
        "name": product["name"],
        "brand": product.get("brand"),
        "description": product.get("description"),
        "price": product.get("price"),
        "category": product.get("category"),
        "tags": product.get("tags", []),
        "image_url": product.get("image_url"),
        "stock": product.get("stock", 0)
    }

# --- ROUTE UPDATED (Bug Fix) ---
@app.route("/api/products", methods=["GET"])
def get_all_products():
    """Fetches all products, e.g., for the main marketplace page."""
    if db is None: return jsonify({"error": "Database not connected"}), 500
    try:
        products = db.products.find()
        # --- THIS IS THE FIX ---
        # Changed 'product_.ist' to 'product_list'
        product_list = [format_product(p) for p in products]
        # --- END OF FIX ---
        return jsonify(product_list)
    except Exception as e:
        print(f"Error fetching products: {e}")
        return jsonify({"error": "Could not fetch products"}), 500
# --- END ROUTE UPDATE ---

@app.route("/api/product/<product_id>", methods=["GET"])
def get_one_product_by_id(product_id):
    """Fetches a single product by its ID."""
    if db is None: return jsonify({"error": "Database not connected"}), 500
    try:
        product = db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            return jsonify({"error": "Product not found."}), 404
        return jsonify(format_product(product))
    except InvalidId:
        return jsonify({"error": "Invalid product ID."}), 400
    except Exception as e:
        print(f"Get one product error: {e}")
        return jsonify({"error": "Could not fetch product."}), 500

@app.route("/api/products/search", methods=["GET"])
def search_products():
    """
    Searches for products by tag.
    Example: /api/products/search?tag=urea
    """
    if db is None: return jsonify({"error": "Database not connected"}), 500
    tag = request.args.get('tag')
    if not tag:
        return jsonify({"error": "A 'tag' query parameter is required."}), 400
    
    try:
        # Find products where the 'tags' array contains the query tag (case-insensitive)
        products = db.products.find({"tags": re.compile(f"^{tag}$", re.IGNORECASE)})
        product_list = [format_product(p) for p in products]
        return jsonify(product_list)
    except Exception as e:
        print(f"Error searching products: {e}")
        return jsonify({"error": "Could not search products"}), 500

@app.route("/api/products", methods=["POST"])
@token_required
def add_new_product(current_user):
    """Adds a new product to the database. (Admin function)"""
    if db is None: return jsonify({"error": "Database not connected"}), 500
    data = request.get_json()
    try:
        # Basic validation
        if not data.get("name") or not data.get("price") or not data.get("category"):
            return jsonify({"error": "Missing required fields: name, price, category"}), 400
        
        # Ensure tags are a list of lowercase strings
        tags = [str(tag).lower() for tag in data.get("tags", [])]
        
        new_product = {
            "name": data["name"],
            "brand": data.get("brand"),
            "description": data.get("description"),
            "price": float(data["price"]),
            "category": data["category"],
            "tags": tags,
            "image_url": data.get("image_url"),
            "stock": int(data.get("stock", 0)),
            "createdAt": datetime.now(timezone.utc)
        }
        result = db.products.insert_one(new_product)
        new_product["id"] = str(result.inserted_id)
        return jsonify(format_product(new_product)), 201
        
    except Exception as e:
        print(f"Error adding product: {e}")
        return jsonify({"error": "Could not add product"}), 500

# ---------------- TOOL ROUTES (UPGRADED FOR TIER 1) ----------------

@app.route("/analyze-fertility", methods=["POST"])
def analyze_soil_fertility():
    # This route is unchanged.
    data = request.get_json()
    try:
        n, p, k, ph = float(data["n"]), float(data["p"]), float(data["k"]), float(data["ph"])
        location = data["location"]
        weather_data = get_weather(location)
        levels, recommendations = analyze_fertility(n, p, k, ph)
        return jsonify({
            "location": location, "weather": weather_data,
            "levels": levels, "recommendations": recommendations
        })
    except Exception as e:
        return jsonify({"error": f"Error in /analyze-fertility: {e}"}), 500

@app.route("/calculate-fertilizer", methods=["POST"])
def calculate_fertilizer():
    """
    UPGRADED: Now recommends products from the marketplace.
    """
    data = request.get_json()
    try:
        n = float(data.get("n"))
        p = float(data.get("p"))
        k = float(data.get("k"))
        crop = data.get("crop")
        if not all([data.get("n"), data.get("p"), data.get("k"), crop]):
            return jsonify({"error": "Missing N, P, K, or crop."}), 400
        
        # 1. Get fertilizer calculation
        result = get_fertilizer_recommendation(n, p, k, crop)
        if "error" in result:
            return jsonify(result), 404
        
        # --- TIER 1 INTEGRATION ---
        suggested_products = []
        tags_to_search = []
        if result.get("urea_kg", 0) > 0: tags_to_search.append("urea")
        if result.get("dap_kg", 0) > 0: tags_to_search.append("dap")
        if result.get("mop_kg", 0) > 0: tags_to_search.append("mop")
        
        if db is not None and tags_to_search:
            # Find products where the 'tags' array contains any of our needed fertilizers
            product_cursor = db.products.find({
                "tags": {"$in": tags_to_search},
                "category": "fertilizer"
            })
            suggested_products = [format_product(p) for p in product_cursor]
        
        # Add the suggested products to our response
        result["suggested_products"] = suggested_products
        # --- End Tier 1 ---

        return jsonify(result)
        
    except Exception as e:
        print(f"Error in /calculate-fertilizer: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

@app.route("/weather", methods=["GET"])
def weather_route():
    # This route is unchanged
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "City parameter is required."}), 400
    current_weather = get_weather(city)
    if "error" in current_weather:
        return jsonify(current_weather), 404
    forecast = get_5_day_forecast(city)
    if "error" in forecast:
        return jsonify(forecast), 500
    
    # Convert dicts to tuples for caching
    current_weather_tuple = tuple(sorted(current_weather.items()))
    forecast_tuple = tuple(tuple(sorted(day.items())) for day in forecast)
    
    advice = get_agri_advice(current_weather_tuple, forecast_tuple, city)
    
    return jsonify({
        "current": current_weather,
        "forecast": forecast,
        "advice": advice
    })

@app.route("/identify-pest", methods=["POST"])
def identify_pest():
    """
    UPGRADED: Now recommends products from the marketplace.
    """
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
            f"treatment plan (Organic, Chemical, and Prevention sections). "
            f"**Crucially, mention key active ingredients or product types like 'neem oil', 'fungicide', 'insecticide', 'manconzeb' etc.**"
        )
        
        response = generate_content_with_backoff(model, [prompt, img])
        full_text = response.text
        
        identification = full_text
        treatment = "AI did not provide a separate treatment section."
        
        if "---TREATMENT---" in full_text:
            parts = full_text.split("---TREATMENT---", 1)
            identification = parts[0].strip()
            treatment = parts[1].strip()

        # --- TIER 1 INTEGRATION ---
        suggested_products = []
        if db is not None:
            # Define simple keywords to search for in the AI's treatment plan
            search_terms = {
                "neem": ["neem oil", "neem-based"],
                "fungicide": ["fungicide", "mancozeb", "copper oxychloride"],
                "insecticide": ["insecticide", "aphids", "whiteflies", "thrips"],
                "organic": ["organic", "panchagavya", "jeevamrutha"]
            }
            
            tags_to_search = set()
            treatment_lower = treatment.lower()
            for tag, keywords in search_terms.items():
                for keyword in keywords:
                    if keyword in treatment_lower:
                        tags_to_search.add(tag)
                        break # Move to the next tag
            
            if tags_to_search:
                product_cursor = db.products.find({
                    "tags": {"$in": list(tags_to_search)},
                    "category": "pesticide" # Assume pesticides for this tool
                })
                suggested_products = [format_product(p) for p in product_cursor]
        # --- End Tier 1 ---

        return jsonify({
            "identification": identification,
            "treatment": treatment,
            "suggested_products": suggested_products # Add products to the response
        })
    except Exception as e:
        print(f"Gemini AI error in /identify-pest: {e}")
        return jsonify({"error": f"AI generation error: {e}"}), 500

# --- MARKET PRICE ROUTE (FINAL + VERIFIED) ---
@app.route("/market-prices", methods=["GET"])
@cache.memoize(timeout=1800)  # Cache 30 min
def get_market_prices():
    """Fetch live market prices from data.gov.in or return fallback mock data."""
    print("\n🔍 [Debug] /market-prices called")

    MOCK_DATA_FALLBACK = [
        {"commodity": "Wheat", "state": "Punjab", "district": "Ludhiana", "market": "Ludhiana (Mock Data)", "modal_price": "2250", "arrival_date": "2025-10-30"},
        {"commodity": "Cotton", "state": "Gujarat", "district": "Rajkot", "market": "Rajkot (Mock Data)", "modal_price": "7500", "arrival_date": "2025-10-30"}
    ]

    # --- Check API key ---
    if not DATA_GOV_API_KEY:
        print("⚠ No DATA_GOV_API_KEY — returning mock data.")
        return jsonify(MOCK_DATA_FALLBACK)

    print("🔑 DATA_GOV_API_KEY loaded:", "Yes" if DATA_GOV_API_KEY else "No")

    # --- API setup ---
    API_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"  # Agmarknet dataset
    base_url = f"https://api.data.gov.in/resource/{API_RESOURCE_ID}"

    # Get optional filters
    state = request.args.get("state")
    commodity = request.args.get("commodity")

    # --- API Params (Fixed) ---
    params = {
        "api-key": DATA_GOV_API_KEY,
        "format": "json",
        "limit": 5000
    }

    # Optional filters
    if state:
        params["filters[state]"] = state.capitalize()
    if commodity:
        params["filters[commodity]"] = commodity.capitalize()

    print(f"📤 Fetching from {base_url}")
    print(f"📦 Params: {params}")

    try:
        response = requests.get(base_url, params=params, timeout=10)
        print(f"📥 Status Code: {response.status_code}")
        print("🔗 Full Request URL:", response.url)

        data = response.json()
        print("🧾 JSON Keys:", list(data.keys()))

        if "records" not in data:
            print("❌ API response missing 'records' — got:", data)
            return jsonify(MOCK_DATA_FALLBACK)

        records = data["records"]
        print(f"📊 Record count from API: {len(records)}")

        if len(records) == 0:
            print("⚠️ No records found — returning fallback data.")
            return jsonify(MOCK_DATA_FALLBACK)

        # --- Sample debug output ---
        sample = records[0]
        print("✅ Sample Record:", {k: sample[k] for k in list(sample.keys())[:6]})

        # --- Format records for frontend ---
        formatted = [{
            "commodity": r.get("commodity", "Unknown"),
            "state": r.get("state", "Unknown"),
            "district": r.get("district", "Unknown"),
            "market": r.get("market", "Unknown"),
            "modal_price": r.get("modal_price", "N/A"),
            "arrival_date": r.get("arrival_date", "N/A")
        } for r in records]

        print(f"✅ Returning {len(formatted)} total records.")
        return jsonify(formatted)

    except requests.exceptions.Timeout:
        print("❌ Timeout fetching from data.gov.in — returning fallback data.")
        return jsonify(MOCK_DATA_FALLBACK), 504

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return jsonify(MOCK_DATA_FALLBACK), 500



@app.route("/detailed-recommendation", methods=["POST"])
def detailed_recommendation():
    # This route is unchanged for now
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
        
        response = generate_content_with_backoff(model, prompt)
        full_text = response.text.strip()
        
        crops_list = ""
        analysis_text = ""
        if "---ANALYSIS---" in full_text:
            parts = full_text.split("---ANALYSIS---", 1)
            crops_list = parts[0].strip()
            analysis_text = parts[1].strip()
        elif "Recommended Crops:" in full_text:
            crops_list = full_text
            analysis_text = "" 
        else:
            crops_list = full_text 
            analysis_text = "" 
        
        analysis_text = analysis_text.replace("---ANALYSIS---", "").strip()
        crops_list = crops_list.replace("Recommended Crops:", "").strip()
        crops_list = crops_list.replace("1.", "").strip() 
        crops_list = crops_list.replace("**", "").strip() 

        return jsonify({
            "crops": crops_list,
            "analysis": analysis_text
        })
        
    except Exception as e:
        print(f"Gemini AI error in /detailed-recommendation: {e}")
        return jsonify({"error": f"AI generation error: {e}"}), 500

# ---------------- Local Helper Functions (Unchanged) ----------------

def analyze_fertility(n, p, k, ph):
    """Simple soil analysis logic."""
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
    """Simple fertilizer calculation logic."""
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
        "urea_kg": round(kg_urea, 2), "dap_kg": round(kg_dap, 2), "mop_kg": round(kg_mop, 2),
        "recommendations": [
            f"For your {crop.title()}, you need to add {n_gap} kg/ha of Nitrogen, {p_gap} kg/ha of Phosphorus, and {k_gap} kg/ha of Potassium.",
            "Apply in split doses as per local agricultural guidelines."
        ]
    }

# ---------------- Run Flask ----------------
if __name__ == "__main__":
    # Ensure JWT_SECRET is not the default
    if JWT_SECRET == "DEFAULT_SECRET_PLEASE_CHANGE":
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("! WARNING: You are using a default JWT_SECRET.           !")
        print("! Please set a strong, random secret in your config.py.  !")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    app.run(debug=True)