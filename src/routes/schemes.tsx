import { createFileRoute } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { schemes } from "@/lib/data";
import { BadgeCheck, CalendarDays, ChevronRight, FileCheck2, Landmark } from "lucide-react";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Government schemes — MarketMitra" },
      {
        name: "description",
        content:
          "Browse farmer schemes like PM Kisan, Fasal Bima and Kisan Credit Card with eligibility details.",
      },
      { property: "og:title", content: "Government schemes — MarketMitra" },
      {
        property: "og:description",
        content: "Check which agriculture subsidies and credit schemes you qualify for.",
      },
    ],
  }),
  component: SchemesPage,
});

function SchemesPage() {
  const { t } = useLang();
  const eligibleCount = schemes.filter((s) => s.eligible).length;

  return (
    <Screen>
      <TopBar title={t("schemes")} subtitle={`${eligibleCount} schemes match your profile`} back="/home" />

      <div className="px-5 pt-5">
        <div className="grad-ink flex items-center gap-4 rounded-3xl p-5 text-[oklch(0.97_0.01_140)]">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[oklch(1_0_0/0.1)]">
            <Landmark className="size-6 text-primary-glow" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-extrabold">₹1,08,000 potential benefit</p>
            <p className="text-xs text-[oklch(0.82_0.02_145)]">
              Based on 4.5 acres in Ahmednagar district
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {schemes.map((s) => (
            <article key={s.id} className="card-surface p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <h2 className="text-[15px] font-extrabold leading-snug">{s.name}</h2>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{s.dept}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                    s.eligible
                      ? "bg-primary/12 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.eligible && <BadgeCheck className="size-3" />}
                  {s.eligible ? t("eligible") : t("notEligible")}
                </span>
              </div>

              <p className="mt-3 rounded-2xl bg-secondary/70 px-3.5 py-2.5 text-xs font-bold text-secondary-foreground">
                {s.benefit}
              </p>

              <ul className="mt-3 space-y-2">
                {s.criteria.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                    <FileCheck2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="min-w-0">{c}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  {s.deadline}
                </span>
                <button className="press inline-flex items-center gap-1 text-xs font-extrabold text-primary">
                  Apply
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Screen>
  );
}
