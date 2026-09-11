# MarketMitra visual completion

## Goal
Finish the existing redesign without changing product behavior, data sources, authentication, or navigation. First restore the Home screen build, then bring every existing screen into the same premium agricultural design language.

## Build steps
1. **Restore Home**
   - Add the missing light error-state variant used in the dark hero.
   - Add the missing colour-tint input to quick-action tiles and apply it consistently.
   - Remove invalid dynamic utilities while preserving all real weather, market, diagnosis, scheme, and chat data.

2. **Strengthen the shared visual system**
   - Finalize semantic forest, emerald, sky, harvest, and earthy tokens with warm neutral surfaces.
   - Standardize page widths, headers, cards, controls, focus states, loading states, and lightweight transitions.
   - Polish the desktop rail and mobile navigation while preserving routes and behavior.

3. **Align the full authenticated app**
   - Apply the shared visual language to Crops, Markets, Market Detail, Prediction, Weather, Diagnose, Schemes, Mitra Link, Profile, Settings, and Mitra AI.
   - Use feature-specific accents for prices, weather, crop health, schemes, and community tools without changing their logic.
   - Improve desktop information density and retain thumb-friendly mobile layouts and safe areas.

4. **Align public and system screens**
   - Bring authentication, reset password, About, Terms, empty/error states, and shared loading surfaces into the same typography and palette.
   - Preserve all existing metadata and functionality.

5. **Validate**
   - Run the project checks and verify the live Home screen plus representative mobile and desktop routes.
   - Check for clipping, overlap, broken controls, console errors, and reduced-motion behavior.

## Technical constraints
- Keep TanStack Start routing and current APIs/database logic untouched.
- Reuse semantic Tailwind v4 tokens and existing components; no raw duplicate colour system.
- Prefer transform/opacity animations, short durations, and reduced-motion fallbacks.
- Do not add mock data, duplicate pages, or new product features.
