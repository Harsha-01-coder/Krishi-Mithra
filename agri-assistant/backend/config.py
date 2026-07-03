import os

# --- JWT Secret ---
# Load from environment in production, fall back to local key for dev.
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret_key_here")


# --- MongoDB Connection String ---
# Load from environment in production, fall back to local MongoDB for dev.
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/krishimitra_db")


#
# === OPTION 2: MongoDB Atlas (Cloud Database) ===
# Use this if you are using a cloud-hosted MongoDB.
#
# 1. Get this connection string from your Atlas dashboard.
# 2. Replace <your_username> and <your_password>.
# 3. Make sure your IP address is whitelisted in Atlas.
#
# # Example Atlas URI (Uncomment and replace placeholders if needed):
# # MONGO_URI = "mongodb+srv://<your_username>:<your_password>@your_cluster_url.mongodb.net/krishimitra_db?retryWrites=true&w=majority"