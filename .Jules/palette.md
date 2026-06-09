## 2025-05-15 - Visual Feedback for Async Operations
**Learning:** Asynchronous operations in the app (like authentication and profile saving) already implemented button disabling in JavaScript, but lacked corresponding CSS `:disabled` states. This resulted in a "frozen" feeling where the UI was non-responsive but gave no visual indication of why.
**Action:** Always ensure `:disabled` states are defined in the global design system (e.g., `opacity: 0.7` and `cursor: not-allowed`) to provide immediate visual feedback when buttons are programmatically disabled during loading states.

## 2025-05-15 - Keyboard Accessibility in Auth Flows
**Learning:** Users naturally expect 'Enter' to submit forms, especially in authentication screens. Relying solely on `onclick` handlers on buttons creates a barrier for keyboard-centric users.
**Action:** Implement `onkeydown` handlers for 'Enter' on all authentication input fields, or wrap them in a semantic `<form>` with an `onsubmit` handler to ensure standard web behavior.
