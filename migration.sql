-- Migration Script for work_orders table to match new CSV structure

-- 1. Rename existing columns to match the new structure
ALTER TABLE work_orders RENAME COLUMN lat TO latitude;
ALTER TABLE work_orders RENAME COLUMN lng TO longitude;
ALTER TABLE work_orders RENAME COLUMN pwa_eng TO pwa_engineer;
ALTER TABLE work_orders RENAME COLUMN target_start TO target_start_date;
ALTER TABLE work_orders RENAME COLUMN target_finish TO target_finish_date;
ALTER TABLE work_orders RENAME COLUMN expiry_date TO tdp_expiry_date;

-- 2. Add new columns for fields that were previously calculated or missing
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS month TEXT;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS completion_status TEXT;

-- 3. Ensure columns exist for all 21 core fields
-- work_order (already exists as primary key or unique)
-- description (already exists)
-- status (already exists)
-- latitude (renamed)
-- longitude (renamed)
-- reported_by (already exists)
-- reported_date (already exists)
-- pwa_engineer (renamed)
-- location (already exists)
-- target_start_date (renamed)
-- month (added)
-- target_finish_date (renamed)
-- status_update_date (already exists)
-- completion_status (added)
-- qbc_comments (already exists)
-- ro (already exists)
-- tdp (already exists)
-- application_date (already exists)
-- tdp_status (already exists)
-- tdp_expiry_date (renamed)
-- media_announcement (already exists)

COMMENT ON TABLE work_orders IS 'Table storing core Work Order data for Qatar Building Company Engineering Platform';
