## 2025-05-15 - [Semantic Button Refactoring]
**Learning:** Using the `.btn-reset` class to convert legacy interactive `div` elements (like "Forgot Password?" or auth toggles) into semantic `<button type="button">` elements significantly improves keyboard accessibility (tab focus, Enter/Space support) without breaking existing styling, provided the project's CSS already defines a robust reset for buttons.
**Action:** Always prefer `<button type="button">` for non-link interactive elements and ensure appropriate ARIA labels are added to fields that lack visible semantic labels.
