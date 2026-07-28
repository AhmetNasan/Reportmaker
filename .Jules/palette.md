## 2025-05-15 - [Accessible Color Swatches Pattern]
**Learning:** In this vanilla JS environment, interactive elements often use `div` with `onclick`. These are invisible to screen readers and keyboard users.
**Action:** Always apply `role="button"`, `tabindex="0"`, and `aria-label` to these elements, and bridge the gap with a global `keydown` listener in `setupFUCListeners` to map 'Enter'/'Space' to `click()`.
