# Palette Journal - QBC Engineering Platform

## 2025-05-14 - Icon-only Button Accessibility
**Learning:** Icon-only buttons (GIS tools, theme toggle) often rely solely on the `title` attribute, which is not consistently read by all screen readers and lacks semantic clarity.
**Action:** Always pair `title` with `aria-label` for icon-only buttons to ensure they are accessible to screen reader users.

## 2025-05-14 - Navigation State Semantics
**Learning:** The application uses an `active` class for visual navigation state, but lacks `aria-current="page"` to communicate the current location to assistive technologies.
**Action:** Synchronize `aria-current="page"` with the `active` CSS class in the `showPage` function.
