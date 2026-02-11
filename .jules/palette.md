## 2026-02-11 - Critical Notification Accessibility Pattern
**Learning:** Notifications need distinct `role` and `aria-live` attributes based on their urgency (error vs success) to ensure screen readers announce them appropriately. A static `role="status"` isn't enough for errors.
**Action:** Always map notification types to specific ARIA roles: `error` -> `alert` (assertive), `success` -> `status` (polite).
