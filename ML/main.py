from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import os
import pandas as pd
import numpy as np

# ==========================================
# 1. API SETUP
# ==========================================
app = FastAPI(title="KrishiNiti ML Engine", version="1.0")

# Allow Node.js (and frontend) to make requests to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

header = ['State_Name', 'District_Name', 'Season', 'Crop'] 

class Question:
    def __init__(self, column, value):
        self.column = column
        self.value = value
    def match(self, example):
        val = example[self.column]
        return val == self.value
    def match2(self, example):
        if example == 'True' or example == 'true' or example == '1':
            return True
        else:
            return False
    def __repr__(self):
        return "Is %s %s %s?" % (header[self.column], "==", str(self.value))

def class_counts(Data):
    counts = {}
    for row in Data:
        label = row[-1]
        if label not in counts:
             counts[label] = 0
        counts[label] += 1
    return counts

class Leaf:
    def __init__(self, Data):
        self.predictions = class_counts(Data)

class Decision_Node:
    def __init__(self, question, true_branch, false_branch):
        self.question = question
        self.true_branch = true_branch
        self.false_branch = false_branch

def classify(row, node):
    if isinstance(node, Leaf):
        return node.predictions
    if node.question.match(row):
        return classify(row, node.true_branch)
    else:
        return classify(row, node.false_branch)

def print_leaf(counts):
    total = sum(counts.values()) * 1.0
    probs = {}
    for lbl in counts.keys():
        probs[lbl] = str(int(counts[lbl] / total * 100)) + "%"
    return probs


import __main__
__main__.Question = Question
__main__.Leaf = Leaf
__main__.Decision_Node = Decision_Node

# ==========================================
# 2. LOAD ALL MODELS & ENCODERS
# ==========================================
models = {}

def load_model(folder_name, file_name):
    try:
        path = os.path.join(BASE_DIR, folder_name, file_name)
        with open(path, "rb") as f:
            print(f"✅ Loaded: {folder_name}/{file_name}")
            return pickle.load(f)
    except Exception as e:
        print(f"❌ Failed to load {folder_name}/{file_name}: {e}")
        return None

# These must match exactly what you named the files in the previous steps!
models['crop_pred']  = load_model("crop_prediction", "filetest2.pkl")
models['crop_rec']   = load_model("crop_recommendation", "crop_recommendation_model.pkl")
models['fert_rec']   = load_model("fertilizer_recommendation", "fertilizer_model.pkl") 
models['rain_pred']  = load_model("rainfall_prediction", "rainfall_model.pkl")
models['yield_pred'] = load_model("yield_prediction", "yield_model.pkl")


# ==========================================
# 3. DEFINE INPUT SCHEMAS
# ==========================================
class CropPredictionInput(BaseModel):
    state: str
    district: str
    season: str

class CropRecommendationInput(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class FertilizerRecommendationInput(BaseModel):
    temperature: float
    humidity: float
    soil_moisture: float
    soil_type: str
    crop_type: str
    nitrogen: float
    potassium: float
    phosphorus: float

class RainfallPredictionInput(BaseModel):
    region: str
    month: str

class YieldPredictionInput(BaseModel):
    state: str
    district: str
    season: str
    crop: str
    area: float


# ==========================================
# 4. API ENDPOINTS
# ==========================================

@app.get("/")
@app.get("/health")
def health_check():
    return {"status": "KrishiNiti ML Engine is fully operational on Port 8000!"}

@app.post("/api/ml/crop-prediction")
def predict_crop(data: CropPredictionInput):
    if not models['crop_pred']:
        raise HTTPException(status_code=500, detail="Crop Prediction model not loaded.")
    try:
        # Format the input exactly how your custom script expects it: a list
        testing_data = [data.state, data.district, data.season]
        
        # Use your custom classify function
        dt_model_final = models['crop_pred']
        counts = classify(testing_data, dt_model_final)
        
        # Extract the highest probability crop from the dictionary
        predicted_crop = max(counts, key=counts.get)
        
        # Optional: You can also return the full percentage breakdown!
        probabilities = print_leaf(counts)

        return {
            "success": True, 
            "prediction": predicted_crop,
            "details": probabilities
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/ml/crop-recommendation")
def recommend_crop(data: CropRecommendationInput):
    if not models['crop_rec']:
        raise HTTPException(status_code=500, detail="Crop Recommendation model not loaded.")
    try:
        # The model expects an array of exactly 7 features in this specific order
        user_input = np.array([[data.nitrogen, data.phosphorus, data.potassium, 
                                data.temperature, data.humidity, data.ph, data.rainfall]])
        prediction = models['crop_rec'].predict(user_input)
        return {"success": True, "prediction": str(prediction[0])}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/ml/fertilizer-recommendation")
def recommend_fertilizer(data: FertilizerRecommendationInput):
    if not models['fert_rec']:
        raise HTTPException(status_code=500, detail="Fertilizer model not loaded.")
    try:
        dtc_model = models['fert_rec']["model"]
        le_soil = models['fert_rec']["le_soil"]
        le_crop = models['fert_rec']["le_crop"]

        # Transform text to numerical classes
        soil_enc = le_soil.transform([data.soil_type])[0]
        crop_enc = le_crop.transform([data.crop_type])[0]

        # Order must match the training data layout
        user_input = [[data.temperature, data.humidity, data.soil_moisture, 
                       soil_enc, crop_enc, data.nitrogen, data.potassium, data.phosphorus]]
        
        prediction = dtc_model.predict(user_input)
        return {"success": True, "prediction": str(prediction[0])}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/ml/rainfall-prediction")
def predict_rainfall(data: RainfallPredictionInput):
    if not models['rain_pred']:
        raise HTTPException(status_code=500, detail="Rainfall model not loaded.")
    try:
        lookup_table = models['rain_pred']
        
        # Ensure exact formatting (uppercase) to match the dictionary keys
        region_key = data.region.upper()
        month_key = data.month.upper()
        
        if region_key not in lookup_table or month_key not in lookup_table[region_key]:
            raise ValueError(f"Data not found for Region: '{region_key}', Month: '{month_key}'.")
            
        predicted_rain = lookup_table[region_key][month_key]
        
        if pd.isna(predicted_rain):
            predicted_rain = 0.0
            
        return {"success": True, "prediction": float(predicted_rain)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/ml/yield-prediction")
def predict_yield(data: YieldPredictionInput):
    if not models['yield_pred']:
        raise HTTPException(status_code=500, detail="Yield Prediction model not loaded.")
    try:
        rf_model = models['yield_pred']["model"]
        ohe = models['yield_pred']["ohe"]

        # Prepare categorical variables
        cat_input = np.array([[data.state, data.district, data.season, data.crop]])
        cat_encoded = ohe.transform(cat_input)

        # Prepare numerical variables
        num_input = np.array([[data.area]])

        # Combine them horizontally
        user_input_final = np.hstack((cat_encoded, num_input))
        
        prediction = rf_model.predict(user_input_final)
        return {"success": True, "prediction": float(prediction[0])}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)