import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/app-shell";
import { langNames, useLang } from "@/lib/i18n";
import { crops, farmer, inr, type Lang } from "@/lib/data";
import { ChevronRight, LogOut, MapPin, Phone, Settings2, Sprout, Wallet } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Farmer profile — MarketMitra" },
      {
        name: "description",
        content: "Your farm details, saved crops, selling history and language preferences.",
      },
      { property: "og:title", content: "Farmer profile — MarketMitra" },
      {
        property: "og:description",
        content: "Track every sale and manage your MarketMitra preferences.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, lang, setLang } = useLang();
  const total = farmer.history.reduce((s, h) => s + h.amount, 0);
  const saved = farmer.savedCrops
    .map((id) => crops.find((c) => c.id === id))
    .filter((c): c is (typeof crops)[number] => Boolean(c));

  return (
    <Screen>
      <TopBar
        title={t("profile")}
        back="/home"
        action={
          <button className="press grid size-9 place-items-center rounded-full bg-muted" aria-label="Settings">
            <Settings2 className="size-4.5" />
          </button>
        }
      />

      <div className="px-5 pt-5">
        <div className="card-surface p-5">
          <div className="flex items-center gap-4">
            <span className="grad-primary grid size-16 shrink-0 place-items-center rounded-3xl text-xl font-extrabold text-primary-foreground">
              RP
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold">{farmer.name}</h2>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Phone className="size-3.5" /> {farmer.phone}
              </p>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> {farmer.village}
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-border pt-4">
            {[
              { l: "Land", v: `${farmer.landAcres} acre` },
              { l: "Sales", v: `${farmer.history.length}` },
              { l: "Earned", v: inr(total) },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="truncate text-sm font-extrabold">{s.v}</p>
                <p className="text-[10px] text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-5">
          <h3 className="text-sm font-bold">{t("savedCrops")}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {saved.map((c) => (
              <Link
                key={c.id}
                to="/markets"
                search={{ crop: c.id, qty: 20 }}
                className="press card-surface inline-flex items-center gap-2 px-3.5 py-2.5"
              >
                <span className="text-base">{c.emoji}</span>
                <span className="text-xs font-bold">{c.name[lang]}</span>
                <span className="text-[11px] font-semibold text-primary">{inr(c.price)}</span>
              </Link>
            ))}
            <Link
              to="/crops"
              className="press inline-flex items-center gap-1.5 rounded-2xl border border-dashed border-primary/45 px-3.5 py-2.5 text-xs font-bold text-primary"
            >
              <Sprout className="size-3.5" /> Add crop
            </Link>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-bold">{t("sellingHistory")}</h3>
          <div className="mt-3 space-y-2.5">
            {farmer.history.map((h) => (
              <div
                key={h.id}
                className="card-surface grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10">
                  <Wallet className="size-4.5 text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {h.crop} · {h.qty} q
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {h.market} · {h.date}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-extrabold text-primary">{inr(h.amount)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-bold">{t("language")}</h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(Object.keys(langNames) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`press rounded-2xl border py-3.5 text-sm font-bold ${
                  lang === l
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {langNames[l]}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 space-y-2.5">
          {["Notification settings", "Payment & bank details", "Help & support"].map((item) => (
            <button
              key={item}
              className="press card-surface flex w-full items-center justify-between px-4 py-4 text-sm font-semibold"
            >
              {item}
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          ))}
          <Link
            to="/"
            className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-4 text-sm font-bold text-destructive"
          >
            <LogOut className="size-4" /> Log out
          </Link>
        </div>
      </div>
    </Screen>
  );
}
