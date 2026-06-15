## 2025-05-15 - [Improving topbar and sidebar accessibility]
**Learning:** Icon-only buttons and interactive `div` elements are common in this app. Converting these to semantic `<button>` elements with `aria-label` significantly improves keyboard navigation and screen reader support without affecting the visual design, thanks to utility classes like `.btn-reset`.
**Action:** Always check for `onclick` handlers on non-interactive elements (like `div`) and convert them to `<button>` with appropriate ARIA attributes.
