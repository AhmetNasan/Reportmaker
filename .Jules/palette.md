# Palette UX Journal

## 2025-05-15 - [Initial Entry]
**Learning:** This application uses a mix of semantic buttons and non-semantic interactive elements. Many semantic buttons lack a standard reset style, leading to inconsistent visual rendering when used for icon-only controls. Additionally, navigation state is visually managed but lacks ARIA indicators for screen readers.
**Action:** Implement a global `.btn-reset` utility and ensure `aria-current="page"` is synchronized during navigation transitions.

## 2025-05-15 - [Accessible Button Resets]
**Learning:** Using `outline: none` in CSS reset classes like `.btn-reset` removes the default focus indicator, making the interface inaccessible for keyboard users. Always provide a high-contrast `:focus-visible` style when stripping default button borders and backgrounds.
**Action:** When creating utility classes for icon or text-link buttons, include a `:focus-visible` rule that utilizes the theme's accent color and an `outline-offset` to ensure visibility across different backgrounds.

## 2025-05-15 - [Robust SPA Navigation Selection]
**Learning:** Selecting navigation elements based on the content of their `onclick` attributes (e.g., `[onclick*="showPage('...')"]`) is brittle and prone to breakage if the attribute's syntax changes.
**Action:** Use dedicated `data-*` attributes (e.g., `data-page="dashboard"`) for state management and DOM selection in single-page applications.
