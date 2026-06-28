# DATABASE SCHEMA DOCUMENTATION

## 1. Core Module

### `work_orders`
Authoritative record for all project work orders.
- `work_order` (PK): Standard identifier (e.g., '25289532').
- `id`: Internal UUID for relationships.
- `status`: Current lifecycle phase.
- `latitude` / `longitude`: GIS coordinates for map rendering.

### `manufacturing`
Technical sign specifications and fabrication tracking.
- `work_order_number`: Foreign key to `work_orders`.
- `fab_status`: Current fabrication state.

### `profiles`
Extended user data and authorization.
- `id`: References `auth.users`.
- `role`: Permission level.

## 2. Installation & Logistics

### `installation_teams`
Teams assigned to field work.
- `team_name`: Unique team identifier.
- `created_by`: Ownership for RLS.

### `installation_records`
Audit trail of field completions and status updates.
- `work_order`: References `work_orders`.

### `installation_photos`
Photo documentation (Before/During/After).

## 3. Productivity & Communication

### `work_order_reminders`
Scheduled alerts and tasks.
- `reminder_datetime`: When the alert triggers.
- `created_by`: Ownership for RLS.

### `followup_notes`
Interactive sticky notes for quick follow-up.

## 4. System & Support

### `audit_logs`
Centralized action logging for security and troubleshooting.

### `ai_settings`
Global configuration for AI-assisted sign grouping and route optimization.

### `project_boundaries`
GeoJSON data defining the project area.
