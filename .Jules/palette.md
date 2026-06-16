# Palette's Journal - QBC Platform

## 2025-05-15 - [Initial Exploration]
**Learning:** The application uses a monolithic `index.html` with a lot of interactive icon-only buttons that rely solely on `title` attributes, which are not sufficient for screen readers. Additionally, theme state is not persisted, leading to a jarring experience on reload.
**Action:** Always ensure `aria-label` accompanies `title` for icon-only buttons and implement persistence for UI state like themes.
