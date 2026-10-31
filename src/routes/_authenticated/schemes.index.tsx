import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Screen, TopBar } from "@/components/app-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLang } from "@/lib/i18n";
import { schemes, type Scheme } from "@/lib/schemes";
import { track } from "@/lib/analytics";
import {
  ArrowRight,
  BadgeCheck,
  Filter,
  Landmark,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

const categories = [
  "All Schemes",
  "Income Support",
  "Crop Insurance",
  "Agricultural Loans",
  "Equipment & Machinery Subsidies",
  "Irrigation & Water Management",
  "Solar Energy & Renewable Agriculture",
  "Seeds & Fertilizers",
  "Organic & Natural Farming",
  "Horticulture",
  "Livestock & Dairy",
  "Agricultural Infrastructure",
  "Market Access & Farmer Support",
  "State Government Schemes",
] as const;

export const Route = createFileRoute("/_authenticated/schemes/")({
  component: SchemesPage,
});

function SchemesPage() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All Schemes");
  const [level, setLevel] = useState("All");
  const [state, setState] = useState("All States");
  const [sort, setSort] = useState("relevance");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = schemes.filter((scheme) => {
      const searchable =
        `${scheme.name} ${scheme.benefit} ${scheme.dept} ${scheme.criteria.join(" ")}`.toLowerCase();
      return (
        (!needle || searchable.includes(needle)) &&
        (category === "All Schemes" || scheme.category === category) &&
        (level === "All" || scheme.level === level) &&
        (state === "All States" || scheme.state === state)
      );
    });
    return sort === "name" ? [...result].sort((a, b) => a.name.localeCompare(b.name)) : result;
  }, [category, level, query, sort, state]);

  const clearFilters = () => {
    setQuery("");
    setCategory("All Schemes");
    setLevel("All");
    setState("All States");
    setSort("relevance");
  };

  const filterControls = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      <label className="text-xs font-bold text-muted-foreground">
        {t("governmentLevel")}
        <select
          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
          value={level}
          onChange={(event) => setLevel(event.target.value)}
        >
          <option value="All">All</option>
          <option value="Central">Central</option>
          <option value="State">State</option>
        </select>
      </label>
      <label className="text-xs font-bold text-muted-foreground">
        {t("state")}
        <select
          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
          value={state}
          onChange={(event) => setState(event.target.value)}
        >
          <option value="All States">{t("allStates")}</option>
          <option value="Maharashtra">Maharashtra / महाराष्ट्र / महाराष्ट्र</option>
        </select>
      </label>
      <label className="text-xs font-bold text-muted-foreground">
        {t("sort")}
        <select
          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="relevance">{t("relevance")}</option>
          <option value="name">{t("schemeName")}</option>
        </select>
      </label>
    </div>
  );

  return (
    <Screen>
      <TopBar title={t("schemes")} back="/home" settings={false} />
      <main className="pb-8">
        <header className="relative overflow-hidden border-b border-border/70 pb-6 pt-4 lg:rounded-[28px] lg:border lg:bg-card lg:px-8 lg:py-8">
          <div className="absolute right-0 top-0 hidden h-full w-2/5 items-center justify-end pr-10 opacity-15 lg:flex">
            <Landmark className="size-40 text-primary" strokeWidth={0.9} />
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
            {t("farmerBenefits")}
          </p>
          <h1 className="mt-2 max-w-2xl text-[27px] font-extrabold leading-tight tracking-tight lg:text-4xl">
            {t("schemesTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Discover financial assistance, crop protection, equipment support, irrigation and other
            official agriculture programmes.
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <BadgeCheck className="size-4 text-primary" />
            {schemes.length} programmes listed · Information status shown on each scheme
          </div>
          <div className="mt-5 relative max-w-3xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("schemesSearch")}
              className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </header>

        <div className="mt-4 lg:mt-6">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold transition ${category === item ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
              >
                {item === "All Schemes" ? t("allSchemes") : item}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between lg:hidden">
            <span className="text-xs font-bold text-muted-foreground">
              {filtered.length} schemes
            </span>
            <Dialog>
              <DialogTrigger className="press flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-bold">
                <SlidersHorizontal className="size-4" /> {t("filters")}
              </DialogTrigger>
              <DialogContent className="bottom-0 top-auto max-h-[85vh] translate-y-0 rounded-t-[28px] border-x-0 border-b-0 sm:bottom-auto sm:top-[50%] sm:max-w-md sm:translate-y-[-50%] sm:rounded-2xl sm:border">
                <DialogHeader>
                  <DialogTitle>{t("filters")}</DialogTitle>
                  <DialogDescription>
                    Refine government programmes by level and sorting.
                  </DialogDescription>
                </DialogHeader>
                {filterControls}
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              {filtered.length === 0 ? (
                <div className="card-surface py-12 text-center">
                  <p className="text-sm font-bold">{t("noSchemes")}</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 text-xs font-bold text-primary underline underline-offset-4"
                  >
                    {t("clearFilters")}
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((scheme) => (
                    <SchemeCard key={scheme.id} scheme={scheme} />
                  ))}
                </div>
              )}
            </div>
            <aside className="hidden lg:block">
              <div className="card-surface p-4 sticky top-24">
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-primary" />
                  <h2 className="text-sm font-extrabold">{t("filters")}</h2>
                </div>
                <div className="mt-4">{filterControls}</div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </Screen>
  );
}

function SchemeCard({ scheme }: { scheme: Scheme }) {
  const { t } = useLang();
  return (
    <article className="card-surface group flex min-h-[210px] min-w-0 flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="h-1 bg-gradient-to-r from-primary/80 to-gold/70" />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Landmark className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/8 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-primary">
                {scheme.level}
              </span>
              {scheme.verified && (
                <ShieldCheck className="size-3.5 text-primary" aria-label={t("verifiedScheme")} />
              )}
            </div>
            <h2 className="mt-2 text-[15px] font-extrabold leading-snug">{scheme.name}</h2>
          </div>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{scheme.dept}</p>
        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-5 text-primary">
          {scheme.benefit}
        </p>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {scheme.criteria[0]}
        </p>
        <Link
          to="/schemes/$schemeId"
          params={{ schemeId: scheme.id }}
          onClick={() => track("scheme_viewed", { label: scheme.name })}
          className="press mt-auto flex h-11 items-center justify-between border-t border-border pt-3 text-xs font-bold text-primary"
        >
          {t("viewDetails")}{" "}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
