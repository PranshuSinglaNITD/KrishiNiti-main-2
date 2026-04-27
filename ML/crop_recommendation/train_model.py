import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

print("⏳ Loading dataset...")
# Make sure this path matches where your CSV is located!
dataset = pd.read_csv('Crop_recommendation.csv')

# Divide the dataset into features (X) and labels (y)
X = dataset.iloc[:, :-1].values
y = dataset.iloc[:, -1].values

print("🧠 Training Random Forest Classifier...")
# We use the exact same parameters you provided
classifier = RandomForestClassifier(n_estimators=10, criterion='entropy', random_state=0)

# We fit it on the entire dataset to make the final production model as accurate as possible
classifier.fit(X, y)

print("💾 Saving model to .pkl file...")
# Save the trained model
model_filename = 'crop_recommendation_model.pkl'
with open(model_filename, 'wb') as file:
    pickle.dump(classifier, file)

print(f"✅ Success! Model saved as '{model_filename}'")