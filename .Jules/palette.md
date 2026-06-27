## 2025-06-27 - [Authentication Flow Accessibility]
**Learning:** Authentication forms often lack keyboard ergonomics (Enter-to-submit) and explicit ARIA labels for screen readers when using placeholder-only inputs. Converting div-based links to button-reset buttons improves keyboard focusability.
**Action:** Always ensure authentication inputs have `onkeydown` handlers for the submit action and proper `aria-label` attributes.
