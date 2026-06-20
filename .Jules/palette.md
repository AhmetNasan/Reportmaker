## 2025-05-22 - [Accessibility & Keyboard Nav]
**Learning:** Icon-only interactive elements must have clear `aria-label` attributes and visible focus states. Standard CSS resets often remove default focus rings, which breaks keyboard navigation. Using `:focus-visible` ensures that only keyboard users see the focus indicator, maintaining visual aesthetics for mouse users while providing accessibility.
**Action:** Always pair `.btn-reset` or similar utility classes with a `:focus-visible` outline and ensure every icon-only button has a descriptive `aria-label`.
