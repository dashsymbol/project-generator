# Changelog: Async Generation, Styling, and Prompt Enhancements - 2026-01-09

## 1. Async Project Generation
- **Issue**: Project generation was timing out (SIGKILL) on the server due to fast-timeout configurations and long LLM generation times.
- **Solution**: Implemented threaded asynchronous generation.
    - **Backend**: `views.py` now spawns a background thread and returns immediately with status `GENERATING`.
    - **Models**: Added `GENERATING` and `FAILED` status choices to `Project` model.
    - **Frontend**: `CreateProjectPage` redirects to Dashboard after 5s. `LandingPage` calculates statuses. `ProjectDetailPage` polls for status updates until completion.

## 2. Styling & UX Improvements
- **Issue**: Layout was misaligned (left-stuck) and text contrast was poor (white-on-white).
- **Solution**: 
    - **Global Layout**: Reset `index.css` and `App.css` to allow full-width, clean block layout.
    - **Theme**: Applied a professional high-contrast light theme (Light Gray background `#f8f9fa`, White Cards, Dark Text `#212529`).
    - **Project List**: Added visual badges for "GENERATING", "DRAFT", etc.
    - **Detail Page**: Improved readability with distinct sections for Client Profile, Deliverables, and Scope.

## 3. LLM Integration Fixes
- **Model**: Switched to `gemma-3-27b-it` per user request.
- **JSON Mode**: Fixed `400 InvalidArgument` error by disabling strict API JSON mode (not supported by Gemma 3 yet) and implementing manual robust prompt-based JSON enforcement and parsing.
- **Schema**: Fixed `TypeError` by ensuring the LLM schema matches the Database model (removed `problem_statement`).
- **Input Adherence**: Updated LLM prompts to **critically emphasize** the user's questionnaire answers ("Context") to ensure generated projects strictly follow the user's input.

## 4. Dependencies
- Added `google-generativeai`.
