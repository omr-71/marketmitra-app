import { createFileRoute } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { schemes } from "@/lib/schemes";
import { ExternalLink, Landmark } from "lucide-react";

export const Route = createFileRoute("/_authenticated/schemes")({
  head: () => ({
    meta: [
      { title: "Government schemes — MarketMitra" },
      {
        name: "description",
        content:
          "Central agriculture schemes with published benefits, eligibility criteria and links to the official application portals.",
      },
      { property: "og:title", content: "Government schemes — MarketMitra" },
      {
        property: "og:description",
        content: "PM-KISAN, PMFBY, Kisan Credit Card, PM-KUSUM, e-NAM and more.",
      },
      { property: "og:url", content: "https://marketmitra.app/schemes" },
    ],
    links: [{ rel: "canonical", href: "https://marketmitra.app/schemes" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Government schemes for Indian farmers",
          url: "https://marketmitra.app/schemes",
          description:
            "Central agriculture schemes with published benefits, eligibility criteria and links to the official application portals.",
          isPartOf: { "@id": "https://marketmitra.app/#website" },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: schemes.map((scheme, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "GovernmentService",
                name: scheme.name,
                description: scheme.benefit,
                url: scheme.url,
                serviceType: "Agriculture support scheme",
                areaServed: { "@type": "Country", name: "India" },
                provider: { "@type": "GovernmentOrganization", name: scheme.dept },
                eligibleRegion: { "@type": "Country", name: "India" },
              },
            })),
          },
        }),
      },
    ],
  }),
  component: SchemesPage,
});

function SchemesPage() {
  const { t } = useLang();

  return (
    <Screen>
      <TopBar title={t("schemes")} back="/home" />

      <div className="px-4 pt-4 sm:px-5 lg:px-0 lg:pt-6">
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
          Benefits and criteria as published by the implementing department. Apply on the official portal —
          MarketMitra does not process applications.
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {schemes.map((scheme) => (
            <article key={scheme.id} className="card-surface hover-lift flex min-w-0 flex-col border-t-4 border-t-gold p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="tint-gold grid size-10 shrink-0 place-items-center rounded-xl">
                  <Landmark className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-extrabold leading-snug">{scheme.name}</h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{scheme.dept}</p>
                </div>
              </div>

              <p className="mt-3 text-[13px] font-semibold leading-snug text-gold-foreground">{scheme.benefit}</p>

              <ul className="mt-3 space-y-1.5">
                {scheme.criteria.map((c) => (
                  <li key={c} className="flex gap-2 text-[12px] leading-snug text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                    {c}
                  </li>
                ))}
              </ul>

              <a
                href={scheme.url}
                onClick={() => track("scheme_viewed", { label: scheme.name })}
                target="_blank"
                rel="noreferrer noopener"
                className="press mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gold/45 pt-0 text-xs font-bold text-gold-foreground"
              >
                Open official portal <ExternalLink className="size-3.5" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </Screen>
  );
}
