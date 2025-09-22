def analyze_soil(data, model):
    # Convert sensor input to numpy array
    features = np.array([[data["moisture"], data["pH"],
                        data["nitrogen"], data["phosphorus"], data["potassium"]]])
    # Predict crop
    crop = model.predict(features)[0]
    return crop
