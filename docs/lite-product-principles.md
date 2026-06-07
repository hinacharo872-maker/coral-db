# Coral DB Lite Product Principles

## Product boundary

Coral DB Lite and Coral DB Pro are separate products with different
users and jobs. Lite is free. Pro is paid.

Lite is for beginners and older users who need a small, forgiving aquarium
record. Its job is to help them keep logging and, when the aquarium is unwell,
show a clean record to a shop employee.

Pro is for intermediate and advanced reef keepers who want to make detailed
decisions themselves.

## Lite promise

Lite must remain:

- Easy to continue even when only one value was measured
- Readable by a shop employee in about five seconds
- Honest about uncertainty
- Helpful without pretending to diagnose
- Protective against unnecessary purchases

The primary shop consultation experience is handing the phone to the employee
and opening the in-app shop card. QR codes and external share links are not MVP
requirements.

## Lite data scope

Lite stores only:

- Tank volume, routine water-change frequency, routine change volume, latest
  water-change date, and a note
- KH, temperature, salinity/specific gravity, NO3, and PO4
- Active additives, rough amount, frequency, and a note
- Dated aquarium photos and a note

Measurement values are nullable. Partial records are valid. User-facing copy
must say "今回は測らない" instead of blaming the user for missing data.

Lite must not add Ca, Mg, NH3/NH4, NO2, ICP analysis, measurement-error models,
consumption-rate analysis, automatic dosing calculations, advanced coral
matching, AI diagnosis, complex charts, or advanced configuration.

## Shop card

The shop card is Lite's most important screen. It shows:

- Tank name and volume
- Water-change routine and latest change date
- Latest photo
- Five water-quality values
- Unit, measurement date, age, color zone, and target range for every value
- Active additives with amount and frequency
- A short list of items for the shop to check

Freshness:

- 0-6 days: current
- 7-13 days: caution, "少し古い"
- 14 days or more: danger, "古い可能性"

The screen must state that it is a record for shop review, not a diagnosis, and
that dosing and purchase decisions should be discussed with the shop.

## Honest routing

Lite is a routing engine, not a diagnostic AI.

- Missing measurement: explain why the next measurement helps and route to a
  test kit or shop consultation.
- Out-of-range value with a matching owned product: show official usage
  guidance. Do not show a purchase route for a similar product.
- Out-of-range value without a matching owned product: route to shop
  consultation and, secondarily, relevant products.
- Multiple red values: do not recommend a product. Ask the user to show the
  shop card to the shop.
- At least 30 days of stable five-parameter logging: Pro or ICP may be
  mentioned as an optional next step.

When evidence is ambiguous, Lite must not make a definitive claim.

## Decision rule

Every Lite change must improve all three sides:

- User: simpler operation, more honest advice, less unnecessary spending
- Shop: cleaner information, faster advice, protected trust
- Developer: a strong free entry product and a clear, non-manipulative path to
  paid Pro

An implementation that blurs Lite and Pro, pressures a purchase, or makes the
shop card harder to read does not belong in Lite.
