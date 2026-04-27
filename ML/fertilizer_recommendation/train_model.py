import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier
import pickle

print("⏳ Training Fertilizer Decision Tree...")
data = pd.read_csv("fertilizer_recommendation.csv")

# Train Encoders
le_soil = LabelEncoder()
data['Soil Type'] = le_soil.fit_transform(data['Soil Type'])

le_crop = LabelEncoder()
data['Crop Type'] = le_crop.fit_transform(data['Crop Type'])

# Split Data
X = data.iloc[:, :8]
y = data.iloc[:, -1]

# Train Model
dtc = DecisionTreeClassifier(random_state=0)
dtc.fit(X, y)

# Package the model AND both encoders into a single dictionary
artifacts = {
    "model": dtc,
    "le_soil": le_soil,
    "le_crop": le_crop
}

with open('fertilizer_model.pkl', 'wb') as f:
    pickle.dump(artifacts, f)

print("✅ Saved 'fertilizer_model.pkl' (Model + Encoders included!)")