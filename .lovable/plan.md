# Market Mitra — Notifications, Mitra Voice, Chat & Settings Upgrade

Nothing on Home, Markets, Weather, Crops, Schemes, Diagnose, Profile data logic or the existing APIs changes. This adds new surfaces and upgrades Mitra AI + Settings.

## What you get

### 1. Real Android notifications (Web Push)
Market Mitra is a web/PWA app, so real notifications in the Android panel come through **Web Push + a service worker**, the same mechanism installed PWAs use. They arrive when the app is closed, once the user installs Market Mitra to their home screen and allows notifications. (A native FCM app would need a separate Android build — out of scope here.)

- Service worker that renders branded notifications: Market Mitra icon, title, short body, timestamp, and a deep link that opens the right screen (`/markets`, `/weather`, chat, etc.).
- Permission flow with a calm in-app explainer before the browser prompt; graceful handling of denial (settings show "Blocked in browser" with instructions).
- Categories with priority: **Normal / Important / Urgent**, each respecting the user's Settings toggles server-side before a push is sent.

Alert engines (real data only, no mock values):
- **Market alerts** — a scheduled job compares the latest AGMARKNET arrival-date price for each user's saved crops/markets against the previous verified reading; notifies only above a meaningful threshold (e.g. ≥8% move or an unusual jump vs the 7-day range), max once per crop per day.
- **Weather alerts** — Open-Meteo heavy rain / severe conditions / sudden change relevant to harvest and transport; informative wording, not alarmist.
- **Mitra alerts** — generated only when the tools return something genuinely actionable.
- **App update notifications** — triggered from an admin-set version record, sent once per version per user.

### 2. Mitra Voice
- Mic moves **into the composer beside Send**: `[ Type a message…  🎤  ➤ ]`, one-hand reachable, safe-area aware.
- **Multiple natural voices** with distinct identities and styles, selectable with a preview button, plus speed, volume, autoplay and voice-language controls.
- **Emotional delivery**: the reply is tagged (informative / concerned / reassuring / happy / friendly) and voice parameters adapt subtly — no theatrics.
- **Daily voice credits**: free, configurable server-side (default 30/day), auto-reset at IST midnight, shown as "23 / 30 remaining · Resets tomorrow". When exhausted, voice stops and text chat continues normally; no "unlimited" claims.

Voice provider question below — it decides whether voices are truly natural or device-only.

### 3. Mitra chat polish (mobile-first)
Clean user/Mitra distinction, correct wrapping (no horizontal scroll), smooth auto-scroll, keyboard never covers the composer, proper loading + error states with Retry, copy-response, selectable text, readable typography, clean markdown (headings, bullets, safe links).

### 4. Settings system
New `/settings` route reached from Profile (Profile → Settings), built from reusable primitives — `SettingSection`, `SettingRow`, `SettingToggle`, `SettingSelector`, `SettingSlider`, `SettingPreview`, `SettingRadioOption` — so new settings are one row, not a redesign. Every row is Icon → Title → Short description → Current value.

Sections: Account & Profile · Mitra Voice · Chat · Languages (separate app / Mitra text / Mitra voice language) · Notifications · Appearance (light / dark / system, text size, density) · Privacy & Data · About Market Mitra (version, What's New, data sources, terms, privacy, contact).

Preferences persist per device and, when signed in, to the backend so notification sending honours them. Changing language never resets other preferences.

## Technical notes

- `public/sw.js` service worker (push + notificationclick deep links), registered client-side after hydration.
- New tables: `push_subscriptions`, `notification_preferences`, `notification_log` (dedupe/rate limit), `voice_usage` (daily counter), `app_versions`; all with GRANTs + RLS scoped to the owner, service-role access for the sender.
- Sending + alert evaluation run in server functions and a `/api/public/cron/*` route (signature-checked) so it works with the app closed.
- Voice synthesis runs server-side behind a credit check; audio streamed back to the client. Device speech synthesis stays as an offline/exhausted-credit fallback.
- Existing `src/lib/voice.ts`, `src/components/mitra-ai.tsx`, `src/routes/api/chat.ts` are extended, not replaced.

## Sequencing
1. Settings architecture + all preference storage (visible immediately).
2. Chat + composer/voice-button polish.
3. Voice engine, voices, emotion, credits.
4. Push infrastructure, alert engines, cron, update notifications.
