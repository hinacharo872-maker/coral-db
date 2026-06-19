# ReefChart Lite Architecture

## Product Boundary

Lite is not an expert system for beginners or older users. Its job is to create
a clean aquarium record that a trusted shop can understand in about five
seconds.

The product boundary is:

- Lite records facts and missing information.
- Lite highlights simple traffic-light status without pretending to diagnose.
- Lite routes the user honestly: measure, use something already owned, consult
  a shop, consider ICP, or consider Pro.
- A shop gives the final husbandry advice.
- Pro owns advanced analysis, correlations, automation, and specialist tools.

This boundary protects all three participants:

- The user avoids unnecessary purchases and confusing expert controls.
- The shop receives clean data, keeps advisory responsibility, and can earn the
  purchase relationship through trust.
- The developer has clear Pro, shop-partnership, and optional affiliate paths
  without turning Lite recommendations into hidden advertising.

## Data Design Rules

1. Existing ReefChart tables remain unchanged.
2. Lite data is stored in new `lite_*` tables.
3. User-entered fields are nullable so partial records remain valid.
4. Identity, ownership, timestamps, and security columns may be required even
   when aquarium facts are nullable.
5. Shop sharing is revocable and expiring.
6. Recommendation records store the reason and evidence used at the time.
7. Purchase routing separates a neutral recommendation from an optional shop or
   affiliate destination.
8. RLS defaults to owner-only access. Shop access must be derived from an active
   share grant, never from a guessable aquarium ID.

## Initial Domain Types

Migration `20260606000100_add_lite_domain_enums.sql` adds:

- `lite_tank_stage`
- `lite_share_status`
- `lite_additive_frequency`
- `lite_recommendation_type`
- `lite_severity`

The migration is idempotent because Supabase may retry or replay migrations in
branch environments.

## Proposed Table Split

The exact DDL should follow the remaining field specification. The recommended
ownership boundaries are:

### `lite_tank_profiles`

One simple Lite profile per aquarium. Holds the minimum tank context a shop
needs. Optional width, depth, height, tank volume, pH, salt mix, lighting, wave pumps, and filtration are stored
here as shop-facing context. They do not join the five-parameter measurement
flow and remain nullable.

### `lite_measurements`

Sparse measurements. Every measurement column is nullable. A row can contain
only KH or only a note without fabricating values for the other parameters.

### `lite_additive_usage`

The user's owned products and simple usage frequency. This supports the
important "use what you already own" route before suggesting a purchase.

### `additive_effects`

Publicly readable, structured product effects. Lite can use these records to
explain what an owned additive is associated with, without claiming that the
product is automatically required or safe to dose.

### `additive_dosing_guides`

Publicly readable manufacturer guidance, cautions, source URLs, and optional
normalized strength data. Lite may show the official text and calculation
basis, but dose decisions remain with the user and shop.

### `lite_events`

Simple water changes, maintenance, livestock additions, and relevant changes
that help a shop read the measurement timeline.

### `lite_tank_photos`

Chronological full-tank photos for visual comparison. The shop record should
normally show only the latest photo and a small recent timeline.

### `lite_shop_share_links`

Revocable shop-facing access. Stores a hashed token, status, expiry, last
access, and optional shop destination. The current requested schema stores an
opaque token directly; it therefore must be high entropy, excluded from logs,
and resolved only through a validating RPC. A later hardening migration may
replace it with a token hash without changing the public share URL contract.

### `lite_advice_events`

Auditable routing output with recommendation type, severity, reason text,
missing fields, and optional product category. It must not silently encode an
affiliate destination. Advice history is append-oriented: authenticated users
may read and insert their own events, but normal clients do not update or
delete past advice.

### `lite_shop_routes`

Optional commercial routing kept separate from the neutral recommendation.
This lets the UI say why a shop is shown and supports shops without forcing
affiliate behavior.

## Five-Second Shop Record

The read model should be a database view or RPC returning one compact payload:

1. Tank identity and volume
2. Latest measured values with units and measured date
3. Missing or stale important measurements
4. Recent changes and maintenance
5. Additives already owned and reported frequency
6. Traffic-light summary with plain reasons
7. User question or concern

The shop view should not expose account internals, unrelated aquariums, auth
metadata, or private historical data beyond the explicit share scope.

## Experiment MVP

The first Lite experiment measures one complete loop:

1. An authenticated owner creates a 24-hour, seven-day, or non-expiring link.
   Existing aquarium metadata and the latest thirty days of water logs can be
   imported once into the Lite record.
2. The owner shares its URL or locally generated QR code.
3. A shop opens a five-second record through a validated token RPC.
4. Daily unique views are recorded without exposing account data.
5. The shop rates the record as sufficient, mostly sufficient, or insufficient.
6. Admins review aggregate sharing, viewing, ratings, and missing-information
   responses.

The shop record also exposes water-change frequency, normal change volume,
last water-change date, and a separate measurement date for every Lite
parameter. Values seven days old are marked yellow and values fourteen days
old are marked red. Insufficient feedback uses structured multi-select keys so
the admin report can rank missing information quantitatively.

AI diagnosis, ICP interpretation, consumption-rate calculation, and dose
calculation remain outside this experiment.

## Lite Measurement Flow

The Lite home links to a one-parameter-per-screen measurement flow for KH,
temperature, salinity, NO3, and PO4. Each step shows the previous recorded
value, supports copying it, and uses the neutral phrase "今回は測らない" for
skipping. A sparse row can be saved when at least one value is present; an
all-empty measurement is blocked before insertion.

## Lite Traffic-Light Targets

`lib/liteTargets.js` is the single frontend definition for Lite's simple
traffic-light ranges:

- Green means the value is within the normal Lite display range.
- Yellow means the value should be reviewed, without making a diagnosis.
- Red means the value is outside the wider yellow range.
- Missing, invalid, or unsupported values return `unknown`.
- `REQUIRED_LITE_KEYS` and `findMissingKeys()` identify absent values in the
  latest sparse measurement without rejecting partial records.

These ranges support a readable shop record. They are not dosing instructions
and do not replace livestock-specific advice.

## Owned-Product Routing

`lib/liteRecommendations.js` contains neutral recommendation helpers.
`canHandleWithOwnedAdditives()` checks active products against verified
`additive_effects` metadata. Unverified product effects are excluded from both
owned-product and purchase routing. A verified match means Lite may show an
owned product as a review option before presenting a purchase route. It does
not calculate or recommend a dose.

`buildLiteAdvice()` shows at most two prioritized missing measurements, stops
product routing when multiple values are red, checks owned products before
purchase routes, and never recommends an additive for temperature, salinity,
high KH, or low nutrient correction. Strong actions require the latest two
measurements to be outside the target range in the same direction. A single
abnormal reading only asks the user to measure again. NO3 and PO4 guidance
checks feeding and water-change habits before owned products or shop
consultation, and does not open a direct purchase route. If verified
`additive_effects` is empty, all product routing is disabled and the user is
sent to shop consultation.

Extreme temperature, KH, and salinity values are the only single-reading
exception. Thresholds live in `LITE_EMERGENCY_THRESHOLDS`. These readings
immediately ask the user to verify the measurement and show the shop record,
but never open owned-product or purchase routes.

Pro or ICP is suggested from a realistic thirty-day habit check: at least eight
measurement days, parameter-specific coverage, few red values, and no large
swings. Consecutive daily logging is not required.

## Security Plan

- Owners can manage only their own Lite rows.
- Anonymous users can access a shared record only through a validated,
  non-expired, non-revoked token.
- Token validation should be implemented in a `SECURITY DEFINER` RPC with a
  fixed `search_path`.
- Raw share tokens are generated client-side or server-side once, then only a
  cryptographic hash is stored.
- Share reads should be logged for abuse investigation and shop-partnership
  reporting.
- Recommendation generation must not bypass RLS for arbitrary user IDs.

## Implementation Sequence

1. Domain enums
2. Core Lite tank and sparse log tables
3. Owner RLS and indexes
4. Revocable share grants and secure read RPC
5. Five-second shop record view/RPC
6. Lite mobile input UI
7. Honest recommendation routing
8. Optional shop and affiliate routing
9. Pro upgrade boundaries and analytics

## Current Implementation Status

Implemented:

- Idempotent Lite domain enum migration
- Nullable `lite_tank_profiles` table
- Owner-only RLS based on `auth.uid() = user_id`
- Sparse `lite_measurements` table for temperature, salinity, KH, NO3, and PO4
- Owner-only RLS for Lite measurements
- `lite_additive_usage` with product snapshots and simple usage frequency
- Owner-only RLS for Lite additive usage
- Public-read `additive_effects` metadata with parameter and direction enums
- Public-read `additive_dosing_guides` with source attribution and cautions
- Public-read additive product groups and product membership links
- Shared Lite traffic-light targets and severity classifier
- Owned-additive capability matching for honest recommendation routing
- Secure shop record RPC, URL and QR sharing, expiry, and one-tap revocation
- Shop feedback capture and admin-only experiment metrics
- Chronological `lite_tank_photos` with tank-owner RLS
- Revocable `lite_shop_share_links` with owner-only table access
- Append-oriented `lite_advice_events` with structured reasons
- Automatic `updated_at` maintenance
- Lite product and data architecture document
- Optional shop-facing environment profile and owner-only update UI
- Conditional environment summary in the in-app and shared shop records

Remaining release work:

- Apply and verify pending migrations in the target Supabase project
- Run the authenticated owner flow and anonymous shared-record flow against
  the deployed schema
- Complete the manual security and mobile smoke-test checklists
- Continue the staged Android offline-storage work without changing Lite's
  product boundary
