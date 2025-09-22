# train_model.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Sample dataset
data = {
    "moisture": [23, 35, 30, 40, 25],
    "pH": [6, 7, 6.5, 5.5, 6.2],
    "nitrogen": [40, 20, 35, 15, 30],
    "phosphorus": [20, 15, 25, 10, 22],
    "potassium": [30, 20, 28, 12, 25],
    "crop": ["Wheat", "Rice", "Wheat", "Maize", "Wheat"]
}

df = pd.DataFrame(data)

# Features and labels
X = df[["moisture", "pH", "nitrogen", "phosphorus", "potassium"]]
y = df["crop"]

# Train model
model = RandomForestClassifier()
model.fit(X, y)

# Save the model
joblib.dump(model, "model/crop_model.pkl")
print("Model saved as crop_model.pkl")
