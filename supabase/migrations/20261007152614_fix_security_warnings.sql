/*
# Fix security advisor warnings

1. Set explicit search_path on update_updated_at() trigger function
2. Revoke EXECUTE on update_streak() from anon role (only authenticated should call it)
*/

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_streak(uuid) FROM anon;
