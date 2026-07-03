# 🌱 Krishi Mithra - Smart Farming Assistant

Krishi Mithra is a comprehensive, AI-powered web platform designed to assist Indian farmers with real-time insights, diagnostic tools, and market intelligence. It acts as a digital toolkit to help farmers make data-driven decisions, optimize fertilizer usage, identify crop diseases, and check local market prices.

---

## 🚀 Key Features

### 🧑‍🌾 Personalized Dashboard
An integrated homepage custom-tailored to the farmer's location, displaying:
- **Local Weather:** Live temperature, humidity, and atmospheric conditions.
- **Regional News:** AI-curated agricultural updates and state-specific alerts.
- **Market Prices:** Live commodity values from local markets.

### 📸 Visual Pest & Disease ID (Google Gemini AI)
Farmers can upload photos of unhealthy crops. The backend uses Google Gemini AI to analyze the visual symptoms, diagnose the disease, and offer:
- **Organic Solutions:** Eco-friendly remedies and soil practices.
- **Chemical Solutions:** Target-specific pesticide recommendations with safe usage warnings.

### 🧪 Soil Fertility & Fertilizer Calculator
- **Soil Analysis:** Inputs soil levels of Nitrogen (N), Phosphorus (K), Potassium (P), and pH.
- **Target Calculator:** Calculates the exact commercial fertilizer requirement (Urea, DAP, and MOP in kilograms) per hectare for the chosen target crop.

### 🌦️ AI Weather Advisories
- Fetches 5-day weather forecasts via OpenWeatherMap.
- Synthesizes forecasts using Google Gemini AI to generate actionable farming actions (e.g., advising to delay pesticide spraying ahead of rain).

### 💹 Live Mandi Market Prices
- Directly fetches official commodity market prices from India's government portal (**data.gov.in** API).

### 🏛️ Government Schemes Library
- A catalog of central and state government schemes. Users can filter and read about benefits, eligibility, and applications.

### 🤖 24/7 AI Farming Chatbot
- A floatable chatbot powered by Google Gemini AI to answer agricultural queries.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (v18), CSS3, Axios, Framer Motion | Dynamic single-page client interface |
| **Backend** | Python, Flask, Gunicorn | Lightweight WSGI REST API |
| **Database** | MongoDB | Document store for posts, products, and profiles |
| **AI Layer** | Google Gemini (gemini-2.5-flash) | Image recognition, chat, and summarization |
| **APIs** | OpenWeatherMap, data.gov.in | Third-party services for weather and market data |
| **Auth** | JWT, bcrypt | Secure sessions and password hashing |

---

## 📂 Repository Structure

```
Krishi-Mithra/
├── agri-assistant/
│   ├── backend/
│   │   ├── app.py                # Main Flask entrypoint
│   │   ├── config.py             # Port & local Mongo URI configuration
│   │   ├── Dockerfile            # Backend production container
│   │   └── requirements.txt      # Python dependencies
│   └── frontend/
│       ├── src/
│       │   ├── config.js         # Centralized API url routing
│       │   ├── App.jsx           # React app router
│       │   └── pages/            # Page components (Dashboard, Forum, etc.)
│       ├── Dockerfile            # React static compiler and Nginx image
│       └── nginx.conf            # Nginx routing rules to support React Router
├── docker-compose.yml            # Multi-container local execution setup
└── README.md                     # Documentation
```

---

## ⚙️ Environment Configurations

Create a `.env` file in the backend directory (`agri-assistant/backend/.env`) with the following values:

```env
# 🌤 Weather (OpenWeatherMap API Key)
WEATHER_API_KEY=your_openweather_api_key

# 🤖 Gemini AI (Google AI Studio Key)
GEMINI_API_KEY=your_gemini_api_key

# 🏛️ Government Market Data API (data.gov.in)
DATA_GOV_API_KEY=your_data_gov_api_key

# 🔑 Google OAuth Client ID (for Google Sign-In)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# 📧 Email Server (used for recovery and notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password

# 🧩 Database & Security
MONGO_URI=mongodb://localhost:27017/krishimitra_db
JWT_SECRET=your_super_secret_jwt_key
```

For the Frontend (`agri-assistant/frontend/.env`), you can configure the backend URL:

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 💻 Local Setup

### Option 1: Direct Execution (Without Docker)

#### 1. Setup Backend
1. Make sure you have **MongoDB** running locally on port `27017`.
2. Navigate to the backend directory:
   ```bash
   cd agri-assistant/backend
   ```
3. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
4. Install python packages:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the backend server:
   ```bash
   python app.py
   ```

#### 2. Setup Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
4. The client will open at `http://localhost:3000`.

---

### Option 2: Docker Compose (Recommended)

Ensure you have **Docker Desktop** installed and running on your system. Run this single command in the root folder (where `docker-compose.yml` is located):

```bash
docker compose up --build
```

This will automatically pull/build:
1. A **MongoDB** container running on port `27017`.
2. A **Flask Backend** container running on port `5000`.
3. An **Nginx-backed Frontend** container running on port `80`.

Go to `http://localhost` to use the application.

---

## 🌐 Production Deployment

To host this application in production:

### 1. Database (MongoDB Atlas)
1. Register for a free cluster on [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Create a database user and whitelist all IP addresses (`0.0.0.0/0`) or your server's IP address.
3. Copy the cluster connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/krishimitra_db?retryWrites=true&w=majority
   ```
4. Put this connection string as the `MONGO_URI` in the backend environment variables.

### 2. Backend (Render / Railway / Heroku)
1. Link your GitHub repository.
2. Select the root directory or configure build settings to point to the backend:
   - **Root Directory:** `agri-assistant/backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --bind 0.0.0.0:5000 --workers 4 --threads 2 app:app` (or let the `Dockerfile` deploy automatically if using a container service).
3. Set all environment variables defined in [Environment Configurations](#%EF%B8%8F-environment-configurations) in the dashboard settings.

### 3. Frontend (Vercel / Netlify / Amplify)
1. Link your GitHub repository.
2. Set the build parameters:
   - **Build Directory:** `agri-assistant/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
3. Add the following environment variable to the settings:
   - `REACT_APP_API_URL`: Set this to your deployed **Backend URL** (e.g., `https://your-backend-app.onrender.com`).
