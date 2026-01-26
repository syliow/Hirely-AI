# Hirely AI: Strategic Resume Auditor

Hirely AI is a performance-focused resume auditor and strategist. I built this to help candidates bypass the "ATS black hole" by providing a high-fidelity simulation of how enterprise parsers see their data, coupled with strategic refactoring based on executive recruiting standards.

## The Core Logic

Most resumes fail because they are either unparseable by machines or lack quantifiable impact. This app solves both:

1.  **ATS Simulation:** Performs raw text extraction to reveal what a bot actually sees (stripping layouts, tables, and graphics).
2.  **Strategic Analysis:** Uses Gemini 3 to audit content against the **XYZ Formula** (Accomplished [X] as measured by [Y], by doing [Z]).
3.  **Keyword Weighting:** Maps resume density against a Job Description (JD) to identify critical gaps.
4.  **Refactoring:** Generates a sanitized, single-column HTML document optimized for both human recruiters and machine parsers.

## Tech Stack & Architecture

*   **Frontend:** React 19 with Tailwind CSS for styling.
*   **Intelligence:** `@google/genai` (Gemini 3 Flash for audits/refactors, Pro for the strategic chat).
*   **Icons:** Lucide-React.
*   **Security:** Custom XSS sanitization pipeline and a strict Content Security Policy (CSP).

### Project Structure
- `api/`: Clean abstraction for LLM interactions.
- `components/`: Modular UI units (Criteria bars, highlighters, etc.).
- `helpers/`: Pure utility logic separated from React concerns:
    - `browser.ts`: Handles secure popups and file downloads.
    - `resume.ts`: Manages HTML templating and name parsing.
    - `security.ts`: Aggressive HTML sanitization for AI outputs.
    - `string.ts`: Cleaners for stripping LLM markdown artifacts.

## Setup

### 1. Environment Variables
You need a Google AI Studio API Key. The app expects it in your environment:

```bash
API_KEY=your_gemini_api_key_here
```

### 2. Dependencies
The project uses an import map in the HTML, so there's no complex build step required if you're serving it directly, but for local development:

```bash
npm install
# or just serve the directory if using a tool like Vite/Live Server
```

## Security Measures

AI-generated HTML can be a vector for XSS. To mitigate this:
*   Every string returned by the LLM passes through a `sanitizeHtml` helper that strips `<script>`, `<iframe>`, and `on*` event handlers.
*   The `index.html` implements a strict CSP meta tag to prevent unauthorized script execution or data exfiltration.
*   System instructions explicitly forbid the model from generating executable code.