# test_key.py
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"), http_options={'api_version': 'v1'})

print("Attempting to list available models...")
try:
    for m in client.models.list():
        print(f" - {m.name}")
except Exception as e:
    print(f"Error: {e}")