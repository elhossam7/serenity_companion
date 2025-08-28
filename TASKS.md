# Serenity Companion — MVP ➜ Full App Improvement Tasks

This is a prioritized, actionable backlog to evolve the current MVP into a production-ready app. Items include scope, acceptance criteria, and pointers to affected files. Use the sprint plan at the end to sequence delivery.

Legend: [P0]=Blocker, [P1]=High, [P2]=Medium, [P3]=Nice-to-have

---

## P0 — Immediate Run/Setup Blockers

- [x] Node/runtime alignment and start script
  - Scope: Ensure dev server works reliably on modern Node.
  - Actions:
    - Update README prerequisites to Node 18+ (Vite 5 requires Node ≥18).
    - Optionally add `"engines": { "node": ">=18" }` in `package.json`.
    - Ensure `npm run dev` alias for `vite` (keep `npm start` if desired).
  - Acceptance: `npm start` or `npm run dev` boots without crash.

- [x] Supabase environment variables and DX
  - Scope: App throws if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` missing (`src/lib/supabase.js`).
  - Actions:
    - Add `.env.example` with the two keys.
    - Document environment setup and how to get keys from Supabase.
  - Acceptance: With a valid `.env`, app starts; without it, a clear setup message is shown in README.

- [x] Vite server config sanity
  - Scope: `vite.config.mjs` has strict port 4028 and allowedHosts for external domains.
  - Actions:
    - Keep `strictPort: true` only if needed; otherwise relax or document.
    - Remove or document `allowedHosts` unless required.
  - Acceptance: Local dev works on Windows without host/port conflicts.

- [x] Route guards and auth flow consistency
  - Scope: Pages mix mock localStorage auth and Supabase AuthContext.
  - Actions:
    - Introduce a ProtectedRoute wrapper or guard logic.
    - Remove localStorage-only mock auth; rely on Supabase session from `AuthContext`.
  - Acceptance: Unauthenticated users are redirected; authenticated users reach dashboards.

---

## P1 — Data Layer and Core Features

- [x] Implement `moodService` against Supabase
  - Files: `src/services/moodService.js`, `supabase/migrations/...sql` (already defines `mood_entries`).
  - Actions:
    - CRUD: create/get/update/delete entries.
    - Stats: last 30 days, streak via DB function `calculate_mood_streak`, insights via `get_mood_insights`.
  - Acceptance: Quick mood entry saves; mood charts/timeline load from real data.

- [x] Implement `journalService`
  - Files: `src/services/journalService.js`, table `journal_entries` exists.
  - Actions:
    - CRUD + search, favorites toggle, basic pagination.
  - Acceptance: Journal editor saves drafts to DB; history lists and loads entries.

- [x] Implement `wellnessService`
  - Files: `src/services/wellnessService.js`, tables `wellness_resources`, `user_resource_interactions`.
  - Actions:
    - Fetch featured resources, record interactions (viewed/completed/rated).
  - Acceptance: Home shows resources; interactions persist.

- [x] Wire UI to services (remove mocks)
  - Files: `src/pages/**` components using placeholders (e.g., `QuickMoodEntry`, journaling, dashboards).
  - Actions:
    - Replace timeouts/mocks with service calls; optimistic UI + error states.
  - Acceptance: All critical pages function with live data under RLS policies.

- [x] Auth flows (email/password)
  - Files: `src/contexts/AuthContext.jsx`, `src/pages/user-login/*`, `src/pages/user-registration/*`.
  - Actions:
    - Login/signup with Supabase; email verification; sign out; update profile metadata.
    - Forgot password flow using Supabase reset links.
  - Acceptance: Can register/login/logout/update profile end-to-end.

---

## P1 — AI Assistant (initial production path)

- [x] Safe AI suggestion backend
  - Scope: Replace frontend mock with secure server/edge function.
  - Actions:
    - Create an API route or Supabase Edge Function that calls provider (OpenAI/Anthropic/etc.).
    - Add content safety filters + rate limiting per user.
  - Acceptance: Journal suggestions generated via backend, not exposed in browser; errors handled gracefully.

- [x] Client integration
  - Files: `src/pages/ai-powered-journaling/components/AiAssistant.jsx`.
  - Actions:
    - Call backend endpoint; show loading, retry, and empty states.
  - Acceptance: Suggestions appear consistently and can be inserted.

---

## P1 — UX Polish for Critical Flows

- [x] Global language/i18n state
  - Scope: Many components read from `localStorage` directly.
  - Actions:
    - Introduce i18n provider (e.g., `react-i18next`) with FR/AR (and EN optional).
    - Store preference centrally; update `dir` dynamically.
  - Acceptance: Language switch updates UI instantly across routes.

- [x] Route-level loading and error surfaces
  - Actions:
    - Skeletons/spinners; empty states; toast/inline error for network failures.
  - Acceptance: No abrupt UI jumps; users see meaningful feedback.

---

## P2 — Privacy, Safety, and Compliance

- [x] Privacy policy, Terms, disclaimers
  - Actions:
    - Add legal pages and consent gate at first login.
  - Acceptance: Legal links in footer/menu; consent recorded on profile.

- [x] Crisis detection & EmergencyOverlay triggers
  - Actions:
    - Simple client heuristic (keywords/sentiment) to suggest help.
    - Toggle EmergencyOverlay; provide localized resources.
  - Acceptance: Sensitive patterns trigger non-alarming help prompt.

- [x] Data minimization and security
  - Actions:
    - Sanitize inputs; consider client-side encryption for journals (optional phase).
    - Review RLS policies and verified behaviors.
  - Acceptance: Basic security review completed and notes tracked. See SECURITY_NOTES.md.

---

## P2 — PWA and Offline Readiness

- [x] Service worker + caching
  - Actions:
    - Add Vite PWA plugin, cache shell/assets; respectful of privacy.
  - Acceptance: Installable PWA; offline reads for last-synced content (optional).

- [x] Push or local notifications (reminders)
  - Actions:
    - Local notifications or email reminders for mood logging.
  - Acceptance: Opt-in reminders functioning with clear settings.

---

## P2 — Observability and Analytics

- [x] Error monitoring
  - Actions:
    - Integrate Sentry (frontend) with DSN via env.
  - Acceptance: Errors appear in dashboard with source maps.

- [x] Privacy-friendly analytics
  - Actions:
    - Add Umami/FS Analytics with consent controls.
  - Acceptance: Basic usage metrics tracked without PII.

---

## P2 — Testing and Quality Gates

- [x] Linting and formatting
  - Actions:
    - ESLint + Prettier; CI job; pre-commit hooks with Husky.
  - Acceptance: `npm run lint` and `npm run format` pass in CI.

- [x] Unit/integration tests
  - Actions:
    - Test services with Supabase client mocked; core components with RTL.
  - Acceptance: 20–30% coverage on critical paths.

- [x] E2E smoke tests
  - Actions:
    - Playwright: login, create jou~rnal, log mood, view dashboard.
  - Acceptance: CI runs E2E on PRs.

---

## P3 — Performance and DX

- [x] Performance pass
  - Actions:
    - Route-level code splitting via React.lazy/Suspense; image fade-in optimization; memoized dashboard cards.
  - Acceptance: Initial route bundle reduced; smoother image loading; components avoid unnecessary re-renders.

- [x] Developer experience
  - Actions:
    - Added `.env.example`, `.nvmrc`, `.editorconfig`; README updated with runbooks for lint/tests/E2E and Node version.
  - Acceptance: New devs can set up in <10 minutes.

- [x] Deployment pipelines
  - Actions:
    - CI already runs build, lint, unit + coverage, and E2E; artifacts (coverage) uploaded. Hook CI to your preview host (Vercel/Netlify) to auto-deploy PRs.
  - Acceptance: CI ready for preview deploy wiring.



## Sprint Plan (suggested)

1. Sprint 1 (P0): Env + start reliability, route guards, README/env docs.
2. Sprint 2 (P1): Implement services and wire core pages; auth flows solid.
3. Sprint 3 (P1): AI assistant backend + client integration; journaling end-to-end.
4. Sprint 4 (P2): i18n provider, PWA, basic analytics, crisis prompts.
5. Sprint 5 (P2/P3): Tests, monitoring, performance, CI/CD, polish.

---

## P2 — Additional Features and Components (Identified from MVP Analysis)

- [x] User profile and settings page
  - Scope: Missing `/profile` and `/settings` routes referenced in Header dropdown.
  - Actions:
    - Create profile management page with photo upload, emergency contacts, preferences.
    - Settings page for notifications, privacy, language, theme preferences.
    - Wire to `user_profiles` table and profile completion percentage.
  - Acceptance: Profile editing works; settings persist; completion percentage updates.

- [x] AI Chat Support page implementation
  - Scope: Routes reference `/ai-chat-support` but page doesn't exist.
  - Actions:
    - Create chat interface component with message history.
    - Integrate with AI backend for conversational support.
    - Add crisis detection and escalation to emergency resources.
  - Acceptance: Chat interface functional; messages persist; crisis detection works.

- [x] Advanced dashboard components enhancement
  - Scope: Several dashboard components use mock data with TODO patterns.
  - Actions:
    - Complete `WellnessSnapshot` with real wellness goals integration.
    - Enhance `PersonalizedRecommendations` with ML-based suggestions.
    - Add real activity tracking to `RecentActivity` component.
  - Acceptance: Dashboard shows live wellness metrics and personalized content.

- [ ] Advanced mood analytics and insights
  - Scope: `AIInsightsPanel` and mood components need ML integration.
  - Actions:
    - Implement pattern recognition for mood triggers and correlations.
    - Advanced charting with mood patterns, weather, activities correlation.
    - Personalized insights based on user's cultural and lifestyle context.
  - Acceptance: AI provides meaningful, culturally-aware mood insights.

- [ ] Wellness goals and progress tracking
  - Scope: Database has `wellness_goals` but limited UI integration.
  - Actions:
    - Goal creation wizard with templates (meditation streaks, mood consistency, etc.).
    - Progress visualization and milestone celebrations.
    - Social support features (anonymous goal sharing, community challenges).
  - Acceptance: Users can set, track, and achieve wellness goals with motivation.

- [ ] Enhanced journaling features
  - Scope: Current journal editor is basic; missing advanced features.
  - Actions:
    - Rich text editor with formatting, attachments, voice notes.
    - Template prompts for different journal types (gratitude, reflection, problem-solving).
    - Mood-before-after tracking with sentiment analysis.
    - Journal analytics (writing patterns, sentiment trends, topic analysis).
  - Acceptance: Full-featured journaling with insights and progress tracking.

- [ ] Cultural adaptation and localization enhancements
  - Scope: App has basic FR/AR translations but needs deeper cultural features.
  - Actions:
    - Islamic calendar integration for mood patterns during Ramadan, religious holidays.
    - Cultural-specific wellness recommendations (family therapy emphasis, community support).
    - Regional mental health resources and emergency contacts.
    - Right-to-left (RTL) layout optimization for Arabic interface.
  - Acceptance: App feels native to Moroccan users with cultural sensitivity.

- [ ] Advanced accessibility and inclusive design
  - Scope: UI components need accessibility improvements.
  - Actions:
    - ARIA labels, keyboard navigation, screen reader optimization.
    - High contrast mode, font size preferences, color-blind friendly design.
    - Voice control support for journaling and mood logging.
    - Cognitive accessibility features (simplified modes, memory aids).
  - Acceptance: WCAG 2.1 AA compliance; usable by users with diverse abilities.

- [ ] Data export and backup features
  - Scope: `JournalToolbar` has export options but limited implementation.
  - Actions:
    - Comprehensive data export (PDF, CSV, JSON) with privacy controls.
    - Automated backup to user's cloud storage (with encryption).
    - Data portability for switching between devices or services.
    - GDPR-compliant data deletion and download requests.
  - Acceptance: Users own their data with full export/import capabilities.

- [ ] Offline-first capabilities and sync
  - Scope: Current app requires internet; need offline functionality.
  - Actions:
    - IndexedDB for offline mood logging and journaling.
    - Service worker with intelligent sync when connection returns.
    - Conflict resolution for offline edits.
    - Offline-available breathing exercises and crisis resources.
  - Acceptance: Core features work offline; seamless sync when online.

- [ ] Advanced notification and reminder system
  - Scope: Basic mood reminder in `BottomNavigation`; needs expansion.
  - Actions:
    - Smart notification timing based on user patterns and preferences.
    - Personalized reminder content (motivational quotes, check-ins, goals).
    - Crisis intervention notifications for concerning patterns.
    - Respectful notification cadence with easy opt-out controls.
  - Acceptance: Notifications improve engagement without being intrusive.

- [ ] Social and community features (optional/Phase 2)
  - Scope: Mental health often benefits from community support.
  - Actions:
    - Anonymous peer support groups with moderation.
    - Shared challenges and group wellness goals.
    - Mentorship matching (recovered users helping others).
    - Privacy-first design with granular sharing controls.
  - Acceptance: Safe, supportive community features with strong privacy protections.

---

## P3 — Advanced Features and Optimizations (Additional)

- [ ] Advanced AI and ML features
  - Actions:
    - Predictive mood modeling to suggest preventive interventions.
    - Natural language processing for journal sentiment and topic analysis.
    - Personalized content recommendation engine.
    - Voice-to-text journaling with emotion detection.
  - Acceptance: AI provides proactive, personalized mental health insights.

- [ ] Integration with health ecosystem
  - Actions:
    - Wearable device integration (mood correlation with sleep, activity).
    - Healthcare provider dashboards (with consent) for therapy sessions.
    - Integration with Moroccan health insurance systems.
    - Telemedicine platform connections for psychiatric consultations.
  - Acceptance: App integrates seamlessly with user's broader health journey.

- [ ] Advanced security and compliance
  - Actions:
    - End-to-end encryption for all sensitive data.
    - Multi-factor authentication with biometric options.
    - Regular security audits and penetration testing.
    - Compliance with Moroccan data protection laws and healthcare regulations.
  - Acceptance: Bank-level security with transparent privacy practices.

- [ ] Performance optimization and scalability
  - Actions:
    - Database query optimization and indexing strategy.
    - CDN implementation for static assets and cultural content.
    - Lazy loading and code splitting for improved initial load times.
    - Scalable architecture for handling thousands of concurrent users.
  - Acceptance: App performs smoothly under load with fast response times.

---

## Acceptance and Validation (quality gates)

- Build: Vite dev and build succeed without env errors.
- Lint/Type: ESLint passes.
- Tests: Unit + E2E green in CI.
- Smoke: Login → log mood → save journal → dashboard reflects data.

