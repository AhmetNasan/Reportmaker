
## 2024-05-24 - [Accessibility: Non-semantic Interactive Elements]
**Learning:** Standalone HTML prototypes often use non-semantic `div` elements for navigation and menus, which are not keyboard-focusable or screen-reader friendly.
**Action:** Always refactor interactive `div` elements to semantic `<button>` tags and apply a CSS reset (`border: none`, `background: transparent`, `font: inherit`) to maintain visual parity while enabling native keyboard accessibility.

## 2024-05-24 - [Verification: Python Playwright for Standalone HTML]
**Learning:** In environments with incomplete Node.js setups (missing package.json), Python's Playwright library provides a robust alternative for verifying UI and accessibility logic in standalone HTML files.
**Action:** Use Python Playwright with absolute `file://` paths and sync-api for rapid, reliable verification of ARIA state transitions and keyboard navigation.
