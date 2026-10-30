import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Screen, TopBar } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import { useLang } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { crops } from "@/lib/crops";
import { useLocationContext } from "@/lib/location";
import { marketPricesQuery } from "@/lib/market-queries";
import { inr } from "@/lib/format";
import { ArrowRight, Check, Loader2, Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/crops")({
  head: () => ({
    meta: [
      { title: "Select your crop — MarketMitra" },
      {
        name: "description",
        content: "Choose a crop and quantity to compare live APMC prices and your net realisation.",
      },
      { property: "og:title", content: "Select your crop — MarketMitra" },
      {
        property: "og:description",
        content: "Onion, tomato, wheat, cotton, soybean, gram and more — live mandi rates.",
      },
      { property: "og:url", content: "https://marketmitra.app/crops" },
    ],
    links: [{ rel: "canonical", href: "https://marketmitra.app/crops" }],
  }),
  component: CropsPage,
});

function CropsPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { location } = useLocationContext();
  const [selected, setSelected] = useState("onion");
  const [qty, setQty] = useState(20);

  const crop = crops.find((c) => c.id === selected) ?? crops[0]!;

  const priceQuery = useQuery(
    marketPricesQuery({
      commodity: crop.commodity,
      ...(location?.state ? { state: location.state } : {}),
      ...(location?.district ? { district: location.district } : {}),
    }),
  );

  const best = priceQuery.data?.records[0];

  return (
    <Screen>
      <TopBar title={t("selectCrop")} subtitle="Step 1 of 2" back="/home" />

      <div className="px-5 pt-5">
        <LocationCard />

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {crops.map((c) => {
            const active = c.id === selected;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelected(c.id);
                  track("crop_selected", { label: c.commodity });
                }}
                className={`press relative flex flex-col items-center gap-2 rounded-3xl border px-2 py-4 ${
                  active
                    ? "border-primary bg-primary/8 shadow-[var(--shadow-card)]"
                    : "border-border bg-card"
                }`}
              >
                {active && (
                  <span className="absolute right-2 top-2 grid size-4.5 place-items-center rounded-full bg-primary">
                    <Check className="size-3 text-primary-foreground" strokeWidth={3} />
                  </span>
                )}
                <span className="text-2xl">{c.emoji}</span>
                <span className="line-clamp-1 text-xs font-bold">{c.name[lang]}</span>
              </button>
            );
          })}
        </div>

        <div className="card-surface hover-lift mt-6 p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold">{t("quantity")}</p>
              <p className="truncate text-xs text-muted-foreground">
                {crop.name[lang]} · {crop.unit}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 5))}
                className="press grid size-10 place-items-center rounded-full bg-muted"
                aria-label="Decrease"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-12 text-center text-xl font-extrabold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(500, q + 5))}
                className="press grid size-10 place-items-center rounded-full bg-primary text-primary-foreground"
                aria-label="Increase"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <input
            type="range"
            min={1}
            max={200}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="mt-5 h-1.5 w-full appearance-none rounded-full bg-muted accent-primary"
            aria-label={t("quantity")}
          />

          <div className="mt-5 border-t border-border pt-4">
            {!location?.district ? (
              <p className="text-xs text-muted-foreground">
                Select your district to see matching prices.
              </p>
            ) : priceQuery.isPending ? (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> {t("loading")}
              </p>
            ) : best ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    {t("modalPrice")} · {best.market}
                  </p>
                  <p className="text-base font-extrabold">{inr(best.modalPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">Gross value</p>
                  <p className="text-base font-extrabold text-primary">
                    {inr(best.modalPrice * qty)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{t("noPrices")}</p>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate({ to: "/markets", search: { crop: selected, qty } })}
          disabled={!location?.district}
          className="press grad-primary mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-primary-foreground shadow-[var(--shadow-float)] disabled:opacity-60"
        >
          {t("compareMarkets")}
          <ArrowRight className="size-5" />
        </button>
      </div>
    </Screen>
  );
}
