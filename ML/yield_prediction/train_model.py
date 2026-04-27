import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
import pickle

print("⏳ Training Yield Random Forest...")
df = pd.read_csv("crop_production_karnataka.csv")
df = df.drop(['Crop_Year'], axis=1)

X = df.drop(['Production'], axis=1)
y = df['Production']

categorical_cols = ['State_Name', 'District_Name', 'Season', 'Crop']

# Train Encoder
ohe = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
X_categorical = ohe.fit_transform(X[categorical_cols])

X_final = np.hstack((X_categorical, X.drop(categorical_cols, axis=1).values))

# Train Model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_final, y)

# Package the model AND the OneHotEncoder
artifacts = {
    "model": model,
    "ohe": ohe
}

with open('yield_model.pkl', 'wb') as f:
    pickle.dump(artifacts, f)

print("✅ Saved 'yield_model.pkl' (Model + OneHotEncoder included!)")