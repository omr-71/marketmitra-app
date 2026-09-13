# MarketMitra Home and trusted market data upgrade

## Goal
Make Home feel like a premium live farmer-intelligence dashboard while enforcing one trustworthy market-data rule everywhere: selected crop + selected district + official records from today or yesterday in India time only.

## Implementation
1. **Unify the market pipeline**
   - Make the existing aggregated market service the single source used by Home, Crops, Markets, and Market Detail.
   - Remove the legacy Home/Crops/detail fetch path that can return a different dataset.
   - Keep query keys aligned by crop, state, district, and market so cached values remain consistent without duplicate requests.

2. **Enforce strict server-side filtering**
   - Require a selected district for district-level market results and never widen an empty district response to the whole state.
   - Send crop, state, district, and market filters to official providers wherever supported; strictly re-check every normalized result before returning it.
   - Calculate today and yesterday in `Asia/Kolkata`, reject future dates and anything older than yesterday, validate prices, deduplicate, and sort newest-first.
   - Apply the same date and district constraints to stored official records; remove the older-record fallback from current-price results.
   - Return an unavailable result when no valid report exists in the two-day window.

3. **Make freshness explicit and honest**
   - Use only three farmer-facing current-price states: today, yesterday, or unavailable.
   - Label today as “Updated today” / “Today’s data,” yesterday as “Yesterday’s data,” and never call yesterday live.
   - Use precise loading, yesterday-only, unavailable, and update-error messages without exposing provider names.

4. **Upgrade Home without adding duplicate navigation features**
   - Preserve weather, location, four real statistics, top-market decision card, and current crop prices.
   - Tighten the mobile composition so every card fits naturally with no horizontal overflow or oversized sections.
   - Improve hierarchy, spacing, crop/market/price flow, min-modal-max display, and the compare action using the existing palette and typography.
   - Keep supporting context factual only: report date, freshness, and number of reporting markets; remove the current fabricated percentage comparison between unrelated market rows.

5. **Add lightweight mobile-first motion**
   - Wrap major Home sections in the existing one-shot IntersectionObserver reveal system.
   - Update reveals to use opacity, a small upward shift, and scale from about 0.97 with short staggered timing.
   - Keep count-up values, make them respect reduced motion, and retain restrained pointer hover elevation on desktop.
   - Animate only first appearance or meaningful value changes; no continuous effects or extra animation dependency.

6. **Clarify the Markets experience**
   - Add a prominent selected-district heading and concise “latest official market prices” context.
   - Keep crop filtering tied to the same district and two-day query.
   - Present only matching markets and use polished location-aware freshness, loading, error, and empty states.

7. **Validate end to end**
   - Add focused tests for IST date boundaries, today/yesterday acceptance, older/future rejection, district isolation, crop isolation, deduplication, and unavailable behavior.
   - Run project checks and inspect Home and Markets at mobile and desktop widths for overflow, interaction, animations, reduced motion, and console/network errors.
   - Verify Home and Markets consume the same cached service result and never display fake or stale current-price data.

## Technical details
- Reuse `marketPricesQuery`, `getMarketPrices`, `aggregateMarketPrices`, `computeFreshness`, `LocationProvider`, `Reveal`, and `useCountUp` rather than creating another subsystem.
- Keep historical data available only to explicitly historical analysis/prediction flows; it will never enter current-price cards, rankings, searches, or freshness labels.
- Preserve authentication, profile/location persistence, weather, diagnosis, Mitra AI, navigation, and database schema.
- No new animation library or database migration is required.
