import os
import json
import logging
import google.generativeai as genai
from django.conf import settings

# Schemas for Structured Output

CLIENT_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "name": {"type": "STRING"},
        "summary": {"type": "STRING"},
        "target_audience": {"type": "STRING"},
        "primary_problem": {"type": "STRING"},
        "constraints": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "brand_voice": {"type": "STRING"},
        "success_definition": {"type": "STRING"}
    },
    "required": ["name", "summary", "target_audience", "primary_problem", "constraints"]
}

PROJECT_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "title": {"type": "STRING"},
        "objective": {"type": "STRING"},
        "problem_statement": {"type": "STRING"},
        "deliverables": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "name": {"type": "STRING"},
                    "format": {"type": "STRING"},
                    "quantity": {"type": "NUMBER"},
                    "notes": {"type": "STRING"}
                },
                "required": ["name", "format", "quantity"]
            }
        },
        "requirements": {
            "type": "OBJECT",
            "properties": {
                "must_include": {"type": "ARRAY", "items": {"type": "STRING"}},
                "must_avoid": {"type": "ARRAY", "items": {"type": "STRING"}}
            },
            "required": ["must_include", "must_avoid"]
        },
        "evaluation_criteria": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "criterion": {"type": "STRING"},
                    "description": {"type": "STRING"},
                    "weight": {"type": "NUMBER"},
                    "pass_threshold": {"type": "NUMBER"}
                },
                "required": ["criterion", "description", "weight", "pass_threshold"]
            }
        },
        "tone_rules": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        }
    },
    "required": ["title", "objective", "problem_statement", "deliverables", "requirements", "evaluation_criteria", "tone_rules"]
}

logger = logging.getLogger('api')

class LLMService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(
                'gemini-2.5-flash',
                generation_config={"response_mime_type": "application/json"}
            )
        else:
            self.model = None

    def generate_project(self, category, answers):
        if not self.model:
            # Fallback to stub if no key provided
            logger.warning("No GEMINI_API_KEY found, using stub.")
            return self._generate_stub(category, answers)

        logger.info(f"Generating project for category: {category}")
        
        # 1. Generate Client
        client_data = self._call_gemini(
            system_prompt="You are an expert creative director. Generate a fictitious client profile based on the user's context.",
            user_prompt=f"Category: {category}\nContext: {json.dumps(answers)}",
            schema=CLIENT_SCHEMA
        )

        # 2. Generate Project
        project_data = self._call_gemini(
            system_prompt="You are an expert project manager. Create a detailed creative brief for the following client.",
            user_prompt=f"Category: {category}\nClient Profile: {json.dumps(client_data)}\nContext: {json.dumps(answers)}",
            schema=PROJECT_SCHEMA
        )
        
        # Add metadata back
        project_data["category"] = category
        project_data["source_answers"] = answers

        return client_data, project_data

    def _call_gemini(self, system_prompt, user_prompt, schema):
        # Combining system and user prompt as older Gemini versions or specific integrations might prefer it, 
        # but 1.5 Flash supports system instructions. We'll use a combined prompt for simplicity/robustness if needed,
        # but here we can try the direct generation with schema enforcement.
        
        # Update generation config with the specific schema for this call
        generation_config = genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=schema
        )

        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        
        try:
            response = self.model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            
            logger.debug(f"Gemini response: {response.text}")
            return json.loads(response.text)
            
        except Exception as e:
            logger.error("Gemini generation failed", exc_info=True)
            raise

    def _generate_stub(self, category, answers):
        client_data = {
            "name": "Acme Stub Corp (No Gemini Key)",
            "summary": "This is a stub because GEMINI_API_KEY is missing.",
            "target_audience": "Developers",
            "primary_problem": "Missing credentials",
            "constraints": ["Configure .env"],
            "brand_voice": "Robotic",
            "success_definition": "Key added"
        }
        
        project_data = {
            "title": f"Stub Project for {category}",
            "category": category,
            "objective": "Verify API Key configuration",
            "problem_statement": "The system fallback was triggered.",
            "deliverables": [],
            "requirements": {"must_include": [], "must_avoid": []},
            "evaluation_criteria": [],
            "tone_rules": [],
            "source_answers": answers
        }
        return client_data, project_data
