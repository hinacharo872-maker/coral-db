# Error Monitoring Plan

Last updated: 2026-06-08

## Goal

ReefChart Lite needs enough error visibility to fix broken flows before release,
without sending aquarium photos, water logs, email addresses, share tokens, or
free-text notes to a monitoring vendor.

## Recommended Tool

Sentry is the first candidate because it supports Next.js, source maps,
environment separation, release tracking, and filtering hooks. It should be
introduced only after the privacy filters below are configured.

## Do Not Send

- Email address
- Supabase access tokens or refresh tokens
- Share-link tokens
- Tank photo URLs or image payloads
- Free-text notes
- Water-quality values
- Additive notes
- Full request bodies
- Full URLs containing `/share/{token}`

## Minimum Configuration

Use a browser/client configuration with:

- `sendDefaultPii: false`
- A `beforeSend` hook that strips user, request headers, cookies, query strings,
  breadcrumbs containing share URLs, and form fields.
- Environment labels: `local`, `preview`, `production`.
- Sampling kept low in production until the app is stable.
- Source maps uploaded only from CI/Vercel, never committed secrets.

## Suggested Rollout

1. Add Sentry to preview only.
2. Trigger a known test error from an admin-only page.
3. Confirm no email, token, photo URL, water value, or memo is visible.
4. Enable production errors with low sampling.
5. Add a privacy-policy note naming the monitoring provider if production is
   enabled.

## Current Release Decision

Sentry is not installed in this pass. The release can proceed with manual smoke
tests, browser console checks, and Supabase/Vercel logs. Add Sentry only after
the privacy filter has been reviewed.
