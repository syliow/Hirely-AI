## 2024-05-22 - AuditResults List Optimization
**Learning:** React.memo coupled with component extraction is highly effective for list items in Next.js/React 19 apps to prevent unnecessary re-renders during parent state changes (like toggles or unrelated inputs). Splitting sort (O(N log N)) and filter (O(N)) into separate useMemos prevents expensive resorting on simple search queries.
**Action:** Apply this pattern to any other large lists where items are complex and parent component has independent state.

## 2024-05-23 - FormattedText Re-render Optimization
**Learning:** `FormattedText` was re-rendering on every keystroke in the chat interface because it wasn't memoized and its parent `ChatInterface` updates frequently. This caused O(N) regex overhead for the entire chat history on every input change.
**Action:** Always wrap text-heavy display components in `React.memo` if they are children of interactive components (like chat inputs). Extract regexes to module scope to avoid reallocation.
