# Lawlatt

> **AI Safety & Trustworthiness Evaluation Platform for LLMs & AI Agents**

Lawlatt is an automated AI security and safety auditing platform that enables developers, researchers, startups, and enterprises to penetration-test the safety and trustworthiness of Large Language Models (LLMs) and autonomous AI Agents before deployment.

Think of it as **GitHub Actions + Lighthouse + OWASP ZAP** for AI systems.

---

## Features

1. **Dashboard:** Modern, high-tech React/Next.js dashboard to connect models, configure safety checks, track evaluations, and download PDF audit logs.
2. **Model Gateway:** Provider-agnostic gateway supporting OpenAI, Gemini, Anthropic, **Groq** (ultra-fast), Ollama (local models), and custom LiteLLM integrations.
3. **Async Scan Engine:** Runs evaluation modules concurrently on background workers (Celery + Redis) with real-time status reporting.
4. **Vulnerability Scanners (Phase 1):**
   - **Prompt Injection:** Scans vulnerability to instruction overrides and untrusted payloads.
   - **Jailbreak Evaluator:** Tests defense against DAN templates, Grandpa exploits, base64 payload obfuscation, and roleplays.
   - **Hallucination Evaluator:** Probes factual grounding and resistance to false premises.
   - **Prompt Leakage:** Evaluates compliance with pre-prompt instructions and system secrets.
   - **Toxicity Scanner:** Probes generation of hate speech, violence, harassment, or self-harm content when provoked.
5. **Scoring Engine:** Aggregates module outcomes into overall scores and a safety letter grade (A+ to F).
6. **Reports:** Auto-generates detailed JSON summaries, Markdown documentation, and printable PDF compliance sheets.

---

## Directory Structure

```text
lawlatt/
├── apps/
│   └── dashboard/          # Next.js 16 (App Router, Tailwind v4, Lucide)
├── backend/
│   ├── api/                # FastAPI application (endpoints, routers, schemas)
│   ├── core/               # App configuration & DB/Redis connections
│   ├── connectors/         # AI API connector adapters (OpenAI, Gemini, Groq, Ollama)
│   ├── evaluation/         # Safety scan orchestrator & plugin modules
│   ├── reports/            # JSON, Markdown, and ReportLab PDF exporters
│   └── workers/            # Celery background tasks
├── datasets/               # Curated JSON attack datasets
├── docker/                 # Container configs (Dockerfile, docker-compose.yml)
└── README.md
```

---

## Getting Started

### Method 1: Using Docker Compose (Recommended)

Docker Compose starts everything automatically: PostgreSQL database, Redis broker, Celery worker, FastAPI API backend, and Next.js frontend.

1. **Set your API Keys** in a `.env` file at the project root:
   ```env
   OPENAI_API_KEY=your_openai_key
   GEMINI_API_KEY=your_gemini_key
   ANTHROPIC_API_KEY=your_anthropic_key
   GROQ_API_KEY=your_groq_key
   ```

2. **Launch the stack**:
   ```bash
   docker-compose -f docker/docker-compose.yml up --build
   ```

3. **Access Services**:
   - **Dashboard UI:** `http://localhost:3000`
   - **FastAPI Documentation:** `http://localhost:8000/docs`

---

### Method 2: Running Locally for Development

#### 1. Setup Backend
1. Create a Python virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Set your environment keys:
   ```bash
   # On Windows:
   $env:GROQ_API_KEY="gsk_..."
   $env:DATABASE_URL="sqlite:///./lawlatt.db"
   $env:REDIS_URL="redis://localhost:6379/0"
   ```
4. Start FastAPI server:
   ```bash
   python -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8000 --reload
   ```

#### 2. Start Celery Worker (Optional)
If Redis is running locally, spin up the Celery worker for full asynchronous job queues:
```bash
celery -A backend.workers.celery_app worker --loglevel=info
```
*Note: If Redis is offline, the API gracefully falls back to running scans in local background threads automatically.*

#### 3. Setup Frontend
1. Navigate to dashboard:
   ```bash
   cd apps/dashboard
   ```
2. Install dependencies and start:
   ```bash
   npm install
   npm run dev
   ```
3. Access UI at `http://localhost:3000`.

---

## Design Principles

- **Modular Plugin Architecture:** Evaluation modules are isolated classes. You can add new security scanners (like RAG safety or Tool abuse checks) by creating a single file in `backend/evaluation/modules/` inheriting from `BaseEvalModule`.
- **LiteLLM Fallback:** Integrates any API endpoint by passing model prefixes (e.g. `openrouter/meta-llama/llama-3-70b-instruct`).
- **Resilient Background Execution:** Transparent async handling through Celery, with automated fallback to native async background tasks when Celery isn't running.
