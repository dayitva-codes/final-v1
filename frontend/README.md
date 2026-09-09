# NCC Command — React Frontend

Full multi-page React app (Vite + React Router) for the NCC Battalion Management API.
Role-aware: separate flows for Cadet, Mentor, and Admin, plus a shared Leaderboard.

## 1. Run locally (do this first, before deploying anything)

```bash
cd ncc-frontend-react
npm install
npm run dev
```

Opens at `http://localhost:5173`. On first load it points at
`http://127.0.0.1:8000/api/v1` by default — change this in the **API bar** at the
top of every page if your backend is on Render instead. It's saved in your browser
(localStorage), so you only set it once.

### Google sign-in with Supabase

Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL`. Enable Google in Supabase
Authentication → Providers and add both your local URL and deployed Render URL to
the Supabase redirect allow-list. The browser receives a Supabase session, then
the backend exchanges it for the app's normal role-aware JWT. New Google users
start as cadets; an administrator can update their role in the database.

**Test it against your local FastAPI backend first.** Confirm the full flow works
locally before pointing it at Render — debugging localhost is much faster than
debugging a live deploy.

## 2. Test flow

1. Go to `/register/cadet` or `/register/mentor` to create accounts — try the
   gender/wing mismatch (e.g. female + JD) and confirm it's rejected.
2. Log in as `admin@ncc.local` / `admin123` at `/login`.
3. On the **Command Setup** page: create a battalion, then a college under it.
4. Register a cadet and a mentor (via the registration links) pointing at that
   battalion/college.
5. Back in Admin, verify the mentor using their user ID (check `/docs` on your
   backend, or the mentor registration response, to find it).
6. Log out, log in as the mentor. Go to **Evaluate Cadets**, enter the cadet's ID,
   submit scores across the 9 criteria.
7. Log in as the cadet. Their **My Profile** page shows the averaged scores and
   has a button to generate the AI Performance Insight.
8. Check the **Leaderboard** page as any role — it's shared navigation.

## 3. Build for production

```bash
npm run build
```

Outputs static files to `dist/`. This is what you deploy — not the source.

## 4. Deploy to Vercel

Two options:

**A — Drag and drop (fastest):**
Run `npm run build` locally, then go to vercel.com → New Project → drag the `dist/`
folder in directly.

**B — Git-connected (better long-term):**
Push this whole `ncc-frontend-react` folder to a GitHub repo. In Vercel, import the
repo and set:
- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`

Either way, once deployed, open the live URL and set the API bar at the top to your
Render backend URL + `/api/v1` (e.g. `https://ncc-management-api-v1.onrender.com/api/v1`).

## Architecture notes (for your README / interview talking points)

- **Layered like the backend:** `api/client.js` is the only file that knows about
  HTTP — every page calls through the `api` object, never `fetch` directly. Swapping
  API base URLs or adding request retries happens in one place.
- **AuthContext** holds the logged-in user and JWT across the whole app; `ProtectedRoute`
  enforces both "must be logged in" and "must have role X" at the route level, not
  scattered through individual pages.
- **Role-based navigation:** the sidebar renders different links depending on
  `user.role` — cadet, mentor, and admin genuinely see different apps, not the same
  screen with hidden buttons.
- **Known gap carried from the backend:** battalion/college creation endpoints aren't
  role-locked yet server-side, so the Admin page's setup forms aren't the only line of
  defense — worth naming as a "next step" if asked.
