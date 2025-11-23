# Leopath - Con Đường Tri Thức

Leopath is an AI-assisted career advisor and roadmap generator for Vietnamese university students. The platform couples a Next.js application (authentication, dashboards, planners, progress tracking) with a Python Retrieval-Augmented Generation (RAG) service that personalizes learning roadmaps using HyperCLOVA X and curated skill data.

## Why Leopath?

- **Personalized career roadmaps** – FastAPI service enriches canonical job roadmaps (Data Scientist, Cloud Architect, etc.) with student-specific milestones, priorities, and rationale.
- **Student + advisor experience** – Separate pages for registration, onboarding, dashboards, roadmap progress, advisor tools, profile editing, and lessons.
- **Full-stack auth + data** – NextAuth (Credentials provider) + MongoDB Atlas with reusable Mongoose helpers under `lib/mongodb`.
- **Human + LLM collaboration** – RAG pipeline mixes curated JSON, embedding search, and HyperCLOVA X chat completions; Python service is deployed independently (Vercel/Render) and called from Next.js via `PYTHON_API_URL`.
- **Ops-ready docs** – See `QUICKSTART.md`, `DEPLOYMENT.md`, `AUTH_SETUP.md`, `DATABASE_SETUP.md`, `TESTING_GUIDE.md`, and `VERCEL_PYTHON_DEPLOY.md` for deep dives.

## Architecture Overview

```text
┌────────────────────┐      ┌───────────────────────┐
│ Next.js 16 (app/)  │────▶ │ FastAPI (clova-rag…)  │
│ • NextAuth         │ ◀─── │ Roadmap personalize   │
│ • MongoDB Atlas    │      │ + search endpoints    │
│ • Tailwind 4       │      └───────────────────────┘
│ • React 19 / TS    │
└────────┬───────────┘
         │ REST (PYTHON_API_URL)
         ▼
   HyperCLOVA X + NCP APIs
```

Key flows:
1. Users sign up / log in via NextAuth → documents stored in MongoDB.
2. Dashboards call `app/api/...` routes to sync with Python RAG service (`/roadmap/personalized`, `/search`, etc.).
3. Python service fetches canonical roadmaps (`data/jobs/*.json`), flattens + embeds them, and calls HyperCLOVA X to add `check` + `personalization` fields.

## Repository Layout

| Path | Description |
| --- | --- |
| `app/` | Next.js app router pages (login, register, dashboard, career advisor tooling, API routes, etc.). |
| `components/` | Shared UI blocks (Navbar, StudentDashboard, RoadmapViewer, SearchableSkillInput, etc.). |
| `lib/` | Domain logic (career matching, roadmap graph helpers, MongoDB client, tools + types). |
| `data/` | Seed JSON for jobs, skills, universities, demo users. |
| `scripts/` | Node utility scripts (sync user data, generate roadmaps, fix passwords). |
| `clova-rag-roadmap/` | Python FastAPI service, embedding scripts, datasets. |
| `docs/*.md` | Deployment, auth, database, testing, registration guides. |

## Requirements

- Node.js 20+ (Next.js 16 & React 19).
- npm (bundled with Node) or your preferred package manager.
- Python 3.10+ for the RAG service.
- MongoDB Atlas (or any MongoDB 6+ cluster).
- Naver Cloud Platform (Clova Studio) access + API keys.

## 1. Frontend / Next.js App

```bash
git clone https://github.com/ttvKieran/Naver-TMW.git
cd Naver-TMW
npm install
```

Create `.env.local`:

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | Atlas connection string (user with readWrite on database). |
| `NEXTAUTH_SECRET` | 32+ char secret (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). |
| `NEXTAUTH_URL` | Public URL of the Next.js app (e.g. `https://your-app.vercel.app`). |
| `NEXT_PUBLIC_BASE_URL` | Same as above; used in fetchers. |
| `PYTHON_API_URL` | Base URL of the FastAPI service (local `http://localhost:8001` or deployed). |
| `NCP_CLOVASTUDIO_API_KEY` | HyperCLOVA X API key from Clova Studio. |
| `NCP_APIGW_API_KEY` | API Gateway key when calling certain NCP endpoints. |
| `NCP_REQUEST_ID` | Static or randomly generated request ID header (optional but logged). |

Optional helpers: run `npm run check-env` to verify env completeness.

Start the web app:

```bash
npm run dev
# -> http://localhost:3000 (auth, dashboard, roadmap, advisor tools)
```

## 2. Python RAG Service (`clova-rag-roadmap`)

```bash
cd clova-rag-roadmap
python -m venv .venv
.\.venv\Scripts\activate  # Windows (use `source .venv/bin/activate` on macOS/Linux)
pip install -r requirements.txt
```

Environment configuration:

```bash
cp .env.example .env.local  # if provided
echo NCP_API_KEY=your_clova_api_key > .env.local
```

Run locally:

```bash
uvicorn app.personalize_api:app --reload --port 8001
# Swagger: http://localhost:8001/docs
```

### Data prep

When roadmaps change:

```bash
python scripts/flatten_roadmap.py   # JSON → tabular CSV
python scripts/embed_roadmap.py     # call embedding API, refresh vectors
```

Datasets live under `data/jobs`, `data/flatten_roadmaps`, `data/roadmap_embeddings`, and `data/users`.

## 3. Running Everything Locally

| Terminal | Command |
| --- | --- |
| #1 | `npm run dev` (Next.js) |
| #2 | `cd clova-rag-roadmap && uvicorn app.personalize_api:app --reload --port 8001` |

Visit `http://localhost:3000`, register a student, and check Dashboard → My Roadmap → Career Advisor to confirm Python API calls succeed.

## Deployment Cheat Sheet

- **Next.js on Vercel** – follow `DEPLOYMENT.md` for env vars, secrets, and redeploy steps. `QUICKSTART.md` shows the 15-minute version; `VERCEL_PYTHON_DEPLOY.md` covers deploying the FastAPI service on Vercel, while `RENDER_DEPLOY.md` documents deploying it on Render.
- **Python API** – `clova-rag-roadmap/README.md` plus `RENDER_DEPLOY.md` describe the Procfile/runtime setup. Remember to sync `PYTHON_API_URL` on the Next.js project after each deployment.
- **Auth & DB** – `AUTH_SETUP.md` documents NextAuth credential flow & hashing with `bcryptjs`; `DATABASE_SETUP.md` and `scripts/*.ts` cover seeding/syncing MongoDB documents.

## Useful npm Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js app locally. |
| `npm run build && npm start` | Production build preview. |
| `npm run lint` | ESLint (Next.js config). |
| `npm run seed` | Execute `lib/mongodb/scripts/seed.ts` to insert demo data. |
| `npm run check-env` | Ensure required env vars exist before deploy. |

## Testing & Troubleshooting

- API + auth testing instructions live in `TESTING_GUIDE.md` and `test-vision.sh` / `test-registration.ts`.
- Registration issues? See `REGISTRATION_GUIDE.md`.
- Deployment stuck? Use `DEPLOYMENT.md` troubleshooting appendix and `scripts/pre-deploy-check.sh`.
- Python API errors? Inspect logs in Render/Vercel and run `uvicorn ... --reload` locally with `--env-file .env.local`.

## License

MIT © Team Tell Me Why - Naver AI Hackathon 2025 contributors.

---

Need more details? Start with `QUICKSTART.md`, then dive into the specialized docs listed above. Contributions and documentation fixes are welcome!
