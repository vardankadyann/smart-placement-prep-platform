import google.generativeai as genai

API_KEY = API_KEY = "AQ.Ab8RN6IEpiSdF1B0qfXRyKQSh852Ev6x2qM9F0H6ByMyo36ig"

genai.configure(api_key=API_KEY)

print("Listing available models...\n")

for model in genai.list_models():
    print(model.name)
    print("Methods:", model.supported_generation_methods)
    print("-" * 50)