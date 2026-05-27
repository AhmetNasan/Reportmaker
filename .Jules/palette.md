## 2026-05-27 - [Async Interaction Feedback Pattern]
**Learning:** In a single-file platform with direct Supabase integration, asynchronous operations like auth and large CSV uploads can leave the user wondering if the action was triggered. Standardizing a pattern of disabling the trigger button and showing a spinner improves perceived performance and prevents duplicate submissions.
**Action:** Always add loading states (disable + spinner) to any function performing a 'fetch' or Supabase call, and ensure ARIA labels are present on the resulting icon-only states.
