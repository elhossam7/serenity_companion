# Serenity Companion — MVP ➜ Full App Improvement Tasks

This is a prioritized, actionable backlog to evolve the current MVP into a production-ready app. Items include scope, acceptance criteria, and pointers to affected files. Use the sprint plan at the end to sequence delivery.

Legend: [P0]=Blocker, [P1]=High, [P2]=Medium, [P3]=Nice-to-have

---

## P0 — Immediate Run/Setup Blockers

- [ ] Node/runtime alignment and start script
  - Scope: Ensure dev server works reliably on modern Node.
  - Actions:
    - Update README prerequisites to Node 18+ (Vite 5 requires Node ≥18).
    - Optionally add `"engines": { "node": ">=18" }` in `package.json`.
    - Ensure `npm run dev` alias for `vite` (keep `npm start` if desired).
  - Acceptance: `npm start` or `npm run dev` boots without crash.

- [ ] Supabase environment variables and DX
  - Scope: App throws if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` missing (`src/lib/supabase.js`).
  - Actions:
    - Add `.env.example` with the two keys.
    - Document environment setup and how to get keys from Supabase.
  - Acceptance: With a valid `.env`, app starts; without it, a clear setup message is shown in README.

- [ ] Vite server config sanity
  - Scope: `vite.config.mjs` has strict port 4028 and allowedHosts for external domains.
  - Actions:
    - Keep `strictPort: true` only if needed; otherwise relax or document.
    - Remove or document `allowedHosts` unless required.
  - Acceptance: Local dev works on Windows without host/port conflicts.

- [ ] Route guards and auth flow consistency
  - Scope: Pages mix mock localStorage auth and Supabase AuthContext.
  - Actions:
    - Introduce a ProtectedRoute wrapper or guard logic.
    - Remove localStorage-only mock auth; rely on Supabase session from `AuthContext`.
  - Acceptance: Unauthenticated users are redirected; authenticated users reach dashboards.

---

## P1 — Data Layer and Core Features

- [ ] Implement `moodService` against Supabase
  - Files: `src/services/moodService.js`, `supabase/migrations/...sql` (already defines `mood_entries`).
  - Actions:
    - CRUD: create/get/update/delete entries.
    - Stats: last 30 days, streak via DB function `calculate_mood_streak`, insights via `get_mood_insights`.
  - Acceptance: Quick mood entry saves; mood charts/timeline load from real data.

- [ ] Implement `journalService`
  - Files: `src/services/journalService.js`, table `journal_entries` exists.
  - Actions:
    - CRUD + search, favorites toggle, basic pagination.
  - Acceptance: Journal editor saves drafts to DB; history lists and loads entries.

- [ ] Implement `wellnessService`
  - Files: `src/services/wellnessService.js`, tables `wellness_resources`, `user_resource_interactions`.
  - Actions:
    - Fetch featured resources, record interactions (viewed/completed/rated).
  - Acceptance: Home shows resources; interactions persist.

- [ ] Wire UI to services (remove mocks)
  - Files: `src/pages/**` components using placeholders (e.g., `QuickMoodEntry`, journaling, dashboards).
  - Actions:
    - Replace timeouts/mocks with service calls; optimistic UI + error states.
  - Acceptance: All critical pages function with live data under RLS policies.

- [ ] Auth flows (email/password)
  - Files: `src/contexts/AuthContext.jsx`, `src/pages/user-login/*`, `src/pages/user-registration/*`.
  - Actions:
    - Login/signup with Supabase; email verification; sign out; update profile metadata.
    - Forgot password flow using Supabase reset links.
  - Acceptance: Can register/login/logout/update profile end-to-end.

---

## P1 — AI Assistant (initial production path)

- [ ] Safe AI suggestion backend
  - Scope: Replace frontend mock with secure server/edge function.
  - Actions:
    - Create an API route or Supabase Edge Function that calls provider (OpenAI/Anthropic/etc.).
    - Add content safety filters + rate limiting per user.
  - Acceptance: Journal suggestions generated via backend, not exposed in browser; errors handled gracefully.

- [ ] Client integration
  - Files: `src/pages/ai-powered-journaling/components/AiAssistant.jsx`.
  - Actions:
    - Call backend endpoint; show loading, retry, and empty states.
  - Acceptance: Suggestions appear consistently and can be inserted.

---

## P1 — UX Polish for Critical Flows

- [ ] Global language/i18n state
  - Scope: Many components read from `localStorage` directly.
  - Actions:
    - Introduce i18n provider (e.g., `react-i18next`) with FR/AR (and EN optional).
    - Store preference centrally; update `dir` dynamically.
  - Acceptance: Language switch updates UI instantly across routes.

- [ ] Route-level loading and error surfaces
  - Actions:
    - Skeletons/spinners; empty states; toast/inline error for network failures.
  - Acceptance: No abrupt UI jumps; users see meaningful feedback.

---

## P2 — Privacy, Safety, and Compliance

- [ ] Privacy policy, Terms, disclaimers
  - Actions:
    - Add legal pages and consent gate at first login.
  - Acceptance: Legal links in footer/menu; consent recorded on profile.

- [ ] Crisis detection & EmergencyOverlay triggers
  - Actions:
    - Simple client heuristic (keywords/sentiment) to suggest help.
    - Toggle EmergencyOverlay; provide localized resources.
  - Acceptance: Sensitive patterns trigger non-alarming help prompt.

- [ ] Data minimization and security
  - Actions:
    - Sanitize inputs; consider client-side encryption for journals (optional phase).
    - Review RLS policies and verified behaviors.
  - Acceptance: Basic security review completed and notes tracked.

---

## P2 — PWA and Offline Readiness

- [ ] Service worker + caching
  - Actions:
    - Add Vite PWA plugin, cache shell/assets; respectful of privacy.
  - Acceptance: Installable PWA; offline reads for last-synced content (optional).

- [ ] Push or local notifications (reminders)
  - Actions:
    - Local notifications or email reminders for mood logging.
  - Acceptance: Opt-in reminders functioning with clear settings.

---

## P2 — Observability and Analytics

- [ ] Error monitoring
  - Actions:
    - Integrate Sentry (frontend) with DSN via env.
  - Acceptance: Errors appear in dashboard with source maps.

- [ ] Privacy-friendly analytics
  - Actions:
    - Add Umami/FS Analytics with consent controls.
  - Acceptance: Basic usage metrics tracked without PII.

---

## P2 — Testing and Quality Gates

- [ ] Linting and formatting
  - Actions:
    - ESLint + Prettier; CI job; pre-commit hooks with Husky.
  - Acceptance: `npm run lint` and `npm run format` pass in CI.

- [ ] Unit/integration tests
  - Actions:
    - Test services with Supabase client mocked; core components with RTL.
  - Acceptance: 20–30% coverage on critical paths.

- [ ] E2E smoke tests
  - Actions:
    - Playwright: login, create journal, log mood, view dashboard.
  - Acceptance: CI runs E2E on PRs.

---

## P3 — Performance and DX

- [ ] Performance pass
  - Actions:
    - Route-level code splitting; image optimization; memoization; Lighthouse ≥90 on mobile.
  - Acceptance: Metrics documented with before/after.

- [ ] Developer experience
  - Actions:
    - `.env.example`, `.nvmrc`, editorconfig; update README with clear runbooks.
  - Acceptance: New devs can set up in <10 minutes.

- [ ] Deployment pipelines
  - Actions:
    - GitHub Actions: build, lint, test; preview deploys (Vercel/Netlify) with envs.
  - Acceptance: PRs auto-deploy previews; main deploys on merge.

---

## Notes on Current Schema (Supabase)

- Migrations define: `user_profiles`, `mood_entries`, `journal_entries`, `wellness_goals`, `wellness_resources`, `user_resource_interactions`, `support_sessions`, `crisis_support_records` + helper functions and RLS.
- Use `AuthContext` to derive `user.id` for ownership fields; all CRUD must include `user_id` and rely on RLS.

---

## File Pointers and Refactors

- Services to implement: `src/services/{moodService,journalService,wellnessService}.js`.
- Supabase client and env: `src/lib/supabase.js`, `.env`.
- Auth/UI wiring: `src/contexts/AuthContext.jsx`, `src/pages/user-login/*`, `src/pages/user-registration/*`.
- Journaling UI: `src/pages/ai-powered-journaling/**/*`.
- Mood UI: `src/pages/mood-tracking-dashboard/**/*`.
- Navigation/guards: `src/Routes.jsx`, add Guard/ProtectedRoute.

---

## Sprint Plan (suggested)

1. Sprint 1 (P0): Env + start reliability, route guards, README/env docs.
2. Sprint 2 (P1): Implement services and wire core pages; auth flows solid.
3. Sprint 3 (P1): AI assistant backend + client integration; journaling end-to-end.
4. Sprint 4 (P2): i18n provider, PWA, basic analytics, crisis prompts.
5. Sprint 5 (P2/P3): Tests, monitoring, performance, CI/CD, polish.

---

## Acceptance and Validation (quality gates)

- Build: Vite dev and build succeed without env errors.
- Lint/Type: ESLint passes.
- Tests: Unit + E2E green in CI.
- Smoke: Login → log mood → save journal → dashboard reflects data.

