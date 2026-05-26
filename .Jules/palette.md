## 2025-05-26 - Semantic Refactoring for Interactive Elements
**Learning:** In this standalone `index.html` architecture, many interactive elements were implemented using non-semantic `div` tags with `onclick` handlers. This prevents keyboard navigation and screen reader accessibility. Refactoring these to `<button>` elements requires a CSS reset (`.btn-reset`) to maintain visual parity with the original design.
**Action:** When encountering interactive `div` elements, refactor them to semantic `<button>` tags with `aria-label` and use a dedicated reset class to preserve the intended layout.
