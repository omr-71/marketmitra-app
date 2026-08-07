import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/app-shell";
import { LogoMark } from "@/components/brand";
import { Reveal } from "@/components/reveal";
import {
  ArrowRight,
  BarChart3,
  CloudSun,
  Compass,
  Handshake,
  Languages,
  Mail,
  MapPinned,
  ShieldCheck,
  Sprout,
  Target,
  Wallet,
  Gauge,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MarketMitra — Mandi intelligence for Indian farmers" },
      {
        name: "description",
        content:
          "MarketMitra helps farmers decide where to sell: official APMC price data, transport cost, net profit and live farm weather in English, Marathi and Hindi.",
      },
      { property: "og:title", content: "About MarketMitra" },
      {
        property: "og:description",
        content:
          "Our story, the problem we solve, and our mission to put real mandi pricing power in every farmer's hands.",
      },
    ],
  }),
  component: AboutPage,
});

const problems = [
  {
    icon: <BarChart3 className="size-5 text-primary" />,
    title: "Price blindness at the gate",
    body: "Farmers often learn the day's rate only after reaching the mandi, with no way to compare nearby markets first.",
  },
  {
    icon: <MapPinned className="size-5 text-primary" />,
    title: "Transport eats the margin",
    body: "A higher headline rate can still lose money once distance, freight and loading costs are counted.",
  },
  {
    icon: <CloudSun className="size-5 text-primary" />,
    title: "Weather-driven losses",
    body: "Unplanned rain during drying or transit lowers grade and price, and forecasts rarely reach the field in time.",
  },
  {
    icon: <Languages className="size-5 text-primary" />,
    title: "Language and access gaps",
    body: "Most agri data portals are English-only, desktop-first and built for analysts, not for growers.",
  },
];

const values = [
  {
    icon: <ShieldCheck className="size-5 text-primary" />,
    title: "Real data only",
    body: "Prices come from official APMC / Agmarknet reporting and weather from Open-Meteo. Nothing is estimated or invented.",
  },
  {
    icon: <Compass className="size-5 text-primary" />,
    title: "Decisions, not dashboards",
    body: "Every screen answers one question: what should I do with this crop today?",
  },
  {
    icon: <Handshake className="size-5 text-primary" />,
    title: "Built with farmers",
    body: "Layout, language and terminology follow how growers already talk about their crop, mandi and trip.",
  },
];

const whyUs = [
  {
    icon: <Wallet className="size-5 text-primary" />,
    title: "Net profit, not just rates",
    body: "Every market is ranked after transport, freight and distance are deducted — the number you actually take home.",
  },
  {
    icon: <Gauge className="size-5 text-primary" />,
    title: "Live, verified sources",
    body: "Official APMC / Agmarknet price feeds and Open-Meteo weather, timestamped in IST on every screen.",
  },
  {
    icon: <Languages className="size-5 text-primary" />,
    title: "Three languages, one tap",
    body: "English, Marathi and Hindi across the whole product — including crop names and market terminology.",
  },
  {
    icon: <Users className="size-5 text-primary" />,
    title: "Free and account-free",
    body: "No paperwork, no subscription. Open the app and get today's answer in seconds on any phone.",
  },
];

function AboutPage() {
  return (
    <Screen>
      <TopBar title="About us" subtitle="MarketMitra" back="/home" />

      <div className="space-y-5 px-5 pt-5 lg:space-y-8 lg:px-0 lg:pt-8">
        {/* Hero */}
        <section
          className="animate-rise relative overflow-hidden rounded-4xl p-7 text-ink-foreground lg:p-12"
          style={{ backgroundImage: "var(--gradient-ink)" }}
        >
          <span className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="glass-dark inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider">
              <Sprout className="size-3.5" /> Agri-tech from the field up
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight lg:text-5xl">
              Mandi intelligence that pays for the trip
              <span className="text-primary-glow">.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed opacity-85 lg:text-lg">
              MarketMitra turns official market data into one clear answer for the farmer standing
              beside a loaded trolley: which market gives the best net return today. Live APMC rates,
              distance and transport cost, weather risk and a 7-day outlook — in the farmer's own
              language.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/crops"
                className="press grad-primary inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-float)]"
              >
                Compare markets <ArrowRight className="size-4" />
              </Link>
              <a
                href="mailto:hello.marketmitra@gmail.com"
                className="press glass-dark inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-sm font-bold"
              >
                <Mail className="size-4" /> Talk to the team
              </a>
            </div>
          </div>
        </section>

        {/* Story */}
        <Reveal><section className="grid gap-4 lg:grid-cols-[1.25fr_1fr] lg:gap-6">
          <article className="card-surface hover-lift p-6 lg:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Our story</p>
            <h3 className="mt-3 font-display text-xl font-extrabold lg:text-2xl">
              It started with one bad selling day
            </h3>
            <div className="mt-4 space-y-3.5 text-sm leading-relaxed text-muted-foreground lg:text-[15px]">
              <p>
                A farmer loads produce at dawn, drives to the nearest mandi and accepts whatever rate
                the day offers. A market two hours away may be paying substantially more — but by the
                time anyone knows, the crop is already sold.
              </p>
              <p>
                That gap between public price data and the person who needs it is what MarketMitra
                closes. We pull official APMC arrivals and min / modal / max rates, place them next to
                distance, freight and expected weather, and rank markets by the number that actually
                matters: net profit in hand.
              </p>
              <p>
                Today the same product runs as a premium mobile experience in the field and a full
                web platform on a desktop — one codebase, real data, three languages.
              </p>
            </div>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="card-surface hover-lift p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/10">
                <Target className="size-5 text-primary" />
              </span>
              <p className="mt-4 text-sm font-extrabold">Our mission</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Give every farmer the same price visibility a large trader already has — free, in
                their language, before the crop leaves the farm.
              </p>
            </div>
            <div className="card-surface hover-lift p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/10">
                <Compass className="size-5 text-primary" />
              </span>
              <p className="mt-4 text-sm font-extrabold">Our vision</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                An agricultural market where selling decisions are made on evidence, so a good
                harvest reliably becomes a good income.
              </p>
            </div>
          </div>
        </section></Reveal>

        {/* Why Market Mitra */}
        <Reveal>
          <section
            className="relative overflow-hidden rounded-4xl border border-border/70 p-6 lg:p-10"
            style={{
              backgroundImage:
                "radial-gradient(120% 120% at 100% 0%, color-mix(in oklab, var(--color-primary) 12%, transparent) 0%, transparent 55%)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Why Market Mitra
            </p>
            <h3 className="mt-2 font-display text-xl font-extrabold lg:text-2xl">
              Built for the decision at the farm gate
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {whyUs.map((item, i) => (
                <Reveal key={item.title} delay={i * 70}>
                  <article className="glass hover-lift h-full rounded-3xl p-5">
                    <span className="grid size-11 place-items-center rounded-2xl bg-primary/10">
                      {item.icon}
                    </span>
                    <p className="mt-4 text-sm font-extrabold">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Problem */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">The problem</p>
              <h3 className="mt-2 font-display text-xl font-extrabold lg:text-2xl">
                What MarketMitra solves
              </h3>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {problems.map((item) => (
              <Reveal key={item.title}>
              <article className="card-surface hover-lift h-full p-6">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10">
                  {item.icon}
                </span>
                <p className="mt-4 text-sm font-extrabold">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">How we build</p>
          <h3 className="mt-2 font-display text-xl font-extrabold lg:text-2xl">
            Principles behind the product
          </h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {values.map((item) => (
              <Reveal key={item.title}>
              <article className="card-surface hover-lift h-full p-6">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10">
                  {item.icon}
                </span>
                <p className="mt-4 text-sm font-extrabold">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
              </Reveal>
            ))}

          </div>
        </section>

        {/* Team + contact */}
        <section className="card-surface hover-lift grid gap-6 p-7 lg:grid-cols-[1fr_1fr] lg:items-center lg:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Developed by</p>
            <div className="mt-3 flex items-center gap-3">
              <LogoMark className="size-12" />
              <div>
                <p className="font-display text-xl font-extrabold">Market Mitra Team</p>
                <p className="text-xs font-semibold text-muted-foreground">
                  Product · Engineering · Field research
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              A small independent team building agricultural decision tools for Indian growers, with
              a bias toward verified public data and interfaces that work on a low-cost phone.
            </p>
          </div>

          <div className="rounded-3xl bg-muted/60 p-6">
            <p className="text-sm font-extrabold">Contact</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Partnerships, feedback, FPO and district collaborations.
            </p>
            <a
              href="mailto:hello.marketmitra@gmail.com"
              className="press mt-4 flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border transition-shadow hover:shadow-[var(--shadow-card)]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                <Mail className="size-5 text-primary" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold text-muted-foreground">Email</span>
                <span className="block truncate text-sm font-extrabold">
                  hello.marketmitra@gmail.com
                </span>
              </span>
            </a>
          </div>
        </section>
      </div>
    </Screen>
  );
}
