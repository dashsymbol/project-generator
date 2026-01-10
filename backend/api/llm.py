import os
import json
import logging
import time
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, InternalServerError, ServiceUnavailable
from django.conf import settings

# Updated Schemas matching new Models (Kept same as before)
CLIENT_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "name": {"type": "STRING"},
        "client_type": {"type": "STRING"},
        "industry": {"type": "STRING"},
        "summary": {"type": "STRING"},
        "what_they_do": {"type": "STRING"},
        "target_audience": {"type": "STRING"},
        "primary_need": {"type": "STRING"},
        "preferences": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "dislikes": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "communication_style": {"type": "STRING"},
        "decision_style": {"type": "STRING"},
        "constraints": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "success_definition": {"type": "STRING"}
    },
    "required": ["name", "industry", "summary", "primary_need", "success_definition"]
}

PROJECT_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "title": {"type": "STRING"},
        "category": {"type": "STRING"},
        "subcategory": {"type": "STRING"},
        "objective": {"type": "STRING"},
        "basic_details": {"type": "STRING"},
        "client_criteria": {
            "type": "OBJECT",
            "properties": {
                "technical": {"type": "ARRAY", "items": {"type": "STRING"}},
                "business": {"type": "ARRAY", "items": {"type": "STRING"}}
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
        "resources_provided": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "resources_excluded": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
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
        "evaluation_criteria_creative": {
             "type": "ARRAY",
             "items": {"type": "STRING"}
        },
        "evaluation_criteria_technical": {
             "type": "ARRAY",
             "items": {"type": "STRING"}
        },
        "tone_rules": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "scope_included": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "scope_excluded": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        }
    },
    "required": ["title", "objective", "basic_details", "deliverables", "requirements", "scope_included"]
}

logger = logging.getLogger('api')

class LLMService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(
                'gemma-3-27b-it'
            )
        else:
            self.model = None

    def generate_project(self, category, answers):
        if not self.model:
            logger.warning("No GEMINI_API_KEY found, using stub.")
            return self._generate_stub(category, answers)

        logger.info(f"Generating project for category: {category}")
        
        # 1. Generate Client
        client_data = self._call_gemini(
            system_prompt=(
                "You are an expert creative director. Generate a detailed fictitious client profile. "
                "CRITICAL: You MUST use the 'User Questionnaire Answers' below to tailor this profile. "
                "The user's input dictates the specific needs, industry, and preferences of this client. "
                "Do not ignore their specific text inputs."
            ),
            user_prompt=f"Category: {category}\n\nUSER QUESTIONNAIRE ANSWERS:\n{json.dumps(answers, indent=2)}",
            schema=CLIENT_SCHEMA
        )

        # 2. Generate Project
        project_data = self._call_gemini(
            system_prompt=(
                "You are an expert project manager. Create a detailed creative brief for the following client. "
                "CRITICAL: The 'User Questionnaire Answers' are the MOST IMPORTANT source of truth. "
                "If the user specified constraints, preferences, or details in their answers, you MUST incorporate them into the brief. "
                "Be specific with deliverables and scope based on their input."
            ),
            user_prompt=f"Category: {category}\n\nClient Profile: {json.dumps(client_data)}\n\nUSER QUESTIONNAIRE ANSWERS:\n{json.dumps(answers, indent=2)}",
            schema=PROJECT_SCHEMA
        )
        
        project_data["category"] = category
        project_data["source_answers"] = answers
        project_data["status"] = "DRAFT"

        return client_data, project_data

    def _call_gemini(self, system_prompt, user_prompt, schema, max_retries=3):
        # Gemma-3-27b-it does NOT support native JSON mode / constrained decoding via API yet (Error 400).
        # We must prompt for JSON and parse it manually.
        
        # Convert schema to string for prompt inclusion
        schema_json = json.dumps(schema, indent=2)
        
        # Enhanced prompt for JSON adherence
        full_prompt = (
            f"{system_prompt}\n\n"
            f"STRICT OUTPUT INSTRUCTION: You must output strictly valid JSON matching the following schema:\n"
            f"{schema_json}\n\n"
            f"Do not output markdown formatting like ```json ... ```. Just the raw JSON string.\n\n"
            f"USER REQUEST:\n{user_prompt}"
        )
        
        # No JSON enforcement in config for Gemma-3
        generation_config = genai.GenerationConfig()

        delay = 5  # Initial delay
        
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(
                    full_prompt,
                    generation_config=generation_config
                )
                text = response.text
                
                # Cleanup potential markdown code blocks
                lines = text.splitlines()
                if lines and lines[0].strip().startswith("```"):
                   lines = lines[1:]
                if lines and lines[-1].strip().startswith("```"):
                   lines = lines[:-1]
                text = "\n".join(lines).strip()
                
                # Cleanup simpler markdown if splitlines didn't catch it (e.g. inline)
                if text.startswith("```json"): text = text[7:]
                elif text.startswith("```"): text = text[3:]
                if text.endswith("```"): text = text[:-3]
                text = text.strip()

                logger.debug(f"Gemini response: {text}")
                return json.loads(text)
                
            except json.JSONDecodeError as e:
                logger.warning(f"JSON Decode Error (attempt {attempt + 1}/{max_retries}): {e}. Retrying...")
                # Could add a "fix it" prompt here, but for now simple retry or fail
                time.sleep(delay)
                
            except ResourceExhausted as e:
                logger.warning(f"Quota exceeded (attempt {attempt + 1}/{max_retries}). Waiting {delay}s...")
                time.sleep(delay)
                delay *= 2
                if delay > 60: delay = 60
                
            except (InternalServerError, ServiceUnavailable) as e:
                 logger.warning(f"Service error ({e}) (attempt {attempt + 1}/{max_retries}). Retrying in {delay}s...")
                 time.sleep(delay)
                 delay *= 2

            except Exception as e:
                logger.error("Gemini generation failed with non-retriable error", exc_info=True)
                raise
        
        raise Exception("Max retries exceeded for Gemini generation")
        
        raise Exception("Max retries exceeded for Gemini generation")

    def _generate_stub(self, category, answers):
        client_data = {
            "name": "Acme Stub Corp",
            "industry": "Tech",
            "summary": "Stubbed client.",
            "primary_need": "Testing",
            "success_definition": "It works"
        }
        
        project_data = {
            "title": f"Stub Project for {category}",
            "category": category,
            "objective": "Verify API",
            "basic_details": "N/A",
            "deliverables": [],
            "requirements": {"must_include": [], "must_avoid": []},
            "scope_included": [],
            "source_answers": answers
        }
        return client_data, project_data
