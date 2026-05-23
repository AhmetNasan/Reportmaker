## 2025-05-15 - Accessibility Refactoring with Visual Parity
**Learning:** In single-file HTML applications with custom CSS, refactoring non-semantic interactive `div` elements to `<button>` for keyboard accessibility requires a specific CSS reset (border, background, font, text-align, width) to avoid breaking the layout while gaining a11y benefits.
**Action:** Always include a CSS reset for `<button>` elements when replacing `div` click handlers to ensure they maintain the original design's visual weight and alignment.
