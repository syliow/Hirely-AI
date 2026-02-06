# Hirely AI

<img width="1559" height="964" alt="hirelyAIimg" src="https://github.com/user-attachments/assets/d1e74842-0570-47ae-920d-1a8e4daa08b7" />

**An intelligent resume optimization platform that shows you exactly what ATS systems see.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)

---

## Overview

Most resume tools only check for keywords. Hirely AI goes further by simulating how Applicant Tracking Systems (ATS) actually parse resumes. This gives you a clear picture of what recruiters' systems extract from your resume and what they miss.

Studies show that approximately 75% of resumes are rejected by ATS before reaching human reviewers. Hirely AI helps ensure yours isn't one of them.

## Key Features

### ATS Parsing Simulation

The core feature of Hirely AI is the "Raw Bot View" - a real-time simulation of how ATS systems read your resume. By stripping all formatting and CSS, you can see the exact plain text that automated systems extract.

**What you get:**

- Parsing Health Score indicating ATS compatibility
- Layout risk detection for columns, tables, and graphics that confuse parsers
- Side-by-side comparison of your formatted resume vs. what ATS sees

### XYZ Formula Audit

Every bullet point is evaluated against Google's proven impact formula:

> Accomplished [X] as measured by [Y], by doing [Z]

The AI analyzes your resume content and provides specific feedback on how to transform vague statements into quantifiable achievements.

**Example transformation:**

- Before: "Responsible for managing team projects"
- After: "Led 5-person team to deliver 12 projects ahead of schedule, reducing delivery time by 30% through agile sprint optimization"

### Strategic Keyword Analysis

Hirely AI performs weighted keyword analysis to identify gaps between your resume and target job descriptions. This goes beyond simple keyword counting to understand which skills and competencies are most critical.

### Resume Refactoring

Generate ATS-optimized resumes in clean, semantic HTML format. The refactored resumes are designed for maximum parse accuracy while maintaining professional visual appeal.

**Output options:**

- Single-column layout optimized for ATS
- Keyword-enhanced content
- XYZ formula-compliant bullet points
- Export to PDF or DOCX

### AI Career Advisor

Chat with an AI assistant for personalized career guidance, including interview preparation and resume improvement strategies.

## Technical Architecture

### Stack

- **Framework:** Next.js 15 with App Router
- **Frontend:** React 19, TypeScript
- **AI Model:** Google Gemini 3 (4B-IT)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Security:** Input validation, XSS sanitization, Content Security Policy

### Prompt Engineering Approach

Hirely AI demonstrates that smaller, faster models can deliver high-quality results when given structured guidance. Instead of relying on massive language models, we use a rules-based execution strategy:

1. **Evaluate** - Identify weak points in resume content
2. **Critique** - Explain specific issues
3. **Rewrite** - Apply the XYZ formula and best practices
4. **Verify** - Check for completeness and accuracy

This structured approach ensures consistent, actionable feedback without hallucinations.

### Security

- Strict input validation for file uploads (10MB limit, PDF/DOCX only)
- Multi-layer XSS sanitization pipeline
- Content Security Policy headers
- Privacy-first design - resumes processed in memory, never stored

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Google AI Studio API key ([Get one free](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/hirely-ai.git
cd hirely-ai

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Add your API key to .env.local
# GEMINI_API_KEY=your_api_key_here

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using Hirely AI.

### Production Build

```bash
npm run build
npm start
```

## Usage

1. **Upload your resume** - Supports PDF and DOCX formats
2. **Optional: Add job description** - For targeted keyword analysis
3. **Review the analysis** - Check your Parsing Health Score and Raw Bot View
4. **Get AI feedback** - Review XYZ formula suggestions and keyword gaps
5. **Generate optimized resume** - Export ATS-friendly version

## Deployment

The application is configured for deployment on Netlify or Vercel:

**Netlify:**

- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 18+

**Vercel:**

- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: `.next`

Remember to add your `GEMINI_API_KEY` environment variable in your deployment platform's settings.

## Roadmap

- LinkedIn profile optimization
- Cover letter generation tailored to job descriptions
- Interview preparation assistant with mock interviews
- Job match scoring algorithm
- Resume version control and A/B testing

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

Built with Google Gemini AI, Next.js, and modern web technologies to help job seekers navigate the ATS landscape more effectively.
