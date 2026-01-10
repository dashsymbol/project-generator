import os
import google.generativeai as genai

def test_model():
    api_key = 'AIzaSyBXq39RG01EacvMmOZhA6KgBy1oLMEornY'
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment.")
        return

    print(f"Using API Key: {api_key[:5]}...{api_key[-5:]}")

    genai.configure(api_key=api_key)
    model_name = 'gemma-3-27b-it' 
    # Or 'gemini-2.0-flash-lite' if you want to switch back to that for testing

    print(f"Initializing model: {model_name}")
    try:
        model = genai.GenerativeModel(model_name)
        
        prompt = "Hello! Please confirm you are working with a LONG haiku."
        print(f"Sending prompt: '{prompt}'")
        
        response = model.generate_content(prompt)
        
        print("\n--- Response Received ---")
        print(response.text)
        print("-------------------------")
        
    except Exception as e:
        print(f"\nError occurred: {e}")

if __name__ == "__main__":
    test_model()
