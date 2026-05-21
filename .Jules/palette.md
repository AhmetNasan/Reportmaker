## 2026-05-21 - [Accessibility: Button Semantics]
**Learning:** This application heavily uses non-semantic <div> elements for interactive controls (e.g., user avatar, sidebar toggles). This breaks keyboard navigation and screen reader support.
**Action:** Always check if a clickable element is a <button> or <a>. If not, convert it to a semantic element or add appropriate ARIA roles and tabIndex. Use aria-expanded for stateful toggles.
