## 2024-05-22 - AuditResults List Optimization
**Learning:** React.memo coupled with component extraction is highly effective for list items in Next.js/React 19 apps to prevent unnecessary re-renders during parent state changes (like toggles or unrelated inputs). Splitting sort (O(N log N)) and filter (O(N)) into separate useMemos prevents expensive resorting on simple search queries.
**Action:** Apply this pattern to any other large lists where items are complex and parent component has independent state.

## 2024-05-22 - Chat List Optimization
**Learning:** Extracting list items (like `ChatMessage`) into memoized components is crucial for chat interfaces where the parent component re-renders frequently (e.g., on every keystroke). This prevents O(N) re-renders of the entire message history.
**Action:** Always check inline list rendering in components that manage high-frequency input state.
