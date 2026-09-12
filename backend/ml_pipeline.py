import firebase_admin
from firebase_admin import credentials, db
import time
import os
import numpy as np
import pandas as pd

# --- YOU NEED TO ADD YOUR SERVICE ACCOUNT JSON FILE HERE ---
# Download from Firebase Console -> Project Settings -> Service Accounts
# UNCOMMENT THESE WHEN YOU ARE READY TO LOAD THE REAL MODELS:
# import torch
# import tensorflow as tf

CREDENTIALS_FILE = "serviceAccountKey.json"
DATABASE_URL = "https://sample-32c09-default-rtdb.firebaseio.com"

# ==========================================
# 1. LOAD YOUR MODELS HERE (Only loaded once)
# ==========================================
print("Loading ML Models...")
# env_model = torch.load("models/best_model.pt", map_location="cpu")
# env_model.eval()

# fire_model = torch.load("models/forest_fire/best_model.pt", map_location="cpu")
# fire_model.eval()

# flood_model = tf.keras.models.load_model("models/flood_landslide_model.keras")
print("Models loaded successfully.")


def init_firebase():
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"ERROR: Missing {CREDENTIALS_FILE}!")
        print("Download it from Firebase Console -> Project Settings -> Service Accounts")
        return False
        
    cred = credentials.Certificate(CREDENTIALS_FILE)
    firebase_admin.initialize_app(cred, {
        "databaseURL": DATABASE_URL
    })
    print("✅ Connected to Firebase ML Pipeline")
    firebase_admin.initialize_app(cred, {"databaseURL": DATABASE_URL})
    print("✅ Connected to Firebase")
    print("SUCCESS: Connected to Firebase ML Pipeline")
    return True

# This function runs YOUR actual model prediction

# ==========================================
# 2. YOUR PREPROCESSING AND PREDICTION LOGIC
# ==========================================
def run_ml_models(recent_60_records):
    # Convert the list of 60 Firebase dictionary records into a Pandas DataFrame
    # This makes it very easy to calculate rolling means, slopes, etc.
    df = pd.DataFrame(recent_60_records)
    
    # Example of how you would engineer features based on your model-readme.md:
    """
    TODO: Insert your PyTorch / Keras inference code here.
    - Extract the 60 timesteps from `recent_60_records`.
    - Apply your rolling means, standardization, missing value fill.
    - Pass into the PyTorch / Keras models.
    # 1. Handle missing values
    df['temperature'] = df['temperature'].fillna(df['temperature'].median())
    
    # 2. Calculate rolling means and diffs (as required by your [1, 60, 37] model)
    df['mq3_rolling_mean'] = df['MQ3'].rolling(window=5, min_periods=1).mean()
    df['mq3_raw_adc_diff'] = df['MQ3'].diff().fillna(0)
    
    # 3. Standardize using your training mean/std
    df['temperature'] = (df['temperature'] - train_mean_temp) / train_std_temp
    
    # 4. Prepare PyTorch Tensor [1, 60, 37]
    features_env = df[['temperature', 'humidity', 'MQ3', ... 37 features total ]].values
    tensor_env = torch.tensor(features_env, dtype=torch.float32).unsqueeze(0) # Shape: [1, 60, 37]
    
    # 5. Run Inference
    with torch.no_grad():
        env_out = env_model(tensor_env)
        
    # 6. Prepare Keras Input [1, 15] for Flood model
    last_15 = df.tail(15)
    features_flood = np.array([[
        last_15['distance'].mean(),
        last_15['MQ3'].mean(),
        # ... 15 features total
    ]])
    flood_out = flood_model.predict(features_flood)
    """
    
    # For now, this is a placeholder that simulates a prediction
    # based on the most recent reading (so the frontend works immediately).

    # ----------------------------------------------------
    # FALLBACK/MOCK MATH: 
    # Remove this once you uncomment the real PyTorch code above!
    latest = recent_60_records[-1] if recent_60_records else {}
    
    soil = latest.get("soilMoisture", 50)
    mq3 = latest.get("MQ3", 0)
    mq5 = latest.get("MQ5", 0)
    dist = latest.get("distance", 0)
    
    landslideRisk = min(99, int(soil * 0.6 + (mq3 / 30)))
    floodRisk = min(99, int(dist * 20 + (mq3 / 50)))
    airQualityRisk = min(99, int((mq5 / 30) + (mq3 / 60)))
    overallRisk = min(99, int(landslideRisk * 0.45 + floodRisk * 0.35 + airQualityRisk * 0.2))
    # ----------------------------------------------------
    
    # Return the exact dictionary format the frontend is expecting
    return {
        "overallRisk": overallRisk,
        "landslideRisk": landslideRisk,
        "floodRisk": floodRisk,
        "airQualityRisk": airQualityRisk,
        "timestamp": latest.get("timestamp", int(time.time()))
    }

def process_new_data(event):
    """Callback triggered whenever new hardware data hits /sensorData"""
    print("🔔 New sensor data detected!")
    print("EVENT: New sensor data detected!")
    
    # Fetch the last 60 records (needed for your Time-Series models)
    ref = db.reference("sensorData")
    records_dict = ref.order_by_key().limit_to_last(60).get()
    
    # Grab the last 60 records for the time-series window
    records_dict = db.reference("sensorData").order_by_key().limit_to_last(60).get()
    if not records_dict:
        return
        
    # Sort chronologically
    # Sort chronologically by pushing keys
    records_list = [v for k, v in sorted(records_dict.items())]
    
    # Run predictions
    prediction_result = run_ml_models(records_list)
    print(f"🧠 Prediction complete: {prediction_result}")
    print(f"PREDICTION: {prediction_result}")
    
    # Write back to Firebase so frontend can show it
    # Write back to Firebase /mlPredictions
    db.reference("mlPredictions").push(prediction_result)
    print("✅ Result pushed to frontend\n")
    print("SUCCESS: Result pushed to frontend\n")

if __name__ == "__main__":
    if init_firebase():
        print("👂 Listening for live hardware data on /sensorData...")
        print("Listening for live hardware data on /sensorData...")
        # Listen for any new child added to /sensorData
        db.reference("sensorData").listen(process_new_data)
        
        # Keep script running
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("Shutting down.")

