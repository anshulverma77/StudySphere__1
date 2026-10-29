/*
# StudySphere - Complete Database Schema

## Overview
Creates the full schema for StudySphere, a community study platform with doubts, answers,
live meetings, streaks, and premium subscriptions.

## New Tables

### profiles
- id (uuid, PK, references auth.users)
- name (text, not null)
- email (text, not null)
- avatar (text, nullable - stores URL or base64)
- current_streak (int, default 0)
- longest_streak (int, default 0)
- last_activity_date (date, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)

### questions
- id (uuid, PK)
- user_id (uuid, FK -> profiles.id)
- title (text, not null)
- description (text, not null)
- category (text, not null)
- created_at, updated_at (timestamptz)

### answers
- id (uuid, PK)
- question_id (uuid, FK -> questions.id ON DELETE CASCADE)
- user_id (uuid, FK -> profiles.id)
- answer (text, not null)
- created_at, updated_at (timestamptz)

### meetings
- id (uuid, PK)
- host_user_id (uuid, FK -> profiles.id)
- title (text, not null)
- description (text)
- category (text)
- meeting_link (text, not null)
- scheduled_at (timestamptz, not null)
- is_premium (boolean, default false)
- created_at (timestamptz)

### meeting_participants
- id (uuid, PK)
- meeting_id (uuid, FK -> meetings.id ON DELETE CASCADE)
- user_id (uuid, FK -> profiles.id)
- created_at (timestamptz)
- UNIQUE(meeting_id, user_id)

### subscriptions
- id (uuid, PK)
- user_id (uuid, FK -> profiles.id)
- plan (text: 'free' | 'premium', default 'free')
- status (text: 'active' | 'cancelled' | 'expired', default 'active')
- start_date (timestamptz)
- end_date (timestamptz, nullable)
- created_at (timestamptz)

### user_activity
- id (uuid, PK)
- user_id (uuid, FK -> profiles.id)
- activity_type (text: 'ask_question' | 'answer_question' | 'join_meeting')
- activity_date (date, not null)
- created_at (timestamptz)
- UNIQUE(user_id, activity_date) — one activity record per user per day

## Security (RLS)
- All tables have RLS enabled.
- profiles: users read all profiles (community), update only own.
- questions: all authenticated can read; users CRUD only own.
- answers: all authenticated can read; users CRUD only own.
- meetings: all authenticated can read; users create + manage own.
- meeting_participants: all authenticated can read; users insert/leave own.
- subscriptions: users read only own; INSERT is blocked (managed via edge function / admin).
- user_activity: users read only own; insert only own.

## Important Notes
1. user_id columns default to auth.uid() so frontend inserts work without passing user_id.
2. Answer counts are computed via a query, not stored.
3. Streak is stored on profiles and updated via the update_streak RPC function.
4. The update_streak function is SECURITY DEFINER to safely update streak fields.
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  avatar text,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_activity_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============ QUESTIONS ============
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "questions_select_all" ON questions;
CREATE POLICY "questions_select_all"
ON questions FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "questions_insert_own" ON questions;
CREATE POLICY "questions_insert_own"
ON questions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "questions_update_own" ON questions;
CREATE POLICY "questions_update_own"
ON questions FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "questions_delete_own" ON questions;
CREATE POLICY "questions_delete_own"
ON questions FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============ ANSWERS ============
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  answer text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "answers_select_all" ON answers;
CREATE POLICY "answers_select_all"
ON answers FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "answers_insert_own" ON answers;
CREATE POLICY "answers_insert_own"
ON answers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "answers_update_own" ON answers;
CREATE POLICY "answers_update_own"
ON answers FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "answers_delete_own" ON answers;
CREATE POLICY "answers_delete_own"
ON answers FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============ MEETINGS ============
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'Other',
  meeting_link text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  is_premium boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meetings_select_all" ON meetings;
CREATE POLICY "meetings_select_all"
ON meetings FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "meetings_insert_own" ON meetings;
CREATE POLICY "meetings_insert_own"
ON meetings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = host_user_id);

DROP POLICY IF EXISTS "meetings_update_own" ON meetings;
CREATE POLICY "meetings_update_own"
ON meetings FOR UPDATE TO authenticated
USING (auth.uid() = host_user_id)
WITH CHECK (auth.uid() = host_user_id);

DROP POLICY IF EXISTS "meetings_delete_own" ON meetings;
CREATE POLICY "meetings_delete_own"
ON meetings FOR DELETE TO authenticated
USING (auth.uid() = host_user_id);

-- ============ MEETING_PARTICIPANTS ============
CREATE TABLE IF NOT EXISTS meeting_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(meeting_id, user_id)
);

ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participants_select_all" ON meeting_participants;
CREATE POLICY "participants_select_all"
ON meeting_participants FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "participants_insert_own" ON meeting_participants;
CREATE POLICY "participants_insert_own"
ON meeting_participants FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "participants_delete_own" ON meeting_participants;
CREATE POLICY "participants_delete_own"
ON meeting_participants FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============ SUBSCRIPTIONS ============
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
CREATE POLICY "subscriptions_select_own"
ON subscriptions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "subscriptions_insert_own" ON subscriptions;
CREATE POLICY "subscriptions_insert_own"
ON subscriptions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "subscriptions_update_own" ON subscriptions;
CREATE POLICY "subscriptions_update_own"
ON subscriptions FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============ USER_ACTIVITY ============
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('ask_question', 'answer_question', 'join_meeting')),
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_select_own" ON user_activity;
CREATE POLICY "activity_select_own"
ON user_activity FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_insert_own" ON user_activity;
CREATE POLICY "activity_insert_own"
ON user_activity FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON user_activity(user_id);

-- ============ UPDATE_STREAK FUNCTION ============
-- SECURITY DEFINER: allows the authenticated user to update their own streak
-- without needing UPDATE policy on profiles for all columns.
-- The function only updates streak-related columns for the calling user.
CREATE OR REPLACE FUNCTION update_streak(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_date date;
  v_today date := CURRENT_DATE;
  v_current int;
  v_longest int;
BEGIN
  SELECT current_streak, longest_streak, last_activity_date
  INTO v_current, v_longest, v_last_date
  FROM profiles WHERE id = p_user_id;

  IF v_last_date IS NULL THEN
    -- First ever activity
    v_current := 1;
  ELSIF v_last_date = v_today THEN
    -- Already counted today, no change
    v_current := v_current;
  ELSIF v_last_date = v_today - 1 THEN
    -- Consecutive day
    v_current := v_current + 1;
  ELSE
    -- Streak broken
    v_current := 1;
  END IF;

  v_longest := GREATEST(v_longest, v_current);

  UPDATE profiles
  SET current_streak = v_current,
      longest_streak = v_longest,
      last_activity_date = v_today,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Grant execute to authenticated users
REVOKE ALL ON FUNCTION update_streak(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_streak(uuid) TO authenticated;

-- ============ UPDATED_AT TRIGGERS ============
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_questions_updated_at ON questions;
CREATE TRIGGER trigger_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_answers_updated_at ON answers;
CREATE TRIGGER trigger_answers_updated_at
  BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();