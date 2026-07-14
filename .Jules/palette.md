## 2025-05-15 - [Accessibility Refactoring for Custom Components]
**Learning:** Interactive elements implemented as `div` or `span` tags are not keyboard focusable and lack native activation support (Enter/Space keys), creating significant barriers for accessibility.
**Action:** Always refactor custom interactive components into semantic `<button type="button">` elements. Use a `.btn-reset` utility class to maintain visual design while gaining native accessibility benefits. Ensure `aria-label` is used for icon-only or color-only buttons.
