import os
import sys
import django
from django.conf import settings

# Setup Django
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Assuming the script is in the root, pointing to backend
sys.path.append(os.path.join(BASE_DIR, 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.llm import LLMService

def verify_localization():
    service = LLMService()
    
    print("\n--- Testing English Generation (Stub) ---")
    client_en, project_en = service.generate_project(
        category="Web", 
        answers={"time_budget_hours": 10, "project_type": "learning"}, 
        language="en"
    )
    print(f"Client Name (EN): {client_en.get('name')}")
    print(f"Project Title (EN): {project_en.get('title')}")
    
    print("\n--- Testing Spanish Generation (Stub) ---")
    client_es, project_es = service.generate_project(
        category="Web", 
        answers={"time_budget_hours": 10, "project_type": "learning"}, 
        language="es"
    )
    print(f"Client Name (ES): {client_es.get('name')}")
    print(f"Project Title (ES): {project_es.get('title')}")

    if client_es.get('name') == "Corporación Acme (Stub)":
        print("\n✅ Spanish Localization Verified!")
    else:
        print("\n❌ Spanish Localization Failed!")

if __name__ == "__main__":
    verify_localization()
