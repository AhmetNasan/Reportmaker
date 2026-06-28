# DATABASE ANALYSIS REPORT

## 1. Executive Summary
This report details the discrepancies between the current Supabase database schema and the requirements derived from a static analysis of the `index.html` application codebase. The application expects a significantly more extensive schema than what is currently implemented, including 11 missing tables, several missing storage buckets, and numerous missing columns in existing tables.

## 2. Table Inventory

### Existing Tables
| Table Name | Status in Code | Notes |
|------------|----------------|-------|
| `ai_settings` | Used | Requires significant column updates to match code. |
| `exported_pdfs` | Used | Matches. |
| `installation_teams` | Used | Matches. |
| `manufacturing` | Used | Matches. |
| `photos` | Used | Legacy photo reference table. Still used for primary photo. |
| `profiles` | Used | Requires additional columns (full_name, mobile, role, etc). |
| `project_boundaries` | Used | Matches. |
| `reminder_activity_log` | Used | Matches. |
| `reminder_photos` | Used | Matches. |
| `reminders` | **Discrepancy** | Code expects `work_order_reminders`. |
| `test_connection` | Unused | Legacy/Test table. |
| `test_mcp` | Unused | Legacy/Test table. |
| `user_audit_log` | **Discrepancy** | Code expects `audit_logs`. |
| `work_order_attachments`| Used | Matches. |
| `work_order_comments` | Used | Matches. |
| `work_orders` | Used | Requires major column additions (GPS, status fields, etc). |

### Missing Tables (Required by Code)
1. `audit_logs` (Functionally replaces `user_audit_log`)
2. `followup_notes`
3. `followup_note_photos`
4. `installation_activities`
5. `installation_group_members`
6. `installation_groups`
7. `installation_packages`
8. `installation_photos`
9. `installation_programs`
10. `installation_records`
11. `map_history`
12. `notifications`
13. `reminder_notifications`
14. `reminder_snooze_history`
15. `work_order_reminders` (Functionally replaces `reminders`)

## 3. Column Discrepancies

### `work_orders`
The existing table is missing critical operational fields used for GIS, Installation, and Permits:
- `latitude`, `longitude` (float8)
- `is_sent_to_fab` (boolean)
- `fab_history` (jsonb)
- `style_settings` (jsonb)
- `reported_by`, `reported_date`, `status_update_date`
- `qbc_comments`, `ro`, `tdp`, `application_date`, `tdp_status`, `tdp_expiry_date`, `media_announcement`
- `priority`, `month`, `completion_status`
- `ready_for_installation`, `installation_status`, `assigned_team`, `assigned_date`
- `planned_installation_date`, `actual_installation_date`, `dispatch_time`, `dispatch_user`, `sequence_order`

### `profiles`
Missing fields:
- `full_name` (text)
- `mobile` (text)
- `position` (text)
- `role` (text) - Note: existing `is_admin` exists but code relies on `role`.

### `ai_settings`
The existing schema uses different field names:
- `enabled` vs `ai_enabled`
- `provider` vs `provider_name`
- `model` vs `ai_model`
Missing: `api_base_url`, `minutes_per_sign`, `default_grouping_instructions`, `updated_by`.

## 4. Storage Bucket Discrepancies

### Missing Buckets
- `installation-photos`
- `followup-note-photos`
- `reminder-photos` (Code uses this, but it's missing from the provided list)

### Existing Buckets
- `qbc-storage`
- `Background`

## 5. Potential Issues & Bugs Found
1. **Naming Inconsistency**: The database uses `user_audit_log` but the code calls `audit_logs`.
2. **Schema Mismatch**: `ai_settings` in the database will cause errors when the application tries to update it using the `settings` object keys found in `saveAISettings()`.
3. **Missing RLS**: Many new tables will require RLS policies to function with the `authenticated` role.
4. **Hardcoded Admin**: The code has a hardcoded `PRIMARY_ADMIN_EMAIL` ('ahmetnasan1993@gmail.com') which bypasses some `is_approved` checks.

## 6. Recommendations
1. **Synchronize Names**: Create the tables with the names expected by the code (`audit_logs`, `work_order_reminders`).
2. **Migration Scripts**: Include `INSERT INTO ... SELECT * FROM` for the renaming of `reminders` and `user_audit_log` to ensure no data is lost.
3. **Additive Updates**: Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for `work_orders` and `profiles` to bring them up to date without risk.
4. **Standardize UUIDs**: Ensure all new tables use UUID primary keys as requested.
