## 2025-05-15 - [Accessible Dropdowns and Global Interaction]
**Learning:** This application extensively uses non-semantic `div` elements for interactive menus, which lack keyboard support and ARIA state. Furthermore, custom dropdowns were missing "click-outside" behavior, leading to a cluttered UI if users didn't explicitly toggle them closed.
**Action:** When refactoring interactive elements, always convert `div` to `<button>`, manage `aria-expanded` dynamically, and implement a global click listener for "click-outside" closure to meet standard UX expectations.
