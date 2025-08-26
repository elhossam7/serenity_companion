# Security Notes (P2)

Scope: Basic data minimization and safety signals across journaling and AI assistant.

What we implemented
- Input sanitization: `src/utils/sanitize.js` used by JournalEditor and AiAssistant to neutralize potentially unsafe text before rendering/inserting.
- Crisis detection heuristic: non-invasive keyword/length checks in `src/pages/ai-powered-journaling/index.jsx` triggering `EmergencyOverlay` with localized resources.
- Consent persistence: `ConsentGate` updates `user_profiles.has_consented` and `consent_accepted_at`; added migration `supabase/migrations/20250826120000_consent_fields.sql`.
- RLS: Added a targeted policy to allow users to update their own consent fields (adjust if your project already manages RLS policies separately).

Assumptions and limits
- Journals stored server-side via Supabase under RLS; client-side encryption is not yet implemented. Consider adding E2EE for highly sensitive notes in a later phase.
- Sanitization is conservative and text-only; attachments and rich content are out-of-scope for this pass.
- Heuristic crisis detection is best-effort; does not replace professional assessment.

Next steps (optional)
- Client-side encryption for journal entries with user-held key material.
- Broader RLS audit and tests for all tables (`journal_entries`, `mood_entries`, etc.).
- Sentry and privacy-friendly analytics gated by consent.
