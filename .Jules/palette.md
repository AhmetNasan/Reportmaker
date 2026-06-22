# Palette's Journal - UX & Accessibility Learnings

## 2025-05-15 - Icon-Only Button Accessibility and Feedback
**Learning:** Icon-only buttons often lack descriptive `aria-label` attributes and visible focus states, especially when using "reset" classes that strip default browser styling. This makes them inaccessible to screen readers and difficult to navigate via keyboard. Additionally, without subtle hover/active states, they lack tactile feedback.
**Action:** Always pair icon-only buttons with `aria-label`. Define a standard `.btn-reset` class that includes `:focus-visible` outlines and interactive states (opacity/scale) using existing design tokens. Ensure dynamic HTML generators (like for tables or calendars) also inject these attributes.
