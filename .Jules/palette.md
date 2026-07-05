## 2025-05-14 - [Custom Component Accessibility & Interactivity]
**Learning:** Custom interactive elements (like `div`-based swatches) lack native keyboard support and focus indicators.
**Action:** Always add `role="button"`, `tabindex="0"`, and `aria-label`. Use a global keydown listener to trigger `.click()` on `Enter`/`Space`. Ensure `:focus-visible` styles include scaling and high-contrast outlines for tactile feedback.
