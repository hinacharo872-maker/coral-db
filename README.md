# Aqua Reef Log

Aqua Reef Log is a marine aquarium management web app for reef keepers who want more than a simple note pad. It helps users record water quality, see what changed since the last measurement, notice risky values, and decide what to check next.

The current MVP focuses on water quality management for SPS/LPS-oriented reef tanks. Coral database features are being prepared separately and are intentionally secondary in this release.

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
https://coral-db.vercel.app/
```

## Current MVP Scope

The release-ready focus is water quality management:

- Record daily values quickly on mobile
- Understand what changed from the previous record
- See whether each value is normal, caution, or danger
- Get safe, non-diagnostic suggestions about what to check next
- Export logs before relying on the app long term
- Recover from input mistakes with edit/delete

The app does not give medical, veterinary, or guaranteed husbandry advice. Suggestions are intentionally phrased as checks, not definitive instructions.

## Roadmap

- Improve authenticated data migration from demo mode
- Add richer chart overlays and event correlation
- Add push-style reminders for PWA and Android app builds
- Expand additive tracking and inventory alerts
- Continue coral database cleanup and wiki-style review workflows
- Add water-quality-to-coral compatibility matching once coral care profiles are mature
- Prepare Android app packaging after the web MVP stabilizes
