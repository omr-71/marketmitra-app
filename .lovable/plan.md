# Market Prices and Disease Identifier Reliability Upgrade

## Goal

Make targeted reliability improvements to the existing MarketMitra market-price and crop-diagnosis flows without changing its design, navigation, authentication, storage model, or unrelated features.

## Market prices

- Adjust the shared market service to retain two isolated groups: India-time today and India-time yesterday.
- Keep only valid official records matching the selected crop, state, district, and optional market; deduplicate without combining dates.
- Return both groups when today exists, yesterday only when today is missing, and no records when neither exists.
- Preserve the existing official live-feed providers and stored official-record fallback, but never permit records older than yesterday.
- Update the existing Markets screen to show clearly labelled Today and Yesterday sections, with Today visually primary.
- Show the requested factual status when only yesterday is available, and retain graceful loading, retry, and unavailable states.
- Keep transport and commission calculations date-local so prices from different reporting days are never compared.

## Disease identifier

- Strengthen the existing analysis contract and prompt for explicit plant-part observations, condition category, alternatives when confidence is low, normalized severity, and follow-up timing.
- Continue rejecting blurry, dark, distant, unrelated, or non-plant images before diagnosis.
- Extend saved diagnosis records using the existing flexible fields where possible, avoiding a new table or duplicate diagnosis flow.
- Present the requested farmer-friendly result order in the current diagnosis screen and existing language system.

## Treatment safety

- Keep chemical names, brands, doses, concentrations, intervals, and mixtures out of generated AI guidance.
- Since the project has no authoritative pesticide-label database, continue showing the honest “No verified treatment recommendation is currently available” state.
- Keep general non-chemical actions, prevention, label compliance, and local agricultural-expert confirmation clearly separated from verified treatment information.

## Validation

- Add focused checks for today plus yesterday, yesterday-only, provider failure with yesterday fallback, neither date, and invalid/duplicate records.
- Verify clear-image, unusable-image, and low-confidence diagnosis handling through deterministic contract checks where live model output cannot be guaranteed.
- Run the relevant tests through the project harness and inspect the Markets and Diagnose screens at mobile and desktop sizes.

## Technical details

- Extend the existing shared market result type rather than creating another endpoint or query path.
- Keep server-only credentials and provider calls on the server.
- Reuse the current authenticated server functions, diagnosis history table, query cache, design tokens, and components.
- No new dependency, page, table, mock record, or visual redesign.