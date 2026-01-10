# agent.md
Build Instructions for the Creative Project Generator MVP (React + Django + SQLite + Gemini)

## 1. Product Intent
A web application that generates a fictitious client and a structured creative project brief based on:
1. A selected project category
2. A configurable “about you” questionnaire loaded from a local config file

The system is optimized for simplicity and speed of implementation.

## 2. MVP Scope (v1.0)
### 2.1 Included
1. Landing page (desktop first)
2. Project listing (current projects) with a primary action button: Create New Project
3. Create New Project flow
   1. Step 1: Select project category
   2. Step 2: Answer “about you” questions (loaded from local config)
   3. Step 3: Generate
      1. Client object
      2. Project object containing description and requirements
4. Persistence using SQLite (Django ORM)
5. Minimal UI, minimal styling, functional forms

### 2.2 Out of Scope
1. Login, accounts, authentication, authorization
2. Progress tracking, analytics dashboards, scoring workflows
3. Collaboration, roles, admin panels
4. Advanced UI components, mobile first layouts, animations
5. PDF export (assumed out of scope for v1.0)

## 3. Core User Flow
1. User opens landing page
2. User sees a list of previously generated projects
3. User clicks Create New Project
4. User selects a category
5. User completes the questionnaire
6. User triggers generation
7. System creates and persists:
   1. Client
   2. Project linked to that client
8. User returns to listing and can open a project detail view

## 4. Categories (MVP)
Use a small fixed set for simplicity:
1. Branding
2. UI Design
3. Packaging

Categories must be stored as constants in backend and frontend to keep the UI stable.

## 5. Data Persistence Strategy
SQLite via Django ORM.

Rationale:
1. No external services required
2. Simple migration path to PostgreSQL later
3. Supports structured relational storage for Clients and Projects

## 6. Data Model (Django)
### 6.1 Models
1. Client
   1. id (UUID)
   2. name (text)
   3. client_type (text)
   4. industry (text)
   5. summary (text)
   6. what_they_do (text)
   7. target_audience (text)
   8. primary_need (text)
   9. preferences (JSON list)
   10. dislikes (JSON list)
   11. communication_style (text)
   12. decision_style (text)
   13. constraints (JSON list)
   14. success_definition (text)
   15. created_at (datetime)
2. Project
   1. id (UUID)
   2. client (FK to Client)
   3. category (text)
   4. subcategory (text)
   5. title (text)
   6. objective (text)
   7. basic_details (text)
   8. client_criteria (JSON object)
   9. requirements (JSON object - must_include, must_avoid)
   10. resources_provided (JSON list)
   11. resources_excluded (JSON list)
   12. deliverables (JSON list of objects)
   13. evaluation_criteria_creative (JSON list)
   14. evaluation_criteria_technical (JSON list)
   15. tone_rules (JSON list)
   16. scope_included (JSON list)
   17. scope_excluded (JSON list)
   18. user_defined_deadline (datetime)
   19. status (Enum: DRAFT, IN_PROGRESS, DELIVERED, APPROVED, REJECTED)
   20. approval_log (JSON list)
   21. source_answers (JSON object)
   22. created_at (datetime)
3. UserSkillProfile
   1. user (FK)
   2. skills (JSON list)
   3. skill_level (Enum)
   4. preferred_tools (JSON list)
   5. excluded_tools (JSON list)
4. LearningOption
   1. project_category (text)
   2. suggested_tool_or_skill (text)
   3. reason_for_suggestion (text)
   4. learning_resource_link (text)
   5. is_optional (boolean)

### 6.2 Notes
1. JSON fields are stored using Django JSONField (SQLite supported)
2. UUIDs reduce collision risk and simplify client side routing
3. created_at is required for listing order

## 7. API Contract (Django REST)
Base path: /api

### 7.1 Endpoints
1. GET /api/config/questionnaire
   1. Returns the questionnaire definition loaded from a local file
2. GET /api/projects
   1. Returns list of projects for the landing page
   2. Include fields: project id, title, category, client name, created_at
3. GET /api/projects/{id}
   1. Returns full project + client payload
4. POST /api/projects/generate
   1. Input: category + questionnaire answers
   2. Output: created project + client

### 7.2 POST /api/projects/generate payload
Request JSON:
{
  "category": "Branding",
  "answers": {
    "question_key_1": "value",
    "question_key_2": "value"
  }
}

Response JSON:
{
  "client": { ... },
  "project": { ... }
}

## 8. Questionnaire Config File
### 8.1 Location
Store in backend repo to avoid frontend rebuild requirements:
backend/config/questionnaire.json

### 8.2 Format (proposed)
{
  "version": "1.0",
  "title": "About You",
  "questions": [
    {
      "key": "skill_level",
      "label": "Skill level in this category",
      "type": "select",
      "required": true,
      "options": ["Beginner", "Intermediate", "Operational"]
    },
    {
      "key": "time_budget_hours",
      "label": "Time budget in hours",
      "type": "number",
      "required": true,
      "min": 1,
      "max": 40
    },
    {
      "key": "tooling",
      "label": "Preferred tools",
      "type": "multi_select",
      "required": false,
      "options": ["Figma", "Canva", "Adobe Illustrator", "Adobe Photoshop"]
    },
    {
      "key": "style_preference",
      "label": "Style preference",
      "type": "text",
      "required": false,
      "max_length": 200
    }
  ]
}

### 8.3 Backend Behavior
1. Endpoint returns config file content
2. Backend validates incoming answers against config
3. Unknown keys are rejected or ignored consistently (choose one behavior and document it)

## 9. LLM Integration (Google Gemma-3 API)
### 9.1 Call Strategy
Two calls are permitted:
1. Call A generates Client JSON
2. Call B generates Project JSON using:
   1. Category
   2. Answers
   3. Client JSON from Call A

### 9.2 Output Contract
Strict JSON only.
No markdown.
No prose outside JSON.
If output violates schema, retry with a corrective prompt.

### 9.3 Client JSON Schema (v2.0)
{
  "name": "string",
  "client_type": "string",
  "industry": "string",
  "summary": "string",
  "what_they_do": "string",
  "target_audience": "string",
  "primary_need": "string",
  "preferences": ["string"],
  "dislikes": ["string"],
  "communication_style": "string",
  "decision_style": "string",
  "constraints": ["string"],
  "success_definition": "string"
}

### 9.4 Project JSON Schema (v2.0)
{
  "title": "string",
  "category": "string",
  "subcategory": "string",
  "objective": "string",
  "basic_details": "string",
  "client_criteria": { "technical": [], "business": [] },
  "requirements": {
    "must_include": ["string"],
    "must_avoid": ["string"]
  },
  "resources_provided": ["string"],
  "resources_excluded": ["string"],
  "deliverables": [
    {
      "name": "string",
      "format": "string",
      "quantity": "number",
      "notes": "string"
    }
  ],
  "evaluation_criteria_creative": ["string"],
  "evaluation_criteria_technical": ["string"],
  "tone_rules": ["string"],
  "scope_included": ["string"],
  "scope_excluded": ["string"]
}

### 9.5 Tone Rules
All generated text must be:
1. Technical
2. Impersonal
3. Neutral
4. Non motivational
5. Equivalent to client documentation or creative consultancy language

### 9.6 Prompting Requirements
Each call must include:
1. Instruction to output strict JSON only
2. Explicit JSON schema
3. Category and answers context
4. Impersonal tone constraint

### 9.7 Validation and Retries
1. Parse JSON
2. Validate required keys exist
3. Validate types
4. Validate arrays non empty where required
5. If invalid:
   1. Retry once with a “fix JSON to match schema” prompt including the invalid output
   2. If still invalid, return 502 with a structured error payload

### 9.8 Cost Control
1. Set max tokens per call
2. Use a moderate temperature
3. Log prompt and response length server side for debugging

## 10. Backend Architecture (Django)
### 10.1 Structure
backend/
  manage.py
  app/
    settings.py
    urls.py
  api/
    views.py
    serializers.py
    models.py
    llm.py
  config/
    questionnaire.json

### 10.2 LLM Module
api/llm.py responsibilities:
1. Build prompts
2. Call Gemma-3 API (gemma-3-27b-it)
3. Validate JSON outputs
4. Return Python dict objects to the view layer

### 10.3 Environment Variables
Required:
1. GEMINI_API_KEY
Optional:
1. GEMINI_MODEL (default to gemma-3-27b-it)
2. GEMINI_TEMPERATURE
3. GEMINI_MAX_TOKENS

## 11. Frontend Architecture (React)
### 11.1 Pages
1. LandingPage
   1. Fetch GET /api/projects
   2. Render table list
   3. Create New Project button
2. CreateProjectPage
   1. Stepper UI (minimal)
   2. Step 1 category selection
   3. Step 2 dynamic form generated from GET /api/config/questionnaire
   4. Step 3 submit POST /api/projects/generate
3. ProjectDetailPage
   1. Fetch GET /api/projects/{id}
   2. Render client and project sections

### 11.2 UI Requirements
1. Desktop first layout
2. Simple styling using plain CSS or minimal utility library
3. No authentication states
4. Errors rendered as plain text blocks

## 12. Listing Page Requirements (assumed for v1.0)
Show columns:
1. Project title
2. Category
3. Client name
4. Created date

Ordering:
1. Most recent first

## 13. Error Handling Contract
Backend error response shape:
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object optional"
  }
}

Frontend behavior:
1. Display message
2. Provide a retry button for generation failures

## 14. Security Constraints (v1.0)
1. No user authentication implies no per user data isolation
2. Do not expose GEMINI_API_KEY to frontend
3. Implement basic request size limits for POST /generate
4. Implement CORS to allow only the frontend origin in development and production

## 15. Testing Requirements
### 15.1 Backend
1. Unit tests for JSON schema validation
2. Tests for questionnaire validation
3. Mock Gemini calls

### 15.2 Frontend
1. Minimal smoke test
2. Manual test checklist is acceptable for v1.0

## 16. Acceptance Criteria (v1.0)
1. Landing page loads with zero projects on fresh DB without errors
2. Create New Project flow completes end to end
3. Generated client and project are persisted in SQLite
4. After generation, landing page lists the new project
5. Project detail view renders all generated sections
6. Questionnaire is loaded from local config via backend endpoint
7. Gemini key never appears in client side code

## 17. Local Development Runbook
### 17.1 Backend
1. Create virtual environment
2. Install dependencies
3. Configure GEMINI_API_KEY
4. Run migrations
5. Start Django server

### 17.2 Frontend
1. Install dependencies
2. Configure API base URL
3. Start React dev server

## 18. Deployment (minimal)
1. Backend deployed as a single Django service
2. Frontend deployed as static build served by a simple web server
3. SQLite persistence requires a persistent disk volume, or migrate to PostgreSQL for production

## 19. Known Open Decisions
1. Final questionnaire questions and validation rules
2. Final Gemma model name and token limits
3. Whether PDF export is needed in a later phase