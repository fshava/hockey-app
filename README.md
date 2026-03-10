# 🏑 Hockey Fixtures Manager

A full-stack school hockey fixtures management system with:
- **Public dashboard** — standings, leaderboard, upcoming fixtures, results summary
- **Admin panel** — team setup, fixture generation, venue management, results & scorer entry
- **Supabase backend** — Postgres database + built-in auth
- **Vercel deployment** — free, instant, automatic deploys from GitHub

---

## 🗂 Project Structure

```
src/
  lib/
    supabase.js       ← Supabase client
    theme.js          ← Design tokens + global CSS
    hockey.js         ← Round-robin generator, standings + scorer calculators
  hooks/
    useAuth.jsx       ← Auth context (session, signIn, signOut)
    useData.js        ← All Supabase data fetching + mutations
  components/
    Layout.jsx        ← App shell, header, nav bar
    ProtectedRoute.jsx← Redirects unauthenticated users to /login
  pages/
    HomePage.jsx      ← Public home (mini standings, upcoming, recent results)
    StandingsPage.jsx ← Public league table
    LeaderboardPage.jsx← Public top scorers
    UpcomingPage.jsx  ← Public upcoming fixtures grouped by date
    SummaryPage.jsx   ← Public all fixtures + results
    LoginPage.jsx     ← Admin login
    admin/
      AdminSetupPage.jsx    ← Team management + fixture generation
      AdminVenuesPage.jsx   ← Venue/cluster config
      AdminPlayersPage.jsx  ← Player registration per team
      AdminFixturesPage.jsx ← Assign dates, times, venues
      AdminResultsPage.jsx  ← Enter scores + goal scorers
supabase/
  schema.sql          ← Full DB schema + RLS policies (run this first)
```

---

## 🚀 Deployment Guide

### Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project**, give it a name, set a strong DB password, choose a region
3. Wait ~2 minutes for the project to spin up

### Step 2 — Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** → **New Query**
2. Open `supabase/schema.sql` from this project
3. Paste the entire contents and click **Run**
4. You should see: "Success. No rows returned"

### Step 3 — Create Admin Users

1. In Supabase, go to **Authentication** → **Users** → **Add User**
2. Enter email + password for each admin (e.g. `admin@yourschool.ac.zw`)
3. These credentials are what admins use to log in at `/login`
4. You can add as many admin accounts as needed

### Step 4 — Get Your Supabase Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon public** key (long JWT string under "Project API keys")

### Step 5 — Set Up the Frontend Locally

```bash
# Clone or copy this project folder
cd hockey-app

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Edit `.env` and paste your keys:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Test it locally:
```bash
npm run dev
# Open http://localhost:5173
```

### Step 6 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/hockey-app.git
git push -u origin main
```

> ⚠️ Make sure `.env` is in `.gitignore` (it already is). Never commit your keys.

### Step 7 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New Project** → Import your `hockey-app` repository
3. Vercel auto-detects Vite. Leave build settings as-is
4. Before deploying, click **Environment Variables** and add:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
5. Click **Deploy**

Your app will be live at `https://hockey-app-xxxxx.vercel.app` in ~1 minute.

Every time you push to `main` on GitHub, Vercel auto-redeploys.

---

## 🔒 How Auth Works

- The **anon key** is safe to expose in the frontend — Supabase Row Level Security (RLS) controls what it can do
- **Public** (unauthenticated): can only READ all tables
- **Authenticated** (logged-in admins): can INSERT, UPDATE, DELETE
- Admin accounts are managed entirely in your Supabase dashboard → Authentication → Users
- No self-registration — you control who gets access

---

## 📋 Usage Flow

1. **Admin logs in** at `/login`
2. **Setup** → Add teams to 1st Class and 2nd Class, generate fixtures
3. **Venues** → Configure cluster names and ground counts
4. **Players** → Register players per team (optional, for scorer tracking)
5. **Fixtures** → Assign dates, times, venues to each match
6. **Results** → After matches, enter scores and goal scorers

Public visitors can see everything at `/`, `/standings`, `/leaderboard`, `/upcoming`, `/summary`

---

## 🛠 Custom Domain (Optional)

In Vercel → your project → **Settings** → **Domains** → add your domain.
Update your domain's DNS records as instructed by Vercel.
