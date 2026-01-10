import os
import google.generativeai as genai
from django.conf import settings

# Setup Django to get env vars if needed, but os.environ should be enough if run in docker
# However, let's just use os.environ directly as .env is loaded by docker

api_key = os.environ.get("GEMINI_API_KEY")
print(f"Checking models using key: {api_key[:10]}...") 

genai.configure(api_key=api_key)

print("Available models:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
