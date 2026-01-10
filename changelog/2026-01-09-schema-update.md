# Changelog: Model & Schema Update
**Date**: 2026-01-09

## Summary
Significant updates to the core data models (`Client`, `Project`) to support a more detailed and structured project generation workflow. Added two new models (`UserSkillProfile`, `LearningOption`) for personalization and learning pathways.

## Details

### 1. Database Models (`backend/api/models.py`)

#### Updated `Client` Model
- **Added**:
    - `client_type` (CharField)
    - `industry` (CharField)
    - `what_they_do` (TextField)
    - `primary_need` (TextField) - *Replaces `primary_problem`*
    - `preferences` (JSONField)
    - `dislikes` (JSONField)
    - `communication_style` (CharField)
    - `decision_style` (CharField)
- **Removed**:
    - `brand_voice` (Replaced/Refined by Comm style)
    - `primary_problem` (Renamed to Primary Need)

#### Updated `Project` Model
- **Added**:
    - `subcategory` (CharField)
    - `basic_details` (TextField)
    - `client_criteria` (JSONField)
    - `resources_provided` (JSONField) - *New structure*
    - `resources_excluded` (JSONField)
    - `evaluation_criteria_creative` (JSONField) - *Split from generic criteria*
    - `evaluation_criteria_technical` (JSONField) - *Split from generic criteria*
    - `scope_included` (JSONField)
    - `scope_excluded` (JSONField)
    - `user_defined_deadline` (DateTimeField)
    - `status` (Enum: DRAFT, IN_PROGRESS, DELIVERED, APPROVED, REJECTED)
    - `approval_log` (JSONField)
- **Removed**:
    - `evaluation_criteria` (Split into creative/technical)

#### New `UserSkillProfile` Model
- Tracks user skills, level (Basic/Intermediate/Advanced), and tool preferences.

#### New `LearningOption` Model
- Suggestions for tools/skills tied to project categories.

### 2. LLM Integration
- **Model Switch**: Switched to `gemma-3-27b-it` (User request).
- **Schema Update**: LLM generation schemas updated to match the new database structure (Work in Progress).

### 3. Frontend
- Updates pending to display new fields.
