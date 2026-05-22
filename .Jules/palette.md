## 2025-05-15 - Accessibility Refactoring of Pseudo-buttons
**Learning:** The application uses many non-semantic elements (like `div`) with `onclick` handlers for critical navigation and menus. These are invisible to screen readers and cannot be focused via keyboard.
**Action:** Replace interactive `div` elements with semantic `<button>` elements and ensure they have `aria-label` and `aria-expanded` attributes where appropriate.
