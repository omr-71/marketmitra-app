const DEFAULT_POST_AUTH_PATH = "/home";
const INTERNAL_REDIRECT_ORIGIN = "https://marketmitra.invalid";
const PRODUCTION_AUTH_CALLBACK = "https://www.marketmitra.app/auth";

export function getOAuthCallbackUrl(origin: string): string {
  const callback = new URL("/auth", origin);

  if (callback.hostname === "marketmitra.app" || callback.hostname === "www.marketmitra.app") {
    return PRODUCTION_AUTH_CALLBACK;
  }

  return callback.toString();
}

export function getPostAuthRedirect(redirect: unknown): string {
  if (typeof redirect !== "string" || !redirect.startsWith("/")) {
    return DEFAULT_POST_AUTH_PATH;
  }

  try {
    const target = new URL(redirect, INTERNAL_REDIRECT_ORIGIN);

    if (
      target.origin !== INTERNAL_REDIRECT_ORIGIN ||
      target.pathname.replace(/\/+$/, "") === "/auth"
    ) {
      return DEFAULT_POST_AUTH_PATH;
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return DEFAULT_POST_AUTH_PATH;
  }
}
