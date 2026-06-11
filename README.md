# AI Placement Copilot

**Your Personal AI Career Mentor for Placements, Internships, and Job Preparation**

Production-ready SaaS platform for complete AI-powered career preparation — not just interview questions, but a full ecosystem.

![Stack](https://img.shields.io/badge/Next.js-15-black)
![Stack](https://img.shields.io/badge/PostgreSQL-Prisma-336791)
![Stack](https://img.shields.io/badge/Clerk-Auth-6C47FF)
![Stack](https://img.shields.io/badge/AI-Claude_%2B_OpenAI-412991)

## Features (15 Modules)

| Module | Description |
|--------|-------------|
| **User Profile** | Student profile with skill/career profile and readiness score |
| **Resume Analyzer** | PDF/DOCX upload, ATS score, strengths/weaknesses, recruiter review |
| **JD Analyzer** | Required/hidden skills, interview focus, hiring priorities |
| **Resume vs JD Match** | Match score, selection probability, improvement suggestions |
| **Skill Gap Analysis** | Prioritized learning gaps (Critical → Low) |
| **AI Learning Roadmap** | 30/60/90-day plans with resources, projects, milestones |
| **Interview Coach** | Technical, HR, behavioral questions with sample answers |
| **Voice Mock Interview** | Speech-to-text + AI evaluation scores |
| **Coding Prep** | DSA problems + Judge0 evaluation + complexity analysis |
| **Aptitude Prep** | Quantitative, logical, verbal with company-specific questions |
| **Behavioral Analysis** | STAR framework scoring |
| **Career Mentor Chat** | AI assistant with conversation memory |
| **Readiness Dashboard** | Overall score with radar charts |
| **Gamification** | XP, badges, streaks, leaderboard |
| **Analytics** | Progress trends, skill distribution, performance graphs |

## AI Agent Architecture

8 specialized agents orchestrated via `src/lib/ai/orchestrator.ts`:

- Resume Agent · JD Agent · Skill Gap Agent · Roadmap Agent
- Interview Agent · Coding Coach Agent · Career Mentor Agent · Evaluation Agent

## Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS, ShadCN UI, Framer Motion, Recharts
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Clerk
- **AI:** Claude API + OpenAI API
- **Storage:** UploadThing
- **Coding:** Judge0 API
- **Deploy:** Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- [Clerk](https://clerk.com) account
- [Anthropic](https://anthropic.com) or [OpenAI](https://openai.com) API key

### Setup

```powershell
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your keys

npm install
npx prisma db push
npm run dev
```

Open **http://localhost:3000**

### Environment Variables

See `frontend/.env.local.example` for all required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
- `UPLOADTHING_TOKEN` — for resume uploads
- `JUDGE0_API_KEY` — optional, for coding evaluation

## Project Structure

```
frontend/
├── prisma/schema.prisma       # Complete database schema
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # 15 module pages
│   │   └── api/               # REST API routes
│   ├── lib/
│   │   ├── ai/agents/         # 8 AI agents
│   │   ├── ai/orchestrator.ts # Agent orchestration
│   │   └── services/          # Judge0, XP, resume parser
│   └── components/            # UI, landing, dashboard, charts
```

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Set root directory to `frontend`
4. Add environment variables
5. Connect PostgreSQL (Neon, Supabase, or Railway)
6. Run `npx prisma db push` against production DB

## Security

- Clerk authentication on all dashboard/API routes
- Rate limiting on API endpoints
- Zod input validation
- Secure file upload via UploadThing
- Environment variables for all secrets

## License

MIT
