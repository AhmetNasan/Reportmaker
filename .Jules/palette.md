## 2025-05-15 - Enhanced Authentication Feedback and Keyboard Support
**Learning:** In single-page applications with CDN-based dependencies (like Supabase), users expect standard web behaviors such as 'Enter' key submission and immediate visual feedback (loading spinners/disabled states) for asynchronous operations to feel 'app-like'.
**Action:** Always implement try...finally blocks to manage button loading states and ensure keyboard event listeners (onkeydown) are present for all form-like input fields.
