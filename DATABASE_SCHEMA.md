# DATABASE SCHEMA DOCUMENTATION

## 1. Core Module

### `work_orders`
Master record for all work orders. PK: `work_order`.
- `id` (UUID): Internal unique identifier for relationship mapping.
- `status`: Lifecycle phase.
- `latitude` / `longitude`: GIS coordinates.
- `ready_for_installation`: Flag for readiness.

### `manufacturing`
Technical sign specs and fab progress.
- `work_order_number`: FK to `work_orders`.
- `fab_status`: Progress status.

### `profiles`
User authorization and metadata.
- `id`: PK, references `auth.users`.
- `role`: Permission level.

### `photos`
Legacy and compatibility photo references.

## 2. Installation & Logistics

### `installation_teams`
Field crews.
- `team_name`: Unique name.
- `created_by`: RLS ownership.

### `installation_records`
Field audit trail.
- `work_order`: Target WO.
- `gps_coordinates`: Captured at completion.
- `signature_url`: Signature image reference.

### `installation_groups`, `installation_packages`, `installation_programs`, `installation_activities`
Supporting logistics and planning structures.

## 3. Productivity & Communication

### `work_order_reminders`
Time-based alerts.
- `reminder_datetime`: Scheduled time.

### `followup_notes`
Digital sticky notes.

### `reminder_photos`, `followup_note_photos`
Bucket-linked photo metadata for reminders and notes.

## 4. System & Support

### `audit_logs`
Action logging for security.

### `notifications`
User and system notification system.

### `ai_settings`
Global AI grouping and routing configuration.

### `exported_pdfs`, `work_order_attachments`, `work_order_comments`, `map_history`, `project_boundaries`
Infrastructure and extension tables.
