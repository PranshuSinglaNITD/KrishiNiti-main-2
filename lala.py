import google.generativeai as genai

# Replace with your actual Gemini API key
API_KEY = "YOUR GEMINI_API_KEY"

genai.configure(api_key=API_KEY)

print("Fetching available models...\n")

# Loop through and list all models available to your account
for m in genai.list_models():
    # We filter for models that support text/content generation
    if 'generateContent' in m.supported_generation_methods:
        print(f"Model Name: {m.name}")
        print(f"Display Name: {m.display_name}")
        print(f"Input Token Limit: {m.input_token_limit}")
        print(f"Output Token Limit: {m.output_token_limit}")
        print("-" * 40)
