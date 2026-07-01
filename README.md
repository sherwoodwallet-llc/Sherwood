# Sherwood Connect

Next.js site for Sherwood, including the outreach manager dashboard at `/outreach`.

## Outreach Flow

The local Docker agent system creates drafted outreach tasks and inserts them into Supabase. This website reads those Supabase rows:

1. n8n runs the lead outreach workflow.
2. Subagents research, score, find contacts, and draft emails.
3. `outreach-task-agent` inserts approved drafts into `outreach_tasks`.
4. Supabase assigns each task to an active outreach manager.
5. Managers log in at `/outreach`, copy/send their assigned drafts manually, and mark tasks sent.
6. The master account sees all tasks and manager progress.

Master account email:

```text
hadiabdul8128@gmail.com
```

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000/outreach
```

## Environment Variables

Add these to `.env.local` for local development and to Vercel for deployment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used by the browser app. `SUPABASE_SERVICE_ROLE_KEY` is for server-side tooling and agents only. Do not expose it in client code.

## Supabase Migration

Run this SQL file in the Supabase SQL editor:

```text
supabase/migrations/20260623000000_outreach_tasks.sql
```

It creates:

- `profiles`
- `outreach_tasks`
- automatic outreach manager numbering
- row-level security policies

All users except the master email become `outreach_manager` profiles by default when they sign up.

## Checks

```bash
npm run lint
npm run build
```
