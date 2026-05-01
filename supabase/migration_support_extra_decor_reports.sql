-- Support "extra decor" reports for map cells.
-- Run this in the Supabase SQL Editor after migration_add_decor_id.sql.

ALTER TABLE public.cell_reports
ADD COLUMN IF NOT EXISTS decor_id TEXT DEFAULT NULL;

-- Make report_type explicit and future-proof. Drop any older constraint first
-- because a previous check may allow only not_pure/missing_decor.
ALTER TABLE public.cell_reports
DROP CONSTRAINT IF EXISTS cell_reports_report_type_check;

ALTER TABLE public.cell_reports
ADD CONSTRAINT cell_reports_report_type_check
CHECK (report_type IN ('not_pure', 'missing_decor', 'extra_decor'));

-- One extra-decor report per user/cell/decor. This mirrors missing_decor and
-- prevents duplicate inserts without blocking different decor IDs.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_extra_decor
ON public.cell_reports (s2_cell_id, user_id, decor_id)
WHERE report_type = 'extra_decor';

-- Keep the egress-optimized summary RPC aligned with the frontend. Older
-- versions returned only added_decors, so extra reports could be written but
-- not summarized for clients using the RPC path.
CREATE OR REPLACE FUNCTION public.get_cell_reports_summary(cell_ids TEXT[])
RETURNS TABLE (
  s2_cell_id TEXT,
  is_not_pure BOOLEAN,
  added_decors TEXT[],
  removed_decors TEXT[]
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    cr.s2_cell_id,
    bool_or(cr.report_type = 'not_pure') AS is_not_pure,
    COALESCE(
      array_agg(DISTINCT cr.decor_id) FILTER (
        WHERE cr.report_type = 'missing_decor' AND cr.decor_id IS NOT NULL
      ),
      ARRAY[]::TEXT[]
    ) AS added_decors,
    COALESCE(
      array_agg(DISTINCT cr.decor_id) FILTER (
        WHERE cr.report_type = 'extra_decor' AND cr.decor_id IS NOT NULL
      ),
      ARRAY[]::TEXT[]
    ) AS removed_decors
  FROM public.cell_reports cr
  WHERE cr.s2_cell_id = ANY(cell_ids)
  GROUP BY cr.s2_cell_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_cell_reports_summary(TEXT[]) TO anon, authenticated;
