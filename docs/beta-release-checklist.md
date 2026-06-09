# ReefChart Lite Beta Release Checklist

Target URL: https://reefchart.vercel.app

## Public Pages

- [ ] `https://reefchart.vercel.app` opens successfully.
- [ ] The browser title and visible brand say `ReefChart Lite`.
- [ ] Old public brand names are not visible.
- [ ] `/privacy` opens.
- [ ] `/terms` opens.
- [ ] The privacy policy and terms are linked from the footer.

## Vercel And Environment

- [ ] The Vercel production project uses the `reefchart.vercel.app` alias.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` contains the production Supabase URL.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` contains the production anon key.
- [ ] `NEXT_PUBLIC_SITE_URL=https://reefchart.vercel.app`.
- [ ] No service role key has a `NEXT_PUBLIC_` prefix.
- [ ] No service role key appears in browser JavaScript or page source.

## Supabase Auth

- [ ] Supabase Site URL is `https://reefchart.vercel.app`.
- [ ] Redirect URLs include `https://reefchart.vercel.app/**`.
- [ ] Redirect URLs include `http://localhost:3000/**`.
- [ ] Redirect URLs include `https://*.vercel.app/**`.
- [ ] Email login returns to ReefChart Lite.

## PWA

- [ ] `/manifest.webmanifest` is available.
- [ ] Manifest name is `ReefChart Lite`.
- [ ] Manifest short name is `ReefChart`.
- [ ] 192x192, 512x512, and maskable icons load.
- [ ] Android Chrome offers installation or home-screen addition.
- [ ] Installed display mode is standalone.
- [ ] Offline navigation shows the offline shell without claiming data sync.

## Core Lite Flow

- [ ] A new account can create a tank.
- [ ] Water quality can be recorded.
- [ ] A water change can be recorded.
- [ ] An additive can be registered.
- [ ] A photo can be added.
- [ ] The `ショップに見せる` screen is readable on a phone.
- [ ] A 24-hour or 7-day share link can be created.
- [ ] The share opens in a separate logged-out browser.
- [ ] A stopped share no longer reveals tank data.
- [ ] User A cannot read User B's private tank data.

## Lite Safety And Language

- [ ] KH is displayed as `KH（炭酸塩硬度）`.
- [ ] Water temperature, salinity, NO3, and PO4 use the approved Japanese labels.
- [ ] Internal identifiers, enum names, UUIDs, database columns, and routing
  identifiers are not visible.
- [ ] A single moderate abnormal value asks for another measurement.
- [ ] Extreme temperature, KH, or salinity asks the user to verify and consult.
- [ ] No product route is shown for temperature, salinity, or high KH.

## Social Preview

- [ ] X/Twitter preview title is `ReefChart Lite`.
- [ ] Description explains the free shop-friendly aquarium log.
- [ ] The 1200x630 beta image loads.
- [ ] Canonical and Open Graph URLs use `https://reefchart.vercel.app`.
