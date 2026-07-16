## 2025-02-14 - Semantic Button Refactoring & Layout Preservation
**Learning:** When refactoring interactive `div` elements to `<button>` elements using a reset utility (like `.btn-reset`), block-level layout can be lost if the utility uses `inline-flex`. Explicit `display: block; width: 100%` is often required to preserve the original stacking and centering, especially in auth cards.
**Action:** Always verify parent container layout after refactoring and apply explicit block-level overrides if the component relies on vertical stacking.

## 2025-02-14 - DOM Sensitivity in UI Toggles
**Learning:** UI logic that relies on `childNodes` (e.g., `toggleAuthMode`) is extremely sensitive to refactoring. Changing a `div` to a `button` must preserve the exact sequence of text nodes and spans to prevent breaking UI state updates.
**Action:** Use `sed` or `grep` to inspect existing JS logic for `childNodes` or `children` references before refactoring the corresponding HTML structure.
