## 2025-05-15 - Semantic Button Refactoring for Accessibility
**Learning:** Legacy clickable `div` elements in the authentication module lacked keyboard accessibility. Refactoring these to `<button type="button" class="btn-reset">` with `display: block; width: 100%` restores native tab order and activation while preserving the original layout and vertical stacking.
**Action:** Always check for interactive `div` or `span` elements and convert them to `btn-reset` buttons, ensuring `type="button"` is used to avoid form submission side effects.
