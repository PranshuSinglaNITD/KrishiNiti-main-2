import pandas as pd
import pickle

print("⏳ Calculating Rainfall Averages...")
df = pd.read_csv('rainfall_in_india_1901-2015.csv')

# Calculate the mean for every state and every month upfront
months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
rainfall_lookup = {}

for state in df['SUBDIVISION'].unique():
    state_data = df[df['SUBDIVISION'] == state]
    rainfall_lookup[state] = {}
    for month in months:
        rainfall_lookup[state][month] = state_data[month].mean()

# Save the precomputed averages dictionary
with open('rainfall_model.pkl', 'wb') as f:
    pickle.dump(rainfall_lookup, f)

print("✅ Saved 'rainfall_model.pkl' (Precomputed lookup table!)")