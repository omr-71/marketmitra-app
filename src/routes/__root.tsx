import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LangProvider } from "../lib/i18n";
import { SessionProvider } from "../lib/session";
import { LocationProvider } from "../lib/location";
import { ThemeProvider } from "../lib/theme";
import { AuthProvider } from "../lib/auth";
import { SettingsProvider } from "../lib/settings";

import { Toaster } from "@/components/ui/sonner";
import { SplashOverlay } from "@/components/splash-overlay";
import { MitraAI } from "@/components/mitra-ai";



function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      // Zoom stays enabled and desktop mode in a mobile browser still renders
      // the full desktop layout — nothing is forced.
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0b2e20" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "MarketMitra" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { title: "MarketMitra" },
      {
        name: "description",
        content:
          "AI-powered mandi intelligence for farmers: compare market prices, transport cost and net profit before you sell.",
      },
      { name: "author", content: "MarketMitra" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "MarketMitra" },
      { name: "twitter:title", content: "MarketMitra" },
      { property: "og:description", content: "AI-powered mandi intelligence for farmers: compare market prices, transport cost and net profit before you sell." },
      { name: "twitter:description", content: "AI-powered mandi intelligence for farmers: compare market prices, transport cost and net profit before you sell." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/13be7300-a74f-4f0a-a7cb-67d19efe24b4/id-preview-b696cdf0--1f0dfdaa-c120-4ff4-aa20-ea74627b101b.lovable.app-1785830020583.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/13be7300-a74f-4f0a-a7cb-67d19efe24b4/id-preview-b696cdf0--1f0dfdaa-c120-4ff4-aa20-ea74627b101b.lovable.app-1785830020583.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://api.open-meteo.com" },
      { rel: "dns-prefetch", href: "https://api.data.gov.in" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://marketmitra.app/#organization",
              name: "Market Mitra",
              url: "https://marketmitra.app",
              logo: "https://marketmitra.app/icon-512.png",
              email: "hello.marketmitra@gmail.com",
              telephone: "+91-9209517171",
              description:
                "Agriculture-focused digital technology platform for Indian farmers: official APMC mandi prices, farm weather, crop guidance and government scheme information.",
              founder: { "@type": "Person", name: "Om Labhade" },
            },
            {
              "@type": "WebSite",
              "@id": "https://marketmitra.app/#website",
              name: "Market Mitra",
              url: "https://marketmitra.app",
              inLanguage: ["en", "mr", "hi"],
              publisher: { "@id": "https://marketmitra.app/#organization" },
            },
          ],
        }),
      },
    ],


  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <AuthProvider>
      <SessionProvider>
        <LocationProvider>
        <LangProvider>
        <SettingsProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <SplashOverlay />
          <Outlet />
          <MitraAI />
          <Toaster position="top-center" richColors />

        </SettingsProvider>
        </LangProvider>
        </LocationProvider>
      </SessionProvider>
      </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>

  );
}
