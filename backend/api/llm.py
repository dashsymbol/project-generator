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

SKILL_PROFILE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "skill_level": {
            "type": "STRING",
            "enum": ["BASIC", "INTERMEDIATE", "ADVANCED"]
        },
        "skills": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "preferred_tools": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "excluded_tools": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        }
    },
    "required": ["skill_level", "skills", "preferred_tools"]
}

PROMPTS = {
    "en": {
        "client_system": (
            "You are an expert at creating realistic, engaging project scenarios for skill development. "
            "Your job is to INVENT a fictitious client with a specific project need. "
            "CRITICAL INSTRUCTIONS:\n"
            "1. Look at the USER SKILL PROFILE to see what skills the user has (e.g., Python, React, Figma).\n"
            "2. Based on their skills, INVENT a realistic client who would hire someone with those skills.\n"
            "3. The client should have a SPECIFIC, interesting project need that matches the user's abilities.\n"
            "4. Consider the PROJECT TYPE preference:\n"
            "   - 'surprise': Be creative, pick something unexpected but achievable.\n"
            "   - 'practical': A real-world tool they could actually use.\n"
            "   - 'learning': Focused on teaching a new concept or pattern.\n"
            "   - 'portfolio': Something impressive they can show off.\n"
            "   - 'fun': A game, creative project, or something enjoyable.\n"
            "5. Make the client's needs detailed and specific."
        ),
        "client_user": "Generate a client for this user:{context}",
        "project_system": (
            "You are an expert project manager. Create a detailed, actionable project brief. "
            "The client profile was just generated - now create the corresponding project. "
            "CRITICAL INSTRUCTIONS:\n"
            "1. The project should match the client's needs EXACTLY.\n"
            "2. Tailor deliverables to the USER'S SKILLS from their profile.\n"
            "3. Match the DIFFICULTY LEVEL (Basic=simple features, Advanced=complex architecture).\n"
            "4. Scope it to fit the TIME BUDGET.\n"
            "5. Be SPECIFIC with deliverables (e.g., 'Python Flask API with 3 endpoints', not 'an API').\n"
            "6. Include concrete acceptance criteria.\n"
            "7. Make it challenging but achievable - push them slightly beyond their comfort zone."
        ),
        "project_user": "Client Profile: {client_data}{context}",
        "skill_system": (
            "You are an expert career advisor and skill assessor. "
            "Analyze the user's description of their goals, interests, and current abilities. "
            "Generate a skill profile that accurately reflects their level and interests.\n\n"
            "INSTRUCTIONS:\n"
            "1. Determine skill_level based on their description:\n"
            "   - BASIC: Beginner, just starting, learning fundamentals\n"
            "   - INTERMEDIATE: Some experience, comfortable with basics, building projects\n"
            "   - ADVANCED: Expert, deep knowledge, professional experience\n"
            "2. List relevant skills they mentioned or should learn (be specific, e.g., 'React' not just 'JavaScript')\n"
            "3. Suggest 2-4 preferred_tools that match their skills and goals\n"
            "4. Leave excluded_tools empty (user will add if needed)\n"
            "5. Be practical and realistic - don't overwhelm beginners with too many skills"
        ),
        "skill_user": "User's description: {user_input}"
    },
    "es": {
        "client_system": (
            "Eres un experto creando escenarios de proyectos realistas y atractivos para el desarrollo de habilidades. "
            "Tu trabajo es INVENTAR un cliente ficticio con una necesidad de proyecto específica. "
            "INSTRUCCIONES CRÍTICAS:\n"
            "1. Mira el PERFIL DE HABILIDADES DEL USUARIO para ver qué habilidades tiene (ej. Python, React, Figma).\n"
            "2. Basado en sus habilidades, INVENTA un cliente realista que contrataría a alguien con esas habilidades.\n"
            "3. El cliente debe tener una necesidad de proyecto ESPECÍFICA e interesante que coincida con las capacidades del usuario.\n"
            "4. Considera la preferencia de TIPO DE PROYECTO:\n"
            "   - 'surprise': Sé creativo, elige algo inesperado pero alcanzable.\n"
            "   - 'practical': Una herramienta del mundo real que realmente puedan usar.\n"
            "   - 'learning': Enfocado en enseñar un nuevo concepto o patrón.\n"
            "   - 'portfolio': Algo impresionante que puedan presumir.\n"
            "   - 'fun': Un juego, proyecto creativo o algo disfrutable.\n"
            "5. Haz que las necesidades del cliente sean detalladas y específicas.\n"
            "IMPORTANTE: Genera todo el contenido en ESPAÑOL."
        ),
        "client_user": "Genera un cliente para este usuario:{context}",
        "project_system": (
            "Eres un experto gerente de proyectos. Crea un resumen de proyecto detallado y accionable. "
            "El perfil del cliente acaba de ser generado - ahora crea el proyecto correspondiente. "
            "INSTRUCCIONES CRÍTICAS:\n"
            "1. El proyecto debe coincidir EXACTAMENTE con las necesidades del cliente.\n"
            "2. Adapta los entregables a las HABILIDADES DEL USUARIO de su perfil.\n"
            "3. Coincide con el NIVEL DE DIFICULTAD (Básico=características simples, Avanzado=arquitectura compleja).\n"
            "4. AJÚSTALO para que quepa en el PRESUPUESTO DE TIEMPO.\n"
            "5. Sé ESPECÍFICO con los entregables (ej. 'API Python Flask con 3 endpoints', no 'una API').\n"
            "6. Incluye criterios de aceptación concretos.\n"
            "7. Hazlo desafiante pero alcanzable - empújalos un poco más allá de su zona de confort.\n"
            "IMPORTANTE: Genera todo el contenido en ESPAÑOL."
        ),
        "project_user": "Perfil del Cliente: {client_data}{context}",
        "skill_system": (
            "Eres un experto asesor de carreras y evaluador de habilidades. "
            "Analiza la descripción del usuario sobre sus metas, intereses y habilidades actuales. "
            "Genera un perfil de habilidades que refleje con precisión su nivel e intereses.\n\n"
            "INSTRUCCIONES:\n"
            "1. Determina skill_level basado en su descripción:\n"
            "   - BASIC: Principiante, empezando, aprendiendo fundamentos\n"
            "   - INTERMEDIATE: Experiencia media, cómodo con lo básico, construyendo proyectos\n"
            "   - ADVANCED: Experto, conocimiento profundo, experiencia profesional\n"
            "2. Enumera habilidades relevantes que mencionaron o deberían aprender (sé específico, ej. 'React' no solo 'JavaScript')\n"
            "3. Sugiere 2-4 preferred_tools que coincidan con sus habilidades y metas\n"
            "4. Deja excluded_tools vacío (el usuario lo agregará si es necesario)\n"
            "5. Sé práctico y realista - no abrumes a los principiantes con demasiadas habilidades.\n"
            "IMPORTANTE: Genera todo el contenido en ESPAÑOL (excepto los valores de enum como BASIC/INTERMEDIATE/ADVANCED)."
        ),
        "skill_user": "Descripción del usuario: {user_input}"
    }
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

    def _get_prompts(self, language="en"):
        # Fallback to English if language not supported
        lang = language if language in PROMPTS else "en"
        return PROMPTS[lang]

    def generate_project(self, category, answers, profile_data=None, difficulty=None, focus_area=None, language="en"):
        if not self.model:
            logger.warning("No GEMINI_API_KEY found, using stub.")
            return self._generate_stub(category, answers, language=language)

        prompts = self._get_prompts(language)

        # Extract selection-based fields from answers
        time_budget = answers.get("time_budget_hours", 10)
        project_type = answers.get("project_type", "surprise")  # surprise, practical, learning, portfolio, fun

        logger.info(f"Generating {project_type} project for user with difficulty {difficulty} (Lang: {language})...")
        
        # Prepare Context String
        adaptive_context = f"\nDIFFICULTY LEVEL: {difficulty or 'INTERMEDIATE'}"
        adaptive_context += f"\nTIME BUDGET: {time_budget} hours"
        adaptive_context += f"\nPROJECT TYPE: {project_type}"
        if profile_data:
            adaptive_context += f"\nUSER SKILL PROFILE:\n{json.dumps(profile_data, indent=2)}"

        # 1. Generate Client AND Project Topic (AI invents both)
        client_data = self._call_gemini(
            system_prompt=prompts["client_system"],
            user_prompt=prompts["client_user"].format(context=adaptive_context),
            schema=CLIENT_SCHEMA
        )

        # 2. Generate Project Brief based on the invented client
        project_data = self._call_gemini(
            system_prompt=prompts["project_system"],
            user_prompt=prompts["project_user"].format(client_data=json.dumps(client_data), context=adaptive_context),
            schema=PROJECT_SCHEMA
        )
        
        # Infer category from skills
        inferred_category = self._infer_category("", profile_data)
        project_data["category"] = inferred_category
        project_data["source_answers"] = answers
        project_data["status"] = "DRAFT"

        return client_data, project_data

    def _infer_category(self, description, profile_data):
        """Simple category inference based on keywords"""
        desc_lower = description.lower()
        skills = profile_data.get("skills", []) if profile_data else []
        skills_lower = [s.lower() for s in skills]
        
        if any(kw in desc_lower for kw in ["python", "cli", "api", "backend", "script"]) or "python" in skills_lower:
            return "Software Development"
        elif any(kw in desc_lower for kw in ["react", "frontend", "web", "dashboard", "html"]) or "react" in skills_lower:
            return "Web Development"
        elif any(kw in desc_lower for kw in ["logo", "branding", "design", "ui", "ux"]) or any(s in skills_lower for s in ["figma", "photoshop", "illustrator"]):
            return "Design"
        elif any(kw in desc_lower for kw in ["write", "blog", "content", "copy"]):
            return "Writing"
        else:
            return "General"


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

    def generate_skill_profile(self, user_input, language="en"):
        """
        Analyze user's goals/interests and generate skill profile suggestions.
        """
        if not self.model:
            logger.warning("No GEMINI_API_KEY found, using stub.")
            return {
                "skill_level": "INTERMEDIATE",
                "skills": ["Python", "JavaScript"],
                "preferred_tools": ["VSCode"],
                "excluded_tools": []
            }
        
        prompts = self._get_prompts(language)

        logger.info(f"Generating skill profile from user input: {user_input[:100]}... (Lang: {language})")

        result = self._call_gemini(
            system_prompt=prompts["skill_system"],
            user_prompt=prompts["skill_user"].format(user_input=user_input),
            schema=SKILL_PROFILE_SCHEMA
        )

        return result

    def _generate_stub(self, category, answers, language="en"):
        if language == "es":
            client_data = {
                "name": "Corporación Acme (Stub)",
                "industry": "Tecnología",
                "summary": "Cliente de prueba (Stub).",
                "primary_need": "Pruebas",
                "success_definition": "Funciona correctamente"
            }
            project_data = {
                "title": f"Proyecto de Prueba para {category}",
                "category": category,
                "objective": "Verificar API",
                "basic_details": "N/A",
                "deliverables": [],
                "requirements": {"must_include": [], "must_avoid": []},
                "scope_included": [],
                "source_answers": answers,
                "status": "DRAFT"
            }
        else:
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
                "source_answers": answers,
                "status": "DRAFT"
            }
        return client_data, project_data
