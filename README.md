# Hirely AI: AI Resume Builder & Reviewer

**Hirely AI** is a professional career intelligence platform designed to bypass the "ATS black hole." It provides a high-fidelity simulation of how enterprise parsers see candidate data, coupled with smart editorial logic to transform weak resumes into quantifiable professional documents.

## Core Features

*   **ATS Simulation:** Strips CSS and layouts to reveal the "Bot View," flagging "ATS killers" like complex tables and non-standard text encodings.
*   **The XYZ Audit Engine:** Evaluates every bullet point against the Google-standard **XYZ formula**: *Accomplished [X] as measured by [Y], by doing [Z].*
*   **Strategic Keyword Mapping:** A weighted analyzer that bridges the gap between candidate content and target Job Descriptions.
*   **Intelligent Refactoring:** Generates clean, semantic, single-column HTML resumes optimized for 100% parse-rate.
*   **AI Career Advisor:** A persistent strategist (Gemini 3 Pro) for interview prep and industry pivot strategy.

## Tech Stack

*   **Core:** React 19, TypeScript.
*   **AI LLM:** Google Gemini 3 (Flash/Pro) via `@google/genai`.
*   **Styling:** Tailwind CSS, Lucide React icons.
*   **Security:** Multi-layer XSS Sanitization & strict CSP.

## Technical Highlights

### 1. Multi-Model Strategy
The app dynamically selects models based on task complexity:
- **Gemini 3 Flash:** Handles real-time audits and high-speed resume refactoring.
- **Gemini 3 Pro:** Reserved for the Career Chat to provide deep reasoning and context retention.

### 2. Security & Sanitization
To prevent XSS from AI-generated HTML, I implemented a defense-in-depth approach:
- **Sanitization Pipeline:** Every string passes through an aggressive regex-based sanitizer (`helpers/security.ts`) that strips `<script>`, `<iframe>`, and `on*` event handlers.
- **Strict CSP:** A restrictive Content Security Policy prevents unauthorized script execution.

### 3. Performance Design
Built with a **Zero-Build Architecture** using React 19 and ESM Import Maps. This removes the overhead of complex bundlers (like Webpack or Vite), enabling near-instant cold starts and a lightweight footprint.

### 4. Code Structure
The UI layer is strictly separated from domain logic for better maintainability:
- **`api/`**: Clean abstraction for LLM interactions.
- **`helpers/`**: Utilities for document generation and security.
- **`components/`**: Modular, atomic UI units.

## Setup

### Environment
The application requires a Google AI Studio API Key. Ensure it is accessible in your environment:
```bash
API_KEY=your_gemini_api_key_here
```

### Development
Since the project uses Import Maps, you can serve it via any static file server:
```bash
# Example
npx serve .
```