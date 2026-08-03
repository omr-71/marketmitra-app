import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Screen, TopBar } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { crops, inr } from "@/lib/data";
import { Check, Minus, Plus, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/crops")({
  head: () => ({
    meta: [
      { title: "Select your crop — MarketMitra" },
      {
        name: "description",
        content: "Choose a crop and quantity to compare mandi prices, transport cost and net profit.",
      },
      { property: "og:title", content: "Select your crop — MarketMitra" },
      {
        property: "og:description",
        content: "Onion, tomato, wheat, cotton, soybean, sugarcane and more.",
      },
    ],
  }),
  component: CropsPage,
});

function CropsPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("onion");
  const [qty, setQty] = useState(30);

  const crop = crops.find((c) => c.id === selected)!;

  return (
    <Screen>
      <TopBar title={t("selectCrop")} subtitle="Step 1 of 2" back="/home" />

      <div className="px-5 pt-5">
        <div className="grid grid-cols-3 gap-2.5">
          {crops.map((c) => {
            const active = c.id === selected;
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
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
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {inr(c.price)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="card-surface mt-6 p-5">
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
          />

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
            <div>
              <p className="text-[11px] text-muted-foreground">Today's rate</p>
              <p className="text-base font-extrabold">{inr(crop.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">Gross value</p>
              <p className="text-base font-extrabold text-primary">{inr(crop.price * qty)}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate({ to: "/markets", search: { crop: selected, qty } })}
          className="press grad-primary mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-primary-foreground shadow-[var(--shadow-float)]"
        >
          {t("compareMarkets")}
          <ArrowRight className="size-5" />
        </button>
      </div>
    </Screen>
  );
}
