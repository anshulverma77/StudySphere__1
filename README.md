# StudySphere

A full-stack community study platform where students can ask doubts, answer questions, build learning streaks, join live study sessions, and upgrade to premium.

Built with React, TypeScript, Vite, Tailwind CSS, Supabase (PostgreSQL + Auth + RLS).

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-n3ap7moc)

---

## Features

- **Authentication** — Email/password signup, login, logout, persistent sessions, protected routes
- **Questions & Answers** — Ask doubts across 8 categories, browse the community feed, answer others' questions, edit/delete your own
- **Community Feed** — Search and filter questions by category, see author info and answer counts
- **My Questions** — View and manage only your own questions
- **Study Streaks** — Daily activity streak that increments when you ask, answer, or join a meeting; persists across sessions
- **Live Study Sessions** — Create or join study meetings via meeting links (Google Meet, Zoom, etc.)
- **Premium Subscription** — Upgrade to premium for exclusive study rooms, live sessions, and events
- **Profile Dashboard** — View streak stats, questions asked, answers given, meetings joined; edit name and avatar
- **3D Animations** — Tilt cards, parallax hero, glassmorphism, animated number counters, mesh gradient backgrounds
- **Row Level Security** — Every table has RLS enabled with ownership-based policies

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Database | Supabase PostgreSQL |

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (create one free at [supabase.com](https://supabase.com))

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/studysphere.git
cd studysphere
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from the example:

```bash
cp .env.example .env
```

4. Fill in your Supabase credentials in `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

5. Run the database migrations. The migration SQL files are in `supabase/migrations/`. Apply them through the Supabase SQL Editor or CLI in order:

   - `20261007143148_create_studysphere_schema.sql` — Creates all tables, RLS policies, indexes, and the streak function
   - `20261007152614_fix_security_warnings.sql` — Fixes security advisor warnings

6. Start the dev server:

```bash
npm run dev
```

7. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with streak tracking |
| `questions` | Doubts with title, description, category |
| `answers` | Answers linked to questions (multiple per question) |
| `meetings` | Live study sessions with meeting links |
| `meeting_participants` | Tracks who joined which meeting |
| `subscriptions` | Premium subscription records |
| `user_activity` | Daily activity log for streak calculation |

### Question Categories

Java, DSA, Web Development, HTML/CSS, JavaScript, Backend, Database, Other

## Deploying to Vercel

1. Push your code to a GitHub repository.

2. Go to [vercel.com](https://vercel.com) and import your repository.

3. Add the following environment variables in Vercel's project settings:
   - `VITE_SUPABASE_URL` — Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — Your Supabase anon key

4. Vercel will auto-detect Vite and use the `vercel.json` configuration. Click **Deploy**.

## Deploying the Database

The Supabase database is already provisioned. If you create a new Supabase project:

1. Go to your Supabase Dashboard → SQL Editor.
2. Run the migration files from `supabase/migrations/` in chronological order.
3. Verify RLS is enabled on all tables under Database → Tables.
4. Make sure email confirmation is OFF under Authentication → Settings.

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only read/update/delete their own data
- The `update_streak` function is `SECURITY DEFINER` and only callable by authenticated users
- The service role key is never exposed in frontend code
- Subscription status cannot be freely edited from the frontend (controlled by RLS)

## Remaining Configuration

- **Stripe Payments**: The premium upgrade currently creates a subscription record directly. To accept real payments, integrate Stripe with a server-side edge function for checkout. Run `bolt-stripe` skill for guidance.
- **Meeting Provider**: Meeting links are stored as URLs (Google Meet, Zoom, etc.). Users paste their own links when creating meetings. A real video provider can be integrated later.

## Project Structure

```
src/
  components/       Reusable UI components (Avatar, Navbar, TiltCard, etc.)
  context/          Auth context provider
  hooks/            Custom hooks (useSubscription)
  lib/              Utilities (supabase client, router, streak, helpers)
  pages/            Page components (Home, Community, Login, etc.)
  types/            TypeScript type definitions
supabase/
  migrations/       Database migration SQL files
```

## License

This project is open source and available under the MIT License.
