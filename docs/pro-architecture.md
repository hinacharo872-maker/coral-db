# ReefChart Pro v1 Architecture

## Product boundary

ReefChart Lite and ReefChart Pro solve different jobs.

| | ReefChart Lite | ReefChart Pro |
|---|---|---|
| User | Beginners and older aquarists | Intermediate and advanced aquarists |
| Primary job | Create a simple record to show a shop | Understand consumption, future risk, and change after maintenance |
| Core parameters | KH, temperature, salinity, NO3, PO4 | Lite parameters plus Ca, Mg, pH, NH3/NH4, and NO2 |
| Main output | A readable shop record | Consumption rate, prediction, charts, and event context |
| Data ownership | `lite_*` tables | `pro_*` tables |

There is no automatic copy or synchronization between Lite and Pro in v1. This prevents an advanced workflow from making Lite harder to understand and prevents ambiguous duplicate records.

## Pro v1 purpose

Pro v1 answers three questions:

1. How quickly are KH, Ca, and Mg changing per day?
2. If the current trend continues, where may the value be in 7 or 14 days?
3. What maintenance or dosing event happened near the start of a water-quality change?

The system reports observations and possibilities. It does not diagnose a tank or prescribe a dosing amount.

## Database design

### `pro_tank_profiles`

Owns the Pro workspace. It stores the display name, water volume, and optional target ranges. It is independent of `lite_tank_profiles`.

### `pro_measurements`

Sparse measurements are allowed. A row can contain any subset of:

- temperature, salinity, pH
- KH, Ca, Mg
- NO3, PO4
- NH3/NH4, NO2

### `pro_events`

Stores water changes, additive lifecycle changes, lighting and feeding changes, livestock additions, maintenance, trouble, and free-form events. An event can optionally reference an additive product or water parameter.

### RLS

All Pro tables require an authenticated owner. Policies check both `user_id = auth.uid()` and that the referenced Pro tank belongs to the current user. Anonymous users only see the in-code Pro demonstration dataset.

### Consumption snapshots

`pro_consumption_snapshots` is intentionally omitted in v1. Calculations run from the selected measurement window so algorithm changes do not leave stale cached results. A cache can be added after production query volume justifies it.

## Consumption calculation

1. Select valid values within 7, 14, or 30 days.
2. Convert timestamps to elapsed days from the first sample.
3. Calculate a least-squares slope.
4. Measure residuals and remove only extreme residual outliers.
5. Recalculate the slope when enough points remain.

For KH, Ca, and Mg:

- negative slope: consumption; display the absolute value as daily consumption
- near-zero slope: stable
- positive slope: increasing; possible dosing, water-change, or measurement influence
- fewer than two usable dates: insufficient data

Predictions use `latest value + slope * days`. They are projections, not dosing instructions.

## Event correlation

Events are rendered on the same time axis as measurements. For each recent event, Pro may summarize the following measurement trend, for example:

> Bacto Blend開始後、硝酸塩（NO3）が低下傾向です。

The wording must never claim causation. Other changes, measurement error, and delayed effects remain possible.

## Not included in Pro v1

- automatic dosing amount calculation
- product-specific correction instructions
- automatic controller integration
- ICP interpretation
- diagnosis of coral disease or tank failure
- automatic copying between Lite and Pro
- paid subscription enforcement

These require additional product strength, actual water volume, calibration, measurement-error, safety-limit, and billing work.
