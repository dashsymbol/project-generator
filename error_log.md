# User Feedback & Error Log

This document tracks errors, bugs, and user feedback encountered during the development process. Review this before starting new frontend work to avoid repeating mistakes.

## Localization & UI Issues

### 1. Duplicate Emojis
**Issue:** Emojis were appearing twice in the UI (e.g., "📋 📋 Project Overview").
**Cause:** Emojis were present in BOTH the React component code (hardcoded) AND the translation JSON files.
**Fix:** Removed emojis from the translation files (`en.js`, `es.js`) and kept them only in the code (or vice-versa, but consistency is key).
**Lesson:** Decide on a single source of truth for icons/emojis. Do not duplicate them in translations.

### 2. Layout Breakage on Language Change (Button Wrapping)
**Issue:** When switching to a language with longer text (e.g., Spanish), buttons and text elements would wrap unexpectedly, breaking the alignment.
**Cause:** Elements had default flex behavior allowing shrinking/wrapping, and the container width wasn't sufficient for the longer text.
**Fix:** Applied `white-space: nowrap` to buttons and critical text labels to enforce single-line display.
**Lesson:** Always test UI with longest relevant strings (e.g., German/Spanish). Use `white-space: nowrap` for buttons and navigation items that should not break.

### 3. Layout Breakage on Language Change (Header Squashing)
**Issue:** Preventing button wrapping caused the main Title to get squashed and wrap incorrectly (e.g., "Project \n Generator") when horizontal space ran out.
**Cause:** Flex container did not allow wrapping (`flex-wrap: nowrap` default) and the right-side elements were rigid (`white-space: nowrap`), forcing the left-side flexible element (Title) to shrink below its content width.
**Fix:** Enable `flex-wrap: wrap` on the main header container so content can stack vertically when horizontal space is insufficient.
**Lesson:** Responsive design requires `flex-wrap: wrap` for header containers with dynamic content length. Don't rely on fixed widths fitting everything.
