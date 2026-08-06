import { createFileRoute } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { schemes } from "@/lib/schemes";
import { ExternalLink, Landmark } from "lucide-react";

export const Route = createFileRoute("/schemes")({
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
    ],
  }),
  component: SchemesPage,
});

function SchemesPage() {
  const { t } = useLang();

  return (
    <Screen>
      <TopBar title={t("schemes")} back="/home" />

      <div className="px-5 pt-5">
        <p className="text-xs text-muted-foreground">
          Benefits and criteria as published by the implementing department. Apply on the official portal —
          MarketMitra does not process applications.
        </p>

        <div className="mt-4 space-y-3">
          {schemes.map((scheme) => (
            <article key={scheme.id} className="card-surface hover-lift p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10">
                  <Landmark className="size-4.5 text-primary" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-extrabold leading-snug">{scheme.name}</h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{scheme.dept}</p>
                </div>
              </div>

              <p className="mt-3 text-[13px] font-semibold leading-snug text-primary">{scheme.benefit}</p>

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
                target="_blank"
                rel="noreferrer noopener"
                className="press mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-primary/35 text-xs font-bold text-primary"
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
