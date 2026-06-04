-- Count only duplicate candidate groups in the review progress summary.

CREATE OR REPLACE VIEW public.coral_identity_review_summary AS
SELECT
  COUNT(*) FILTER (WHERE review_status = 'candidate')::INTEGER AS pending_groups,
  COUNT(*) FILTER (WHERE review_status = 'confirmed')::INTEGER AS confirmed_groups,
  COUNT(*) FILTER (WHERE review_status = 'needs_split')::INTEGER AS split_groups,
  COUNT(*) FILTER (WHERE review_status = 'rejected')::INTEGER AS rejected_groups,
  COUNT(*)::INTEGER AS total_review_groups
FROM public.coral_identity_candidates;

GRANT SELECT ON public.coral_identity_review_summary TO anon, authenticated;
