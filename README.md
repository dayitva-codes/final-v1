# 🇮🇳 NCC Battalion Management System

A full-stack Cadet & Battalion Management platform built with **FastAPI**, **SQLAlchemy**, and **React + Vite**, featuring cadet enrollment validation, mentor evaluations, battalion leaderboards, and AI performance insights.

---

## ⚡ Quick Start (Single Command)

You can launch **both the FastAPI backend and Vite frontend together** with a single command from the root directory:

```bash
npm run dev
```

### Access URLs
- 🌐 **Frontend Application**: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- 🔌 **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- 📖 **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 🔑 Default Credentials
On startup, the system automatically initializes the database and seeds the administrator account:
- **Email**: `admin@ncc.local`
- **Password**: `admin123`

---

## 🛠️ First-Time Setup

If you are setting up the project on a fresh machine:

### 1. Backend Setup
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cd ..
```

### 3. Run Everything
```bash
npm run dev
```

---

## 🧪 Automated Testing

Run the full end-to-end integration test suite:

```bash
# Windows
.\venv\Scripts\pytest test_app.py

# Linux / macOS
pytest test_app.py
```

This tests:
1. Health check endpoint
2. Admin authentication & JWT token issuance
3. Battalion & College creation
4. Wing/Gender validation rule enforcement (e.g. rejection of `JD` + `female`, acceptance of `SW` + `female`)
5. Mentor registration & Admin verification workflow
6. 9 seeded evaluation criteria & score submissions
7. Cadet score aggregation & Battalion Leaderboard calculations
8. AI performance insight fallback generation

---

## ☁️ Database & Supabase Configuration

The system is configured to work out-of-the-box locally with **SQLite**, and can seamlessly connect to **Supabase** for production deployments.

### Local SQLite Mode (Default)
In `.env`:
```env
DATABASE_URL=sqlite:///./ncc.db
```

### Supabase Cloud Mode
In `.env`:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres
SUPABASE_JWT_SECRET=[YOUR-SUPABASE-JWT-SECRET]
```

In `frontend/.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR-SUPABASE-ANON-KEY]
```

---

## 🏛️ System Architecture

```
ncc-management/
├── app/
│   ├── api/v1/         # API endpoints (Auth, Cadets, Mentors, Evaluations, Dashboard)
│   ├── core/           # Security, JWT, configuration, dependencies
│   ├── db/             # SQLAlchemy session, engine, and auto-seeder
│   ├── models/         # Database models (User, Cadet, Mentor, College, Evaluation)
│   ├── schemas/        # Pydantic validation schemas
│   └── services/       # Core business logic & AI insight engine
├── frontend/
│   ├── src/
│   │   ├── api/        # Unified API client & error handler
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Views (Login, Cadet/Mentor/Admin Dashboards, Leaderboard)
│   │   └── lib/        # Supabase client connector
├── dev.js              # Multi-process development runner
├── package.json        # Root scripts (npm run dev)
├── requirements.txt    # Python backend dependencies
└── test_app.py         # End-to-end test suite
```
