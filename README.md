# ReefChart Lite

ReefChart Lite is a marine aquarium management web app for reef keepers who want a clean record they can show to a trusted shop. It helps users record water quality, see what changed since the last measurement, notice risky values, and prepare a readable tank chart.

The current MVP focuses on water quality management and the in-app shop card. Coral database and advanced analysis features are being prepared separately for ReefChart Pro and are intentionally secondary in this release.

## Main Features

- Demo mode that works without login
- Sample water logs and event logs on first visit
- Water quality logging for temperature, salinity, pH, KH, Ca, Mg, NO3, and PO4
- Custom water parameters through Supabase `water_parameters` and JSONB `custom_values`
- Mobile-friendly numeric input with large plus/minus buttons
- Previous-value copy for quick daily entry
- Partial logging, such as recording only KH today
- Change detection from the previous log
- Clear status labels: normal, caution, and danger
- Action suggestions such as checking dosing, feeding, filtration, skimmer, or water changes
- Measurement reminders
- Target presets for SPS, LPS mixed reef, soft corals, fish-heavy tanks, and custom ranges
- Time-series charts with latest, average, minimum, and maximum values
- Event logs for dosing, water changes, feeding changes, lighting changes, livestock additions, maintenance, and other notes
- Event markers on water quality charts
- Edit and delete for water logs and event logs
- CSV export for water logs and event logs
- Supabase Auth sync from demo/localStorage data after login
- Web/PWA metadata for ReefChart Lite
- Privacy policy and terms pages
- Release security, smoke-test, and monitoring checklists

## Demo Mode

When a visitor is not logged in, the app automatically runs in demo mode.

If there are no local demo logs, the app seeds sample data for roughly two weeks. The sample data includes:

- A KH drop
- A slightly high PO4 day
- A rising NO3 trend
- Water change, dosing, feeding, and lighting events

This makes the dashboard useful immediately: users can see today's judgment, warnings, trend charts, statistics, reminders, and suggested checks before entering their own data.

Demo data is stored in the browser with `localStorage`:

- `demo_water_logs`
- `demo_aquarium_event_logs`
- `demo_custom_parameters`
- `demo_target_settings`

Users can delete demo sample data from the app. Demo/localStorage users can also back up data with CSV export.

## Supabase Integration

Supabase is used for:

- Authentication
- Aquarium records
- Water quality logs
- Custom water parameters
- Additive products, inventory, and dosing logs
- Water change logs
- Aquarium event logs
- Coral database tables and future matching logic

Database changes are managed in `supabase/migrations`.

The production project currently relies on Supabase GitHub integration. When changes are pushed to `main`, Supabase applies new migrations and Vercel deploys the web app.

## Environment Variables

Create `.env.local` from `.env.local.example`.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
NEXT_PUBLIC_SITE_URL=https://reefchart.vercel.app
```

For Vercel production, set the same variables in the Vercel project settings.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build locally:

```bash
npm run build
```

## Deployment

The intended production flow is:

1. Commit changes to `main`.
2. Push to GitHub.
3. Supabase GitHub integration applies migrations.
4. Vercel deploys the Next.js app.
5. Verify the production URL.

Production URL:

```text
https://reefchart.vercel.app/
```

## Android Development

The Android MVP uses Capacitor 8 and opens the deployed ReefChart Lite web app
inside a native Android project. This keeps the existing Next.js and Supabase
behavior intact while native features are introduced gradually.

Requirements:

- Node.js 22 or later
- Android Studio 2025.2.1 or later
- Android SDK API 24 or later

Create or refresh the Android project:

```bash
npm run android:sync
```

Open it in Android Studio:

```bash
npm run android:open
```

Build a debug APK:

```bash
npm run android:build
```

The debug APK is generated at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

The current MVP loads `https://reefchart.vercel.app` and therefore requires an
internet connection. Before a Google Play production release, move the
production web assets into the app package and complete native deep-link,
notification, icon, splash screen, signing, and offline-storage work.

The staged storage, photo, notification, and conflict-safe synchronization
plan is documented in
[`docs/android-capacitor-plan.md`](docs/android-capacitor-plan.md).

## Current MVP Scope

The release-ready focus is water quality management:

- Record daily values quickly on mobile
- Understand what changed from the previous record
- See whether each value is normal, caution, or danger
- Get safe, non-diagnostic suggestions about what to check next
- Export logs before relying on the app long term
- Recover from input mistakes with edit/delete

### Lite shop consultation

The Lite MVP prioritizes an in-app `Shop view` over QR codes and external
sharing links. A user can hand their phone to a shop employee and show:

- Tank volume and water-change routine
- Latest water-change date
- KH, temperature, salinity, NO3, and PO4 with color zones
- Measurement date and freshness for every parameter
- Active additives with amount and frequency
- Latest tank photo
- A short list of items worth checking

Lite home provides large mobile actions for water quality, water changes,
additives, photos, and the shop view. QR and external-link sharing remain
experimental and are not part of the current primary flow.

The app does not give medical, veterinary, or guaranteed husbandry advice. Suggestions are intentionally phrased as checks, not definitive instructions.

## Roadmap

- Improve authenticated data migration from demo mode
- Add richer chart overlays and event correlation
- Add push-style reminders for PWA and Android app builds
- Expand additive tracking and inventory alerts
- Continue coral database cleanup and wiki-style review workflows
- Add water-quality-to-coral compatibility matching once coral care profiles are mature
- Prepare Android app packaging after the web MVP stabilizes
