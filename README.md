# Dashboard Realtime

This is a Next.js (App Router) project built with TypeScript, TailwindCSS, shadcn/ui, Supabase (Auth + Realtime + DB), TanStack Query, and Zustand. It is designed to be ready for production deployment using Docker (standalone build) and Docker Swarm (Portainer).

## Technologies Used
- **Next.js (App Router)** + **TypeScript**
- **TailwindCSS** + **shadcn/ui**
- **Supabase** (Auth, Database, Realtime)
- **TanStack Query** (React Query)
- **Zustand** (Lightweight state management)
- **Docker** (Multi-stage + `standalone` output)

## Supabase Requirements
You need a Supabase project. In the SQL Editor of your Supabase project, execute the following to create the required table and enable realtime:

```sql
-- Create events table
create table public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  type text not null
);

-- Note: Depending on your needs, you may want to set up RLS (Row Level Security) policies here.
-- For a basic setup where any authenticated user can read/insert, you could do:
-- alter table public.events enable row level security;
-- create policy "Allow authenticated users to read" on public.events for select to authenticated using (true);
-- create policy "Allow authenticated users to insert" on public.events for insert to authenticated with check (true);

-- Enable realtime for the events table
alter publication supabase_realtime add table public.events;
```

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup Environment Variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase details in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Running with Docker (Local Test)

For testing the production build locally via Docker Compose:

1. Create a `.env` file (Docker Compose uses `.env` by default, or you can pass multiple env files):
   ```bash
   cp .env.local .env
   ```

2. Build and run the container:
   ```bash
   docker compose up --build
   ```

## Swarm / Portainer Deployment

When deploying to Portainer via Docker Swarm:
1. Ensure your `.env` variables are securely injected via Portainer's environment variables or Docker Secrets.
2. The application exposes port `3000` internally. You can map this to whichever external port you prefer (e.g., `80:3000` or attach a Traefik / NGINX reverse proxy).
3. The Dockerfile utilizes Next.js \`standalone\` output mode, meaning the container image is highly optimized and includes only the necessary dependencies.
