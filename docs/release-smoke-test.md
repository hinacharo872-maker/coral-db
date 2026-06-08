# ReefChart Lite Release Smoke Test

Last updated: 2026-06-08

Run this checklist against production before showing the Web/PWA MVP to new
users or shops.

## Account

- Sign up with a new email.
- Confirm the magic link opens the production site.
- Log out and log back in.
- Confirm no local demo data overwrites cloud data without confirmation.

## Lite Core Flow

- Create a Lite tank.
- Record at least one water value.
- Use previous-value copy.
- Save a sparse record with only one measured item.
- Record a water change.
- Register an additive currently in use.
- Add a tank photo.
- Open the in-app `ショップに見せる` screen.
- Confirm KH, water temperature, salinity, NO3, PO4, freshness, water change
  routine, additives, and photo are readable on a phone.

## Share Link

- Create a 24-hour share link.
- Confirm 7 days is selectable.
- Confirm no no-expiry option is available.
- Open the link in another browser where the user is not logged in.
- Confirm the shop card is readable.
- Submit feedback.
- Stop the share.
- Reload the stopped link and confirm tank data is no longer visible.
- Create a second link and wait or edit expiry in test data to confirm expired
  links do not show tank data.

## Export and Backup

- Export water logs as CSV.
- Export event logs as CSV.
- Confirm CSV files contain date, item, value, unit, and notes where available.
- Confirm demo/local users see a backup prompt.

## PWA and Mobile

- Open Android Chrome.
- Confirm install/add-to-home-screen is available.
- Install the app.
- Launch from the home screen and confirm standalone display.
- Check 375px, 390px, and 430px widths.
- Confirm no horizontal scroll.
- Confirm primary buttons are easy to tap.
- Turn off network and confirm the offline shell appears without pretending
  data has synchronized.

## Safety Copy

- Enter one normal out-of-range value and confirm it asks for another
  measurement instead of product purchase.
- Enter extreme temperature, KH, or salinity and confirm it asks to verify the
  value and show the shop card.
- Confirm Lite UI does not display internal terms such as `buy_additive`,
  `consult_shop`, `parameter_key`, or database column names.
