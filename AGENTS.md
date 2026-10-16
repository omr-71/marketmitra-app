<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Market data integration

- Read AGMARKNET credentials only from the server-side `AGMARKNET_API_KEY` environment variable. Never expose API keys to the browser, commit them, or print/copy their values into source code, commits, or logs.
- Use the existing centralized server-side market provider in `src/lib/market-providers.server.ts` for AGMARKNET requests. Do not add page-specific or duplicate API integrations.
- Use only validated records from real market-data sources. Never invent mandi prices, markets, arrivals, or reporting dates; show an unavailable state when no usable source data is available.
- Preserve existing application behavior and run relevant checks before deployment.
- Configure production and preview environment variables in the deployment platform separately from local development; never assume a local `.env` file configures production.
