# Revenue Intelligence Dashboard

An AI-powered sales pipeline intelligence system that automatically syncs CRM data, scores deals for risk using LLMs, and surfaces insights through a natural language query interface.

> **Note:** The live demo runs on realistic dummy data. Once connected to a real HubSpot account, the sync workflow picks up live deals automatically — no code changes required.

**Live Demo:** [revenue-intelligence-frontend-430431660680.us-central1.run.app](https://revenue-intelligence-frontend-430431660680.us-central1.run.app)

---

## What it does

Most sales teams have deal data sitting in their CRM that never gets properly analyzed. Reps miss follow-ups, managers spend hours on manual pipeline reviews, and nobody knows why deals are actually being lost. This system fixes that by:

- Automatically syncing deals from HubSpot every 4 hours
- Scoring every open deal nightly for risk using AI
- Letting anyone ask pipeline questions in plain English — no SQL needed
- Delivering a weekly AI-written digest to sales leadership every Monday

---

## Screenshots

### Pipeline Dashboard
Live metric cards, deal count by stage, and total pipeline value updated every 4 hours from HubSpot.

### Deals Table
Every open deal with AI-generated risk badges (critical / high / medium / low), days since last contact, and next recommended actions.

### AI Query Interface
Natural language queries powered by NVIDIA NIM. Ask anything about your pipeline and get a structured answer with matching deals.

---

## Architecture

```
HubSpot CRM
     │
     │  n8n sync (every 4 hours)
     ▼
Supabase PostgreSQL
     │
     ├── deals table
     ├── deal_insights table  ◄── nightly NVIDIA NIM risk scoring (n8n)
     └── deals_with_staleness view
     │
     ▼
FastAPI Backend (Python)
     │
     ├── GET  /api/pipeline-summary
     ├── GET  /api/deals
     ├── POST /api/query         ◄── NVIDIA NIM (natural language → SQL filters)
     └── POST /api/digest        ◄── NVIDIA NIM (weekly AI digest)
     │
     ▼
React Frontend (Vite)
     │
     ├── /dashboard   → Pipeline overview + bar chart
     ├── /deals       → Deal table with risk scoring
     └── /query       → Natural language query interface
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | FastAPI (Python 3.11) |
| Database | Supabase (PostgreSQL + pgvector) |
| AI / LLM | NVIDIA NIM — Llama 3.3 70B + Llama 3.1 8B |
| Automation | n8n Community Edition |
| CRM | HubSpot API |
| Charts | Recharts |
| Containerization | Docker |
| Deployment | Google Cloud Run + Artifact Registry |

---

## Project Structure

```
revenue-intelligence/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Pipeline overview
│   │   │   ├── Deals.jsx          # Deal table with filters
│   │   │   └── Query.jsx          # NL query interface
│   │   ├── components/
│   │   │   ├── PipelineChart.jsx  # Recharts bar chart
│   │   │   ├── DealTable.jsx      # Deals table
│   │   │   ├── RiskBadge.jsx      # Risk level pill
│   │   │   └── Navbar.jsx         # Sidebar navigation
│   │   └── lib/
│   │       ├── supabase.js        # Supabase client
│   │       └── api.js             # FastAPI fetch helpers
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/                        # FastAPI backend
│   ├── app/
│   │   ├── main.py                # App entry + CORS
│   │   ├── config.py              # Env vars (pydantic-settings)
│   │   ├── services/
│   │   │   ├── nvidia.py          # NVIDIA NIM wrapper
│   │   │   └── supabase.py        # Supabase client + query builder
│   │   └── routes/
│   │       ├── query.py           # POST /api/query
│   │       ├── deals.py           # GET /api/deals + /api/pipeline-summary
│   │       └── digest.py          # POST /api/digest
│   ├── Dockerfile
│   └── requirements.txt
│
└── workflows/                     # n8n workflow JSON files
    ├── deal-sync.json             # HubSpot → Supabase sync
    └── risk-scoring.json          # Nightly AI risk scoring
```

---

## How it works

### 1. Data pipeline
n8n runs a scheduled workflow every 4 hours that calls the HubSpot API, transforms the deal properties, and upserts them into Supabase. A webhook trigger can also be configured for instant sync on deal creation or stage change.

### 2. AI risk scoring
Every night at midnight, a second n8n workflow loops through all open deals, sends each one to NVIDIA NIM with a structured prompt, and writes the risk score back to the `deal_insights` table. Each deal gets a risk level (low / medium / high / critical), specific risk reasons, and recommended next actions.

### 3. Natural language queries
The query endpoint uses a two-step NVIDIA NIM call. The first call translates the user's English question into a JSON filter object. The second call executes the Supabase query and formats the results as a readable answer.

### 4. Weekly digest
The digest endpoint assembles the pipeline snapshot, high-risk deals, and win/loss patterns, then asks NVIDIA NIM to write a concise 180-word briefing for sales leadership.

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker
- n8n (`npm install -g n8n`)

### Backend setup

```bash
cd server
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `server/.env`:

```env
NVIDIA_API_KEY=your_nvidia_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```

Start the server:

```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### Frontend setup

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Start the dev server:

```bash
npm run dev
```

Opens at `http://localhost:5173` — all `/api/*` calls proxy to FastAPI automatically.

### n8n workflows

```bash
n8n start
```

Open `http://localhost:5678`, import the JSON files from the `workflows/` folder, and add your HubSpot API key and Supabase credentials to each workflow.

---

## Database Schema

```sql
-- Core deals table (synced from HubSpot)
CREATE TABLE deals (
  id                 TEXT PRIMARY KEY,
  crm_source         TEXT,
  name               TEXT NOT NULL,
  amount             NUMERIC,
  stage              TEXT,
  pipeline           TEXT,
  owner_id           TEXT,
  owner_name         TEXT,
  company            TEXT,
  close_date         DATE,
  created_at         TIMESTAMPTZ,
  last_activity_at   TIMESTAMPTZ,
  last_activity_type TEXT,
  probability        NUMERIC,
  deal_json          JSONB,
  synced_at          TIMESTAMPTZ DEFAULT NOW()
);

-- AI risk scores (written back nightly by n8n)
CREATE TABLE deal_insights (
  deal_id       TEXT PRIMARY KEY REFERENCES deals(id) ON DELETE CASCADE,
  risk_level    TEXT,
  risk_reasons  TEXT[],
  next_actions  TEXT[],
  confidence    NUMERIC,
  analyzed_at   TIMESTAMPTZ DEFAULT NOW()
);

-- View that calculates days since last contact
CREATE VIEW deals_with_staleness AS
SELECT d.*,
  EXTRACT(DAY FROM NOW() - d.last_activity_at)::INTEGER AS days_stale,
  di.risk_level, di.risk_reasons, di.next_actions
FROM deals d
LEFT JOIN deal_insights di ON di.deal_id = d.id;
```

---

## Deployment (Google Cloud Run)

### Build and push images

```bash
# Authenticate Docker with Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# Backend
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT/revenue-intelligence/backend:latest ./server
docker push us-central1-docker.pkg.dev/YOUR_PROJECT/revenue-intelligence/backend:latest

# Frontend
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT/revenue-intelligence/frontend:latest ./client
docker push us-central1-docker.pkg.dev/YOUR_PROJECT/revenue-intelligence/frontend:latest
```

### Deploy to Cloud Run

```bash
# Backend
gcloud run deploy revenue-intelligence-backend \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT/revenue-intelligence/backend:latest \
  --platform managed --region us-central1 --allow-unauthenticated --port 8080 \
  --update-env-vars NVIDIA_API_KEY="your_key" \
  --update-env-vars SUPABASE_URL="your_url" \
  --update-env-vars SUPABASE_SERVICE_KEY="your_key"

# Frontend
gcloud run deploy revenue-intelligence-frontend \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT/revenue-intelligence/frontend:latest \
  --platform managed --region us-central1 --allow-unauthenticated --port 8080
```

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Description |
|---|---|
| `NVIDIA_API_KEY` | NVIDIA NIM API key from build.nvidia.com |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (server-side only) |

### Frontend (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

---

## Connecting a real CRM

1. Create a HubSpot Private App at `developers.hubspot.com`
2. Enable scopes: `crm.objects.deals.read` and `crm.objects.contacts.read`
3. Copy the access token into the n8n HubSpot sync workflow
4. Activate the workflow — deals sync automatically every 4 hours

No code changes needed. The schema and pipeline are already production-ready.

---

## Built with

- [NVIDIA NIM](https://build.nvidia.com) — Free LLM API (1000 requests/month)
- [Supabase](https://supabase.com) — Free tier PostgreSQL
- [n8n](https://n8n.io) — Open source workflow automation
- [Google Cloud Run](https://cloud.google.com/run) — Serverless container deployment
- [FastAPI](https://fastapi.tiangolo.com) — Python web framework
- [React](https://react.dev) + [Vite](https://vitejs.dev) — Frontend
- [Recharts](https://recharts.org) — Chart library

---

## License

MIT