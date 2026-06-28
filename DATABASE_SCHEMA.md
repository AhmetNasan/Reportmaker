# DATABASE SCHEMA DOCUMENTATION

## 1. Core Tables

### `work_orders`
Main tracking table for all work orders.
- `id`: uuid (Primary Key)
- `work_order`: text (Unique, used as reference)
- `description`: text
- `status`: text
- `pwa_engineer`: text
- `target_start_date`: timestamptz
- `target_finish_date`: timestamptz
- `location`: text
- `latitude`: float8
- `longitude`: float8
- `is_sent_to_fab`: boolean
- `fab_history`: jsonb
- `style_settings`: jsonb
- `reported_by`: text
- `reported_date`: timestamptz
- `status_update_date`: timestamptz
- `qbc_comments`: text
- `ro`: text
- `tdp`: text
- `application_date`: timestamptz
- `tdp_status`: text
- `tdp_expiry_date`: timestamptz
- `media_announcement`: text
- `priority`: text
- `month`: text
- `completion_status`: text
- `ready_for_installation`: boolean
- `installation_status`: text
- `assigned_team`: text
- `assigned_date`: timestamptz
- `planned_installation_date`: date
- `actual_installation_date`: date
- `dispatch_time`: timestamptz
- `dispatch_user`: text
- `sequence_order`: integer
- `created_at`: timestamptz
- `last_modified_at`: timestamptz

### `manufacturing`
Technical specifications for fabrication.
- `work_order_number`: text (FK to work_orders.work_order)
- `road_catg`: text
- `sign_type`: text
- ... (standard spec fields)

### `profiles`
User metadata and approval status.
- `id`: uuid (Auth.users.id)
- `email`: text
- `full_name`: text
- `mobile`: text
- `position`: text
- `is_approved`: boolean
- `is_admin`: boolean
- `role`: text
- `created_at`: timestamptz

## 2. Installation Module

### `installation_teams`
Teams available for deployment.
- `id`: uuid
- `team_name`: text
- `supervisor`: text
- `crew_size`: integer
- `capacity_per_day`: integer
- `vehicle`: text
- `status`: text

### `installation_groups`
Clusters of work orders for planning.
- `id`: uuid
- `group_name`: text
- `assigned_team_id`: uuid (FK to installation_teams)
- `ai_generated`: boolean
- ...

### `installation_records`
Audit trail of installation status changes.
- `work_order`: text
- `team_name`: text
- `status`: text
- `completion_date`: timestamptz
- `recorded_by`: text
- ...

## 3. Reminders & Follow-Up

### `work_order_reminders`
- `id`: uuid
- `work_order_number`: text
- `title`: text
- `reminder_datetime`: timestamptz
- `status`: text (upcoming, completed, overdue)
- `assigned_to`: uuid (FK to profiles)
- ...

### `followup_notes`
Sticky notes and informal follow-up.
- `id`: uuid
- `body`: text
- `color`: text
- `rotation_deg`: numeric
- `created_by`: uuid (FK to profiles)
- `is_archived`: boolean
- ...

## 4. System & Logs

### `audit_logs`
Global action logging.
- `user_email`: text
- `action`: text
- `details`: text
- `work_order`: text
- `created_at`: timestamptz

### `ai_settings`
- `ai_enabled`: boolean
- `provider_name`: text
- `ai_model`: text
- `api_key`: text
- ...
