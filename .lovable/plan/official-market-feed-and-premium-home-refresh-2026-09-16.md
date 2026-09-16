# Official market feed and premium Home refresh

## Goal
Restore real district-specific official mandi prices on Home and Markets, then make the existing Home screen feel more premium and dynamic without changing navigation or weakening freshness rules.

## Implementation
1. **Repair the official price pipeline**
   - Verify the configured government feed and correct resource/query behavior.
   - Add bounded request timeouts and resilient official-source attempts.
   - Preserve exact selected crop, state, and district matching after normalization.
   - Keep only India-time today/yesterday records; never substitute older, statewide, generated, or mock prices.

2. **Keep Home and Markets consistent**
   - Continue using the shared market query and normalized result shape.
   - Preserve one cached result per crop/state/district and the same freshness labels on both screens.
   - Keep honest retry and unavailable states when the official feed truly has no current district report.

3. **Refresh the Home composition**
   - Rebuild the weather area as a richer responsive decision surface using current conditions, location, farming window, and key metrics.
   - Improve hierarchy around market statistics, best-market guidance, and current prices.
   - Use the established forest, sky, harvest, and earthy palette with stronger contrast and layered depth, not extra feature shortcuts.

4. **Add lightweight movement**
   - Use short one-shot entrances, metric emphasis, and restrained desktop pointer interactions.
   - Avoid continuous decorative animation and preserve reduced-motion behavior.

5. **Validate**
   - Test official feed responses for representative Maharashtra districts and confirm date/district isolation.
   - Verify authenticated Home and Markets on mobile and desktop for consistency, overflow, loading, and console errors.
