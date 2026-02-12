## 2024-05-22 - [Chat Modal Accessibility]
**Learning:** Using `aria-modal="true"` on a custom dialog without implementing a focus trap can be confusing for keyboard users as focus can escape to the background content which is supposed to be inert.
**Action:** For simple enhancements without focus trap logic, consider omitting `aria-modal="true"` or ensuring a focus trap is implemented if time permits. Ideally, use a library or hook for focus management.
