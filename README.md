# Hirely AI: AI Resume Builder & Reviewer

**Hirely AI** is a professional career intelligence platform designed to bypass the "ATS black hole." It provides a high-fidelity simulation of how enterprise parsers see candidate data, coupled with smart editorial logic to transform weak resumes into quantifiable professional documents.

## Core Features

- **ATS Simulation:** Strips CSS and layouts to reveal the "Bot View," flagging "ATS killers" like complex tables and non-standard text encodings.
- **The XYZ Audit Engine:** Evaluates every bullet point against the Google-standard **XYZ formula**: _Accomplished [X] as measured by [Y], by doing [Z]._
- **Strategic Keyword Mapping:** A weighted analyzer that bridges the gap between candidate content and target Job Descriptions.
- **Intelligent Refactoring:** Generates clean, semantic, single-column HTML resumes optimized for 100% parse-rate.
- **AI Career Advisor:** A persistent strategist (Gemini 3 Flash/Pro) for interview prep and industry pivot strategy.
- **Rate Limiting & Security:** Multi-layer protection with request rate limiting, input validation, and XSS sanitization.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Frontend:** React 19, TypeScript
- **AI LLM:** Google Gemini 3 (Flash/Pro) via `@google/genai`
- **Styling:** Tailwind CSS (CDN), Lucide React icons
- **Security:** Multi-layer XSS Sanitization, strict CSP, rate limiting, input validation

## Technical Highlights

### 1. Multi-Model Strategy

The app dynamically selects models based on task complexity:

- **Gemini 3 Flash:** Handles real-time audits and high-speed resume refactoring.
- **Gemini 3 Pro:** Reserved for the Career Chat to provide deep reasoning and context retention.

### 2. Security & Rate Limiting

To ensure service stability and prevent abuse:

- **Rate Limiting:** 10 requests per minute, 50 requests per day per IP address
- **Input Validation:** Comprehensive validation for all API inputs (file size, MIME types, text length)
- **Sanitization Pipeline:** Every string passes through an aggressive regex-based sanitizer (`helpers/security.ts`) that strips `<script>`, `<iframe>`, and `on*` event handlers.
- **Strict CSP:** A restrictive Content Security Policy prevents unauthorized script execution.
- **User Feedback:** Clear modal popups for rate limit, daily limit, and quota exceeded scenarios

### 3. Modern Next.js Architecture

Built with Next.js 15 App Router for optimal performance:

- **Server Components:** Efficient data fetching and rendering
- **API Routes:** Clean RESTful API design with `/api/generate` endpoint
- **TypeScript:** Full type safety across the application
- **Metadata API:** SEO-optimized with proper favicon and meta tags

### 4. Code Structure

The UI layer is strictly separated from domain logic for better maintainability:

- **`app/`**: Next.js App Router pages and layouts
- **`app/api/`**: API route handlers for AI interactions
- **`lib/`**: Core utilities (types, validation, rate limiting, error handling)
- **`helpers/`**: Utilities for document generation, security, and browser operations
- **`components/`**: Modular, atomic UI components

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

See `netlify.toml` for deployment configuration.

## API Usage Limits

To keep the service free and fair for everyone:

- **Rate Limit:** 10 requests per minute per IP
- **Daily Limit:** 50 requests per day per IP
- **File Size Limit:** 10MB maximum for resume uploads
- **Supported Formats:** PDF, DOCX
