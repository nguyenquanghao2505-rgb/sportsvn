-- SportsVN - schema/policies cho chức năng Tạo giải đấu thật
-- Chạy TOÀN BỘ file này trong Supabase SQL Editor.

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS start_date date;

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS end_date date;

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS sport text;

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS location text;

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS organizer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS tournaments_organizer_id_idx
  ON public.tournaments(organizer_id);

CREATE INDEX IF NOT EXISTS tournaments_start_date_idx
  ON public.tournaments(start_date);

CREATE INDEX IF NOT EXISTS tournaments_status_idx
  ON public.tournaments(status);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tournaments_select_own" ON public.tournaments;
CREATE POLICY "tournaments_select_own"
  ON public.tournaments
  FOR SELECT
  TO authenticated
  USING (organizer_id = auth.uid());

DROP POLICY IF EXISTS "tournaments_insert_own" ON public.tournaments;
CREATE POLICY "tournaments_insert_own"
  ON public.tournaments
  FOR INSERT
  TO authenticated
  WITH CHECK (organizer_id = auth.uid());

DROP POLICY IF EXISTS "tournaments_update_own" ON public.tournaments;
CREATE POLICY "tournaments_update_own"
  ON public.tournaments
  FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

DROP POLICY IF EXISTS "tournaments_delete_own" ON public.tournaments;
CREATE POLICY "tournaments_delete_own"
  ON public.tournaments
  FOR DELETE
  TO authenticated
  USING (organizer_id = auth.uid());
