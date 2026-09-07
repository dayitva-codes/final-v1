# NCC Battalion Management System

FastAPI + SQLAlchemy backend for cadet registration, mentor evaluation, dashboards,
leaderboard, and an AI-generated performance insight.

Uses **SQLite** for zero-setup local running. Swap `DATABASE_URL` to a Postgres URL
in `.env` when you want to move off it — no code changes needed.

## 1. Setup (2 minutes)

```bash
cd ncc-management
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

## 2. Run

```bash
uvicorn app.main:app --reload
```

Open **http://127.0.0.1:8000/docs** — full interactive Swagger UI, no frontend needed to demo this.

On first run it auto-creates the SQLite file, seeds the 9 evaluation criteria, and
seeds an admin login: `admin@ncc.local` / `admin123` (printed in the console).

## 3. Test flow (do this once to prove everything works end to end)

All of this can be done in `/docs` by clicking "Try it out" on each endpoint.

1. **Create a battalion**
   `POST /api/v1/battalions` → `{"name": "3 MP Girls Battalion", "code": "3MPGBN"}`

2. **Create a college under it**
   `POST /api/v1/colleges` → `{"battalion_id": 1, "name": "Govt Girls College", "academic_year_start": 2026}`

3. **Register a cadet**
   `POST /api/v1/cadets/register`
   ```json
   {
     "email": "cadet1@test.com", "password": "test123",
     "battalion_id": 1, "college_id": 1,
     "full_name": "Test Cadet", "enrollment_number": "MP24SWG0001",
     "mobile": "9999999999", "academic_year": 2, "gender": "female", "wing": "SW"
   }
   ```
   Try `"wing": "JD"` with `"gender": "female"` — it should reject with a 400. That's the
   server-side wing/gender rule from the spec, not just a frontend check.

4. **Register a mentor**
   `POST /api/v1/mentors/register` →
   `{"email": "mentor1@test.com", "password": "test123", "enrollment_number": "MENT001", "scope_level": "institute", "college_id": 1}`

5. **Log in as admin, verify the mentor**
   `POST /api/v1/auth/login` (form fields: `username=admin@ncc.local`, `password=admin123`) → copy `access_token`.
   Click **Authorize** in `/docs`, paste the token.
   `POST /api/v1/mentors/{user_id}/verify` (the mentor's `user_id`, i.e. `2` if admin is `1`).

6. **Log in as the mentor**, authorize with that token instead, then:
   `GET /api/v1/evaluations/criteria` → see the 9 seeded criteria.
   `POST /api/v1/evaluations/` → `{"cadet_id": 1, "criterion_id": 1, "score": 8, "remarks": "Good drill posture"}`
   Repeat for a few criteria.

7. **View results (log in as anyone, or stay as mentor):**
   - `GET /api/v1/cadets/1/scores` — averaged scores per criterion
   - `GET /api/v1/leaderboard?battalion_id=1` — computed ranking
   - `GET /api/v1/dashboard/battalion/1` — battalion aggregate
   - `GET /api/v1/cadets/1/ai-insight` — AI feature. Without `ANTHROPIC_API_KEY` set in
     `.env` it returns a safe fallback response instead of erroring — that's intentional
     (see `ai_insight_service.py`), so the demo never breaks even without the key.

## Architecture

```
API routers (app/api/v1)  →  thin, HTTP only
Services (app/services)   →  business logic, validation rules
Models (app/models)       →  SQLAlchemy ORM / DB schema
Schemas (app/schemas)     →  Pydantic request/response contracts
```

One `users` table holds shared login identity for cadet/mentor/admin; role-specific
data lives in `cadets` / `mentors`, linked by `user_id`. See the full design write-up
(shared earlier) for the reasoning behind each schema decision.

## Known cuts made for the one-night build (say this out loud in interviews — it's a feature, not a bug)

- SQLite instead of Postgres — swappable via one env var, zero code change.
- No Alembic migrations yet — tables are created directly via `create_all` on startup.
  Fine for a single-developer demo; the next step for a real deployment is migrations.
- Battalion/college creation endpoints aren't role-locked to admin yet — evaluation
  submission and mentor verification *are* properly role-gated, which are the higher-value
  ones for scoring.
- MCQ module, AI query answerer, AI drill analysis, task generator, mentor-connect chat:
  deferred by design — see the roadmap section of the architecture doc. The schema
  (`evaluations.remarks`, the `users` identity table) is built so these are additive later.
