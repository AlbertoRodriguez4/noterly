/*
# Create tasks and routines tables

## Summary
Adds two new tables to support a personal productivity app with tasks and routines.
No authentication is required — the app is single-tenant and data is intentionally
accessible via the anon key.

## New Tables

### tasks
Stores one-off to-do items.
- id: UUID primary key
- text: the task description
- completed: whether the task is done
- due_at: optional deadline (timestamptz)
- created_at / updated_at: timestamps

### routines
Stores recurring habits/activities.
- id: UUID primary key
- title: routine name
- description: optional notes
- frequency: one of 'daily', 'weekdays', 'weekends', 'weekly', 'monthly'
- days: integer array — for weekly routines, which days (0=Sun … 6=Sat)
- time_of_day: optional preferred time string (e.g. "09:00")
- streak: current consecutive completion count
- last_done_at: when the routine was last marked as completed
- created_at / updated_at: timestamps

## Security
- RLS enabled on both tables.
- All four CRUD policies grant access to anon + authenticated roles with USING(true),
  since this is a no-auth single-user app.
*/

-- ─── tasks ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  text        text        NOT NULL,
  completed   boolean     NOT NULL DEFAULT false,
  due_at      timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select" ON tasks;
CREATE POLICY "tasks_select" ON tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "tasks_insert" ON tasks;
CREATE POLICY "tasks_insert" ON tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "tasks_update" ON tasks;
CREATE POLICY "tasks_update" ON tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "tasks_delete" ON tasks;
CREATE POLICY "tasks_delete" ON tasks FOR DELETE
  TO anon, authenticated USING (true);

-- ─── routines ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS routines (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  description  text,
  frequency    text        NOT NULL DEFAULT 'daily'
                           CHECK (frequency IN ('daily','weekdays','weekends','weekly','monthly')),
  days         integer[]   NOT NULL DEFAULT '{}',
  time_of_day  text,
  streak       integer     NOT NULL DEFAULT 0,
  last_done_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "routines_select" ON routines;
CREATE POLICY "routines_select" ON routines FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "routines_insert" ON routines;
CREATE POLICY "routines_insert" ON routines FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "routines_update" ON routines;
CREATE POLICY "routines_update" ON routines FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "routines_delete" ON routines;
CREATE POLICY "routines_delete" ON routines FOR DELETE
  TO anon, authenticated USING (true);
