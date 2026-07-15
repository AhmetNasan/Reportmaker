## 2025-05-15 - [Refactoring interactive div to button]
**Learning:** When refactoring `div` elements with `onclick` to semantic `<button>` elements, existing styles (like `.btn-reset` which removes borders) may conflict with component-specific styles (like `.quick-note-swatch` which uses borders for state). Using `!important` on the specific border property of the component class is necessary to override the utility reset.
**Action:** Always verify that utility resets don't unintentionally strip visual states from specialized interactive components.

**Learning:** Authentication layout often relies on block-level behavior of `div` elements. When converting to `<button>` (which might be `inline-flex` due to utility classes), explicitly apply `display: block; width: 100%` to maintain centered stacking.
**Action:** Preserve layout integrity during accessibility refactors by matching display properties of the original elements.
