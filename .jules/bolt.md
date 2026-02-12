## 2024-05-22 - AuditResults List Optimization
**Learning:** React.memo coupled with component extraction is highly effective for list items in Next.js/React 19 apps to prevent unnecessary re-renders during parent state changes (like toggles or unrelated inputs). Splitting sort (O(N log N)) and filter (O(N)) into separate useMemos prevents expensive resorting on simple search queries.
**Action:** Apply this pattern to any other large lists where items are complex and parent component has independent state.

## 2026-02-12 - JSDOM Environment Issue in Next.js Dev/Build
**Learning:** `isomorphic-dompurify` (and its dependency `jsdom`) causes `ENOENT: no such file or directory, open '/app/.next/browser/default-stylesheet.css'` errors during `next dev` and `next build` in this environment (likely due to path resolution in bundled server components).
**Action:** When running local verification that involves the server, temporary mocking of `sanitizeHtml` (e.g. `const DOMPurify = { sanitize: (h) => h }`) may be necessary to bypass this if the feature under test does not rely on sanitization. Do NOT commit this mock.
