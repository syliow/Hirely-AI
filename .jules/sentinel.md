## 2024-05-23 - Random Identifier Bypass in Rate Limiting
**Vulnerability:** Rate limiting logic used `Math.random()` to generate identifiers for anonymous users (missing IP headers), effectively granting infinite quota to attackers who strip headers.
**Learning:** Developers intended to prevent "shared rate limit" for innocent anonymous users but inadvertently removed all rate limits. This prioritized usability over security ("Fail Open" instead of "Fail Secure").
**Prevention:** Always use a stable identifier (e.g. "anonymous" or "unknown") for unidentifiable clients to enforce a shared limit, or deny access. Never use random values for identity in security controls.
