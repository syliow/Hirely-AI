# Hirely AI: AI Resume Builder & Reviewer
<img width="1559" height="964" alt="hirelyAIimg" src="https://github.com/user-attachments/assets/d1e74842-0570-47ae-920d-1a8e4daa08b7" />


> ⚠️ **Note:** This application runs on the **Google Gemini Free Tier**.
> You may experience occasional rate limits or "Quota Exceeded" errors during peak usage.
> The application includes built-in rate limiting (30 requests/minute) to ensure fair access for all users.

**Hirely AI** is a professional career intelligence platform designed to bypass the "ATS black hole." It provides a high-fidelity simulation of how enterprise parsers see candidate data, coupled with smart editorial logic to transform weak resumes into quantifiable professional documents.

## Core Features

- **ATS Simulation:** Strips CSS and layouts to reveal the **"Raw Bot View"**, providing a precise "Parsing Health Score" and flagging layout risks (e.g., columns, graphics).
- **The XYZ Audit Engine:** Evaluates every bullet point against the Google-standard **XYZ formula**: _Accomplished [X] as measured by [Y], by doing [Z]._
- **Strategic Keyword Mapping:** A weighted analyzer that identifies Skill Gaps and matches your core competencies to target Job Descriptions.
- **Intelligent Refactoring:** Generates clean, semantic, single-column HTML resumes optimized for 100% parse-rate.
- **AI Career Advisor:** A "Friendly but Solid" career partner (powered by Gemma 3) for interview prep, powered by a structured "Critique -> Rewrite" logic.
- **Privacy-First Design:** Resumes are processed in memory and never stored permanently.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Frontend:** React 19, TypeScript
- **AI LLM:** **Google Gemma 3 (4B-IT)** via `@google/genai`
- **Styling:** Tailwind CSS (CDN), Lucide React icons
- **Security:** Multi-layer XSS Sanitization, strict CSP, rate limiting, input validation

## Technical Highlights

### 1. Specialized Prompt Engineering (Gemma 3 4B)

Instead of relying on massive models, Hirely AI proves that **smaller, faster models (4B)** can outperform giants when given structured guidance. We use a **"Rules-Based Execution"** prompt strategy:

- **Strict Protocol:** "Evaluate -> Critique -> Rewrite -> Check Missing Data".
- **Structured Output:** Forces the model to think in steps, ensuring high-quality advice without hallucination.
- **Zero-Truncation:** Explicit instructions guarantee full, actionable rewrites for every bullet point.

### 2. Rapid Analysis Architecture

- **Audit Engine:** Switched to **Gemma 3 4B-IT** for blazing-fast performance.
- **Smart Feedback:** Replaced generic "Thinking..." indicators with informative progress steps (e.g., "Extracting Raw Text...", "Analyzing Formatting...").

### 3. Security & Rate Limiting

To ensure service stability and prevent abuse:

- **Rate Limiting:** 30 requests per minute (per IP).
- **Input Validation:** Strict validation for file size (10MB) and MIME types (PDF, DOCX).
- **Sanitization Pipeline:** Every string passes through an aggressive regex-based sanitizer (`helpers/security.ts`) stripping malicious code.
- **User Feedback:** Clear, friendly UI notifications for quota warnings.

## Setup

### Prerequisites

- Node.js 18+ and npm
- Google AI Studio API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Installation & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Deployment

The application is configured for Netlify deployment with the following settings:

- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 18+

## API Usage Limits

To keep the service free and fair for everyone:

- **Rate Limit:** 30 requests per minute per IP
- **Daily Limit:** 50 requests per day per IP
- **File Size Limit:** 10MB maximum
