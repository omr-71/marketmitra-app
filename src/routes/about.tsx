import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/app-shell";
import { LogoMark } from "@/components/brand";
import { Reveal } from "@/components/reveal";
import {
  ArrowRight,
  BarChart3,
  CloudSun,
  Leaf,
  MapPinned,
  ShieldCheck,
  Sprout,
  Target,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MarketMitra — Sell Smarter. Earn Better." },
      {
        name: "description",
        content:
          "MarketMitra brings market prices, weather, crop guidance and agricultural information together to help farmers make clearer decisions.",
      },
      { property: "og:title", content: "About MarketMitra" },
      {
        property: "og:description",
        content:
          "The story behind MarketMitra and why we are building simpler agricultural decision tools for farmers.",
      },
      {
        property: "og:url",
        content: "https://marketmitra.app/about",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://marketmitra.app/about",
      },
    ],
  }),
  component: AboutPage,
});

const decisions = [
  {
    number: "01",
    icon: <Wallet className="size-5" />,
    label: "SELL",
    title: "Know where your crop makes sense.",
    body:
      "Market information should reach you before the journey begins — not after you arrive at the mandi.",
  },
  {
    number: "02",
    icon: <ShieldCheck className="size-5" />,
    label: "PROTECT",
    title: "Notice crop problems earlier.",
    body:
      "When something looks wrong in the field, getting useful guidance early can matter more than getting it later.",
  },
  {
    number: "03",
    icon: <CloudSun className="size-5" />,
    label: "PLAN",
    title: "Know what the day looks like.",
    body:
      "Weather and field conditions can change the plan. MarketMitra puts that information where the decision happens.",
  },
];

const pillars = [
  {
    icon: <BarChart3 className="size-5" />,
    title: "Market intelligence",
    body: "Understand market information before deciding where to sell.",
  },
  {
    icon: <CloudSun className="size-5" />,
    title: "Field awareness",
    body: "Keep weather and farming conditions visible when planning the day.",
  },
  {
    icon: <Leaf className="size-5" />,
    title: "Crop guidance",
    body: "Get practical information when your crop needs attention.",
  },
];

function AboutPage() {
  return (
    <Screen>
      <TopBar title="About us" subtitle="MarketMitra" back="/home" />

      <div className="space-y-8 px-5 pt-5 lg:space-y-14 lg:px-0 lg:pt-8">
        {/* HERO */}
        <Reveal>
          <section
            className="relative min-h-[520px] overflow-hidden rounded-[2rem] p-7 text-ink-foreground lg:min-h-[620px] lg:p-14"
            style={{
              backgroundImage: "var(--gradient-ink)",
            }}
          >
            {/* Background decoration */}
            <div className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-primary/20 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-32 -left-20 size-[300px] rounded-full bg-primary/10 blur-[80px]" />

            <div className="relative flex min-h-[460px] flex-col justify-between lg:min-h-[520px]">
              <div>
                <span className="glass-dark inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]">
                  <Sprout className="size-3.5" />
                  Built around the farmer
                </span>

                <h1 className="mt-8 max-w-4xl font-display text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-5xl lg:text-7xl">
                  The farmer has the crop.
                  <br />
                  <span className="text-primary-glow">
                    The question is what to do next.
                  </span>
                </h1>

                <p className="mt-7 max-w-2xl text-sm leading-relaxed opacity-80 lg:text-lg">
                  MarketMitra brings important agricultural information into
                  one place — so farmers can understand the situation before
                  making the next decision.
                </p>
              </div>

              <div className="mt-12 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/crops"
                  className="press grad-primary inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-bold text-primary-foreground shadow-[var(--shadow-float)]"
                >
                  Explore MarketMitra
                  <ArrowRight className="size-4" />
                </Link>

                <div className="glass-dark inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold">
                  <Target className="size-4 text-primary" />
                  Sell Smarter. Earn Better.
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* THE CORE IDEA */}
        <Reveal>
          <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                The idea
              </p>

              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight lg:text-5xl">
                Information already exists.
                <br />
                <span className="text-muted-foreground">
                  The timing is what matters.
                </span>
              </h2>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:text-[15px]">
              A farmer can have a good harvest and still face difficult
              decisions. Which market? What is happening with the weather?
              Does the crop need attention? MarketMitra is built around those
              moments.
            </p>
          </section>
        </Reveal>

        {/* BEFORE / AFTER */}
        <Reveal>
          <section className="overflow-hidden rounded-[2rem] border border-border/70">
            <div className="flex flex-col lg:flex-row">
              {/* BEFORE */}
              <div className="flex-1 bg-muted/40 p-7 lg:p-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Without the right information
                </p>

                <h3 className="mt-5 max-w-md font-display text-2xl font-extrabold leading-tight lg:text-3xl">
                  “Should I sell here?”
                </h3>

                <div className="mt-7 space-y-3">
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-xs text-muted-foreground">
                      Market
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      Is there a better option nearby?
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-xs text-muted-foreground">
                      Journey
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      Will the extra distance make sense?
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-xs text-muted-foreground">
                      Conditions
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      What could change today's plan?
                    </p>
                  </div>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="hidden w-px bg-border lg:block" />
              <div className="h-px bg-border lg:hidden" />

              {/* WITH MARKET MITRA */}
              <div className="flex-1 bg-card p-7 lg:p-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  With MarketMitra
                </p>

                <h3 className="mt-5 max-w-md font-display text-2xl font-extrabold leading-tight lg:text-3xl">
                  “Now I can check before I decide.”
                </h3>

                <div className="mt-7 space-y-3">
                  <div className="flex items-center gap-4 rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/10">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                      <BarChart3 className="size-5 text-primary" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">Compare markets</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Understand available market information.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/10">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                      <MapPinned className="size-5 text-primary" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">Consider the journey</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Put distance and selling decisions together.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/10">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                      <CloudSun className="size-5 text-primary" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">Check the conditions</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        See weather information before planning.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* THREE DECISIONS */}
        <Reveal>
          <section>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  One platform
                </p>

                <h2 className="mt-2 font-display text-3xl font-extrabold lg:text-4xl">
                  Three decisions. One place.
                </h2>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                MarketMitra is not designed to make agriculture more
                complicated. It is designed to make the next decision clearer.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row">
              {decisions.map((item, index) => (
                <Reveal key={item.number} delay={index * 90}>
                  <article className="card-surface hover-lift group relative h-full min-h-[270px] flex-1 overflow-hidden p-6 lg:p-7">
                    <div className="flex items-start justify-between">
                      <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                        {item.icon}
                      </span>

                      <span className="font-display text-xs font-bold text-muted-foreground">
                        {item.number}
                      </span>
                    </div>

                    <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      {item.label}
                    </p>

                    <h3 className="mt-2 font-display text-xl font-extrabold leading-tight">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>

                    <div className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        {/* WHY US */}
        <Reveal>
          <section
            className="relative overflow-hidden rounded-[2rem] p-7 lg:p-12"
            style={{
              backgroundImage: "var(--gradient-ink)",
            }}
          >
            <div className="pointer-events-none absolute -right-32 -top-32 size-80 rounded-full bg-primary/15 blur-[90px]" />

            <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-glow">
                  Why MarketMitra
                </p>

                <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-ink-foreground lg:text-5xl">
                  Not another dashboard.
                  <br />
                  <span className="opacity-60">
                    A clearer next move.
                  </span>
                </h2>

                <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-foreground/70 lg:text-base">
                  Agricultural information can be difficult to navigate when
                  it is spread across different places. MarketMitra brings the
                  pieces together around the decisions farmers actually make.
                </p>
              </div>

              <div className="flex w-full max-w-md flex-col gap-3">
                {pillars.map((item, index) => (
                  <div
                    key={item.title}
                    className="glass-dark flex items-center gap-4 rounded-2xl p-4 transition-transform duration-300 hover:translate-x-1"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-glow">
                      {item.icon}
                    </span>

                    <div>
                      <p className="text-sm font-bold text-ink-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-foreground/60">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* OUR PRINCIPLE */}
        <Reveal>
          <section className="flex flex-col gap-6 rounded-[2rem] border border-border/70 bg-muted/30 p-7 lg:flex-row lg:items-center lg:p-10">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary/10">
              <Target className="size-7 text-primary" />
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Our principle
              </p>

              <h2 className="mt-2 font-display text-2xl font-extrabold lg:text-3xl">
                Useful information beats more information.
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Every feature has to earn its place. If it does not help a
                farmer understand the market, protect the crop, plan the day,
                or make the next decision, it does not belong in the
                experience.
              </p>
            </div>
          </section>
        </Reveal>

        {/* FOUNDER */}
        <Reveal>
          <section className="card-surface overflow-hidden rounded-[2rem]">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-7 lg:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  About
                </p>

                <div className="mt-5 flex items-center gap-4">
                  <LogoMark className="size-14" />

                  <div>
                    <h2 className="font-display text-2xl font-extrabold">
                      MarketMitra
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      Agricultural technology
                    </p>
                  </div>
                </div>

                <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground lg:text-[15px]">
                  MarketMitra is an agriculture-focused digital technology
                  platform created to make useful agricultural information
                  easier to understand and act on.
                </p>
              </div>

              <div className="flex flex-1 flex-col justify-center bg-muted/40 p-7 lg:p-10">
                <p className="font-display text-2xl font-extrabold leading-tight lg:text-3xl">
                  “Build technology that makes the next decision easier.”
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full bg-background px-3 py-1.5 text-[11px] font-bold ring-1 ring-border">
                    Agriculture
                  </span>
                  <span className="rounded-full bg-background px-3 py-1.5 text-[11px] font-bold ring-1 ring-border">
                    Technology
                  </span>
                  <span className="rounded-full bg-background px-3 py-1.5 text-[11px] font-bold ring-1 ring-border">
                    Real-world decisions
                  </span>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* FINAL CTA */}
        <Reveal>
          <section className="pb-4 text-center lg:pb-8">
            <div className="mx-auto max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                The next decision
              </p>

              <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight lg:text-5xl">
                Don't just know what is happening.
                <br />
                <span className="text-muted-foreground">
                  Know what to look at next.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                MarketMitra is built to bring the right information closer to
                the moment it becomes useful.
              </p>

              <Link
                to="/home"
                className="press grad-primary mt-7 inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-bold text-primary-foreground shadow-[var(--shadow-float)]"
              >
                Open MarketMitra
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </Screen>
  );
}