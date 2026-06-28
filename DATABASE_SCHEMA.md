# DATABASE SCHEMA DOCUMENTATION

## 1. Core Operations

### `work_orders`
Authoritative record for all work orders. Used as the primary synchronization point for GIS and Installation modules.
- `work_order` (PK): Unique string identifier.
- `id` (UUID): Internal unique identifier for relationship mapping.
- `status`: Current workflow status (e.g., COMP, INPRG, RTNENG).
- `latitude` / `longitude`: GIS coordinates.
- `ready_for_installation`: Boolean flag triggered by Manufacturing 'Done' status.
- `installation_status`: Detailed status for the Installation module (Ready, Assigned, Completed).

### `manufacturing`
Fabrication-specific details.
- `work_order_number` (FK): Links to `work_orders.work_order`.
- `fab_status`: Fabrication progress.
- `sign_type`, `sign_size`, `post_type`, etc.: Technical specifications.

### `profiles`
Extended user metadata.
- `id` (PK): References Supabase `auth.users.id`.
- `is_approved`: Administrative approval flag.
- `role`: User authorization level (Administrator, User).

## 2. Planning & Logistics

### `installation_teams`
Teams available for deployment.
- `team_name` (Unique): Name of the team.
- `supervisor`: Leading staff member.
- `status`: Availability status.

### `installation_records`
Audit trail of installation events and status changes.
- `work_order`: Targeted work order.
- `status`: Status at time of recording.

### `audit_logs`
System-wide activity logging.
- `action`: Type of activity performed.
- `details`: JSON or text description of changes.

## 3. Productivity & Communication

### `work_order_reminders`
Time-based alerts linked to work orders.
- `title`: Alert headline.
- `reminder_datetime`: Scheduled time for alert.
- `assigned_to` (FK): Targeted user for the reminder.

### `followup_notes`
Digital sticky notes for quick follow-up.
- `body`: Content of the note.
- `color`: Visual categorization.
- `rotation_deg`: UI-specific metadata for "scattered" look.

## 4. System Settings

### `ai_settings`
Global configuration for AI-assisted operations.
- `ai_enabled`: Master toggle.
- `api_key`: Encrypted/Hidden in UI.
- `provider_name`: (e.g., BadTheory).
