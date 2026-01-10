# Frontend Migration Audit (Alpha)

This document lists the complete functionality of the current `frontend_alpha` to ensure feature parity during the migration to the new design.

## 1. Landing Page / Dashboard (`/`)
-   **Display Projects**: Fetches and displays a list of projects from `/api/projects/`.
-   **Columns**: Title, Category, Client Name, Created Date.
-   **Empty State**: Shows a "Start by creating..." message if the list is empty.
-   **Loading State**: Shows "Loading projects..." while fetching.
-   **Status Badges**:
    -   **"GENERATING"**: Visually distinct yellow badge. Indicates backend is processing.
    -   Standard statuses (Draft, etc.) displayed in table.
-   **Auto-Refresh**: Polls `/api/projects/` every **10 seconds** to update statuses (e.g., waiting for "GENERATING" to finish).
-   **Navigation**:
    -   "+ Create New" button -> `/create`
    -   Clicking a project title -> `/projects/:id`

## 2. Create Project Page (`/create`)
-   **Step 1: Category Selection**:
    -   Hardcoded options: "Branding", "UI Design", "Packaging".
    -   Select to proceed to Step 2.
-   **Step 2: Dynamic Questionnaire**:
    -   Fetches configuration from `/api/config/questionnaire`.
    -   Renders form fields based on backend config (`text`, `number`, `select`, `multi_select`).
    -   **Validation**: Respects `required`, `min`, `max`, `max_length` attributes.
-   **Submission**:
    -   POST to `/api/projects/generate/`.
    -   **Async Handling**:
        -   Shows **Rich Spinner UI** ("✨ Generating...") for **5 seconds** post-success.
        -   Redirects to Dashboard (`/`) afterwards.
-   **Error Handling**: Displays error message if API fails.

## 3. Project Detail Page (`/projects/:id`)
-   **Data Display**:
    -   **Header**: Title, Category/Subcategory, Status Badge.
    -   **Project Overview**: Objective, Basic Details.
    -   **Scope**: Two columns for "Included" and "Excluded", using tag pills.
    -   **Deliverables**: List of items with Quantity, Format, and Notes.
    -   **Evaluation Criteria**: Split into Creative and Technical lists.
    -   **Client Profile (Sidebar)**: Name, Industry, Summary, "What they do", Primary Need.
    -   **Preferences/Dislikes**: Tag lists in sidebar.
-   **Async Polling**:
    -   If status is `GENERATING`:
        -   Shows full-screen Spinner UI ("✨ Generating...").
        -   Polls `/api/projects/:id` every **3 seconds**.
        -   Automatically reveals content when status changes.
-   **Error States**:
    -   "Project not found".
    -   "Generation Failed" (with link back to Home).

## 4. Technical / Global
-   **Environment**: Uses `VITE_API_BASE_URL` for API connection.
-   **Styling**:
    -   **Global Reset**: `index.css` resets body to full width/block layout.
    -   **Theme**: Light Gray background (`#f8f9fa`), White Cards, Dark Text (`#212529`).
    -   **Fonts**: System fonts (`-apple-system`, `Roboto`, etc.).
-   **Routing**: React Router DOM (`/`, `/create`, `/projects/:id`).
