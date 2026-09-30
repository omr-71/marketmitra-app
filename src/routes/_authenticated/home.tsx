import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import {
  useRef,
  useState,
  type ComponentType,
  type PointerEvent,
  type ReactNode,
} from "react";

import { Screen } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import {
  DataProvenance,
  FreshnessBadge,
  UnavailableState,
} from "@/components/market-meta";
import { Reveal } from "@/components/reveal";
import { AnimatedNumber } from "@/components/motion/animated-number";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/stagger";
import {
  CardSkeleton,
  RowSkeleton,
} from "@/components/skeletons";
import { Button } from "@/components/ui/button";

import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useLocationContext } from "@/lib/location";
import { crops, findCrop } from "@/lib/crops";
import {
  latestPerMarket,
  marketPricesQuery,
} from "@/lib/market-queries";
import { getWeather } from "@/lib/weather-fetch";
import { inr, useIstNow } from "@/lib/format";
import {
  bestFarmingWindow,
  conditionLabel,
  todayInsight,
  uvLabel,
} from "@/lib/farm-insights";

import {
  ArrowRight,
  CloudRain,
  CloudSun,
  Droplets,
  Leaf,
  Lightbulb,
  MapPin,
  Navigation,
  RefreshCw,
  Sparkles,
  Sun,
  Wind,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Dashboard — MarketMitra" },
      {
        name: "description",
        content:
          "Live mandi prices, local weather and market guidance for your district, updated from official sources.",
      },
      {
        property: "og:title",
        content: "Dashboard — MarketMitra",
      },
      {
        property: "og:description",
        content:
          "Live APMC prices and weather for your district in one place.",
      },
      {
        property: "og:url",
        content: "https://marketmitra.app/home",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://marketmitra.app/home",
      },
    ],
  }),
  component: HomePage,
});

/* =========================================================
   HOME
========================================================= */

function HomePage() {
  const { t, lang } = useLang();
  const { profile } = useSession();
  const { location } = useLocationContext();
  const savedIds = profile?.saved_crops?.length
    ? profile.saved_crops
    : ["onion"];

  const primary = findCrop(savedIds[0]!) ?? crops[0]!;

  const priceQuery = useQuery(
    marketPricesQuery({
      commodity: primary.commodity,
      ...(location?.state ? { state: location.state } : {}),
      ...(location?.district
        ? { district: location.district }
        : {}),
    }),
  );

  const weatherQuery = useQuery({
    queryKey: [
      "weather",
      location?.latitude,
      location?.longitude,
    ],
    enabled: Boolean(
      location?.latitude != null &&
        location?.longitude != null,
    ),
    queryFn: () =>
      getWeather(
        location!.latitude!,
        location!.longitude!,
      ),
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });

  const records = latestPerMarket(
    priceQuery.data?.records ?? [],
  );

  const best = records[0];

  const weather = weatherQuery.data?.ok
    ? weatherQuery.data
    : null;

  const marketCount = new Set(
    records.map((record) => record.market),
  ).size;

  const avgModal = records.length
    ? Math.round(
        records.reduce(
          (sum, record) => sum + record.modalPrice,
          0,
        ) / records.length,
      )
    : 0;

  const spread = best
    ? best.maxPrice - best.minPrice
    : 0;

  const farmingWindow = weather
    ? bestFarmingWindow(weather)
    : null;

  const WeatherIcon = weather
    ? weather.current.code <= 1
      ? Sun
      : weather.current.code >= 51
        ? CloudRain
        : CloudSun
    : CloudSun;

  return (
    <Screen>
      <main className="relative isolate min-h-screen overflow-hidden pb-12">
        {/* =====================================================
            GLOBAL IMMERSIVE ATMOSPHERE
        ===================================================== */}

        <HomeAtmosphere />

        <div className="relative z-10 space-y-7 sm:space-y-8">
          {/* ===================================================
              HERO
          =================================================== */}

          <Reveal>
            <LiveWeatherHero
              profileName={
                profile?.full_name || "MarketMitra"
              }
              locationLabel={
                location?.place ||
                location?.district ||
                t("locationNeeded")
              }
              weather={weather}
              weatherIcon={WeatherIcon}
              farmingWindow={farmingWindow}
              weatherPending={weatherQuery.isPending}
              weatherLinkLabel={t("weather")}
              insight={
                weather ? todayInsight(weather) : null
              }
              t={t}
            />
          </Reveal>

          {/* ===================================================
              LOCATION
          =================================================== */}

          <Reveal delay={80}>
            <MagneticCard className="relative z-10">
              <LocationCard />
            </MagneticCard>
          </Reveal>

          {/* ===================================================
              MARKET COMMAND CENTER
          =================================================== */}

          <Reveal delay={120}>
            <MarketCommandCenter
              primary={primary}
              lang={lang}
              location={location}
              priceQuery={priceQuery}
              records={records}
              best={best}
              marketCount={marketCount}
              avgModal={avgModal}
              spread={spread}
              t={t}
            />
          </Reveal>

          {/* ===================================================
              FIELD SIGNAL
          =================================================== */}

          {weather && (
            <Reveal delay={160}>
              <FieldSignal weather={weather} />
            </Reveal>
          )}

          {/* ===================================================
              MARKET ACTIVITY
          =================================================== */}

          <Reveal delay={200}>
            <MarketActivity
              records={records}
              primary={primary}
              lang={lang}
              priceQuery={priceQuery}
              location={location}
              t={t}
            />
          </Reveal>

          {/* ===================================================
              WEATHER ERROR
          =================================================== */}

          {!weather &&
            location?.latitude != null &&
            weatherQuery.data &&
            !weatherQuery.data.ok && (
              <Reveal delay={240}>
                <section className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/75 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.07)] backdrop-blur-xl sm:p-6">
                  <div className="absolute -right-20 -top-20 size-48 rounded-full bg-primary/8 blur-3xl" />

                  <div className="relative flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-2xl bg-sky-500/10 text-sky-500">
                      <CloudSun className="size-4" />
                    </span>

                    <div>
                      <p className="eyebrow">
                        {t("weather")}
                      </p>

                      <p className="mt-0.5 text-xs font-bold">
                        Weather couldn't be refreshed.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="ml-auto"
                      onClick={() =>
                        void weatherQuery.refetch()
                      }
                    >
                      <RefreshCw className="mr-1.5 size-3.5" />
                      {t("retry")}
                    </Button>
                  </div>
                </section>
              </Reveal>
            )}

          {!weather &&
            location?.latitude != null &&
            weatherQuery.isPending && (
              <Reveal delay={240}>
                <CardSkeleton lines={3} />
              </Reveal>
            )}
        </div>
      </main>
    </Screen>
  );
}

function LiveClock() {
  const { timeLabel } = useIstNow();
  return <>{timeLabel} IST</>;
}

/* =========================================================
   IMMERSIVE HOME ATMOSPHERE
========================================================= */

function HomeAtmosphere() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Deep gradient field */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_34%),radial-gradient(circle_at_100%_30%,hsl(205_90%_60%/0.07),transparent_30%),radial-gradient(circle_at_0%_75%,hsl(150_80%_45%/0.055),transparent_30%)]" />

      {/* Mouse-following energy */}
      <motion.div
        style={{
          left: "15%",
          top: "20%",
        }}
        className="absolute size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.045] blur-[110px]"
      />

      {/* Slow aurora layers */}
      <motion.div
        animate={{
          x: ["-8%", "8%", "-8%"],
          y: ["-4%", "5%", "-4%"],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-[15%] top-[8%] h-[30rem] w-[75%] rounded-full bg-primary/[0.035] blur-[100px]"
      />

      <motion.div
        animate={{
          x: ["8%", "-7%", "8%"],
          y: ["5%", "-4%", "5%"],
          rotate: [2, -2, 2],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-[20%] top-[38%] h-[34rem] w-[70%] rounded-full bg-sky-500/[0.025] blur-[110px]"
      />

      {/* Perspective grid */}
      <div
        className="absolute inset-x-0 top-[28%] h-[70%] opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)/0.45) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)/0.45) 1px, transparent 1px)",
          backgroundSize: "58px 58px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 22%, black 72%, transparent)",
          transform:
            "perspective(900px) rotateX(58deg) scale(1.6)",
          transformOrigin: "top center",
        }}
      />

      {/* Moving horizontal scan */}
      <motion.div
        animate={{
          y: ["-10vh", "110vh"],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 5,
        }}
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
      />

    </div>
  );
}

/* =========================================================
   LIVE WEATHER HERO
========================================================= */

function LiveWeatherHero({
  profileName,
  locationLabel,
  weather,
  weatherIcon: WeatherIcon,
  farmingWindow,
  weatherPending,
  weatherLinkLabel,
  insight,
  t,
}: {
  profileName: string;
  locationLabel: string;
  weather: any;
  weatherIcon: ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  farmingWindow: any;
  weatherPending: boolean;
  weatherLinkLabel: string;
  insight: string | null;
  t: (key: any) => string;
}) {
  const ref = useRef<HTMLElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, {
    stiffness: 48,
    damping: 18,
    mass: 0.7,
  });

  const springY = useSpring(mouseY, {
    stiffness: 48,
    damping: 18,
    mass: 0.7,
  });

  const contentX = useTransform(
    springX,
    [-1, 1],
    [-7, 7],
  );

  const contentY = useTransform(
    springY,
    [-1, 1],
    [-5, 5],
  );

  const orbX = useTransform(
    springX,
    [-1, 1],
    [-42, 42],
  );

  const orbY = useTransform(
    springY,
    [-1, 1],
    [-28, 28],
  );

  const orb2X = useTransform(
    springX,
    [-1, 1],
    [32, -32],
  );

  const orb2Y = useTransform(
    springY,
    [-1, 1],
    [20, -20],
  );

  const ringX = useTransform(
    springX,
    [-1, 1],
    [15, -15],
  );

  const ringY = useTransform(
    springY,
    [-1, 1],
    [12, -12],
  );

  const handlePointerMove = (
    event: PointerEvent<HTMLElement>,
  ) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const nx =
      ((event.clientX - rect.left) / rect.width - 0.5) *
      2;

    const ny =
      ((event.clientY - rect.top) / rect.height - 0.5) *
      2;

    mouseX.set(Math.max(-1, Math.min(1, nx)));
    mouseY.set(Math.max(-1, Math.min(1, ny)));
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.section
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-[31rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[#071b16] px-5 pb-6 pt-5 text-white shadow-[0_30px_100px_rgba(0,0,0,0.20)] sm:px-7 sm:pb-8 sm:pt-7 lg:min-h-[34rem] lg:px-10 lg:pb-9 lg:pt-8"
      initial={{
        opacity: 0,
        y: 28,
        scale: 0.975,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Deep atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(77,255,178,0.18),transparent_28%),radial-gradient(circle_at_12%_90%,rgba(36,145,255,0.14),transparent_32%),linear-gradient(135deg,#071b16_0%,#08241b_45%,#06151a_100%)]" />

      {/* Aurora ribbons */}
      <motion.div
        animate={{
          x: ["-15%", "12%", "-15%"],
          y: ["-10%", "8%", "-10%"],
          rotate: [-4, 3, -4],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-[20%] top-[2%] h-40 w-[80%] rounded-full bg-emerald-300/[0.08] blur-[65px]"
      />

      <motion.div
        animate={{
          x: ["12%", "-10%", "12%"],
          y: ["5%", "-8%", "5%"],
        }}
        transition={{
          duration: 27,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-[20%] bottom-[12%] h-52 w-[70%] rounded-full bg-cyan-300/[0.07] blur-[80px]"
      />

      {/* Weather orb */}
      <motion.div
        style={{
          x: orbX,
          y: orbY,
        }}
        className="absolute right-[4%] top-[12%] size-56 rounded-full bg-emerald-300/[0.06] blur-3xl sm:size-72"
      />

      <motion.div
        style={{
          x: orb2X,
          y: orb2Y,
        }}
        className="absolute bottom-[8%] left-[22%] size-40 rounded-full bg-cyan-300/[0.055] blur-3xl"
      />

      {/* Orbiting rings */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 70,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -right-16 top-8 size-64 rounded-full border border-white/[0.07] sm:size-80"
      >
        <span className="absolute left-[15%] top-[11%] size-2 rounded-full bg-emerald-200/70 shadow-[0_0_20px_rgba(110,255,190,0.8)]" />
      </motion.div>

      <motion.div
        style={{
          x: ringX,
          y: ringY,
        }}
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 44,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -right-5 top-20 size-48 rounded-full border border-white/[0.055] sm:size-64"
      >
        <span className="absolute right-[7%] top-[42%] size-1.5 rounded-full bg-cyan-200/70 shadow-[0_0_16px_rgba(100,220,255,0.8)]" />
      </motion.div>

      {/* Perspective lines */}
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_70%,transparent)]" />

      {/* Moving light sweep */}
      <motion.div
        animate={{
          x: ["-120%", "150%"],
          opacity: [0, 0.25, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeInOut",
        }}
        className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent"
      />

      {/* Noise-like texture */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,.8) .5px,transparent .5px)",
          backgroundSize: "5px 5px",
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 12 }, (_, index) => (
        <motion.span
          key={index}
          animate={{
            y: [0, -16, 0],
            x: [0, index % 2 ? 8 : -8, 0],
            opacity: [0.08, 0.35, 0.08],
          }}
          transition={{
            duration: 4 + (index % 5),
            delay: index * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            left: `${8 + ((index * 17) % 85)}%`,
            top: `${15 + ((index * 29) % 70)}%`,
          }}
          className="absolute size-1 rounded-full bg-white"
        />
      ))}

      <motion.div
        style={{
          x: contentX,
          y: contentY,
        }}
        className="relative z-10"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.55, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="text-[9px] font-bold uppercase tracking-[0.25em]"
            >
              {t("welcome")}
            </motion.p>

            <motion.h1
              initial={{
                opacity: 0,
                y: 18,
                filter: "blur(10px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              transition={{
                duration: 0.85,
                delay: 0.16,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-1 truncate font-display text-2xl font-extrabold tracking-[-0.035em] sm:text-3xl lg:text-[2.35rem]"
            >
              {profileName}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 0.68, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.3,
              }}
              className="mt-2 flex min-w-0 items-center gap-1.5 text-[10px] font-semibold"
            >
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">
                {locationLabel}
              </span>
              <span>·</span>
              <span className="shrink-0 tabular-nums">
                <LiveClock />
              </span>
            </motion.div>
          </div>

          {weather && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.5,
                rotate: -20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.35,
                type: "spring",
                stiffness: 160,
                damping: 16,
              }}
              whileHover={{
                scale: 1.08,
                rotate: 4,
              }}
              className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-[1.25rem] border border-white/[0.14] bg-white/[0.075] shadow-[0_15px_45px_rgba(0,0,0,0.15)] backdrop-blur-xl sm:size-16"
            >
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute size-10 rounded-full bg-emerald-300/10 blur-xl"
              />

              <motion.div
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <WeatherIcon
                  className="relative size-7"
                  strokeWidth={1.4}
                />
              </motion.div>
            </motion.div>
          )}
        </div>

        {weather ? (
          <>
            {/* Main weather */}
            <div className="mt-10 grid gap-9 lg:grid-cols-[1fr_430px] lg:items-end">
              <div>
                <div className="flex items-end gap-4">
                  <motion.p
                    initial={{
                      opacity: 0,
                      y: 45,
                      scale: 0.82,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="font-display text-[5.8rem] font-extrabold leading-[0.72] tracking-[-0.09em] drop-shadow-[0_14px_40px_rgba(0,0,0,0.2)] sm:text-[7.4rem] lg:text-[8rem]"
                  >
                    <AnimatedNumber
                      value={
                        weather.current.temperature
                      }
                      suffix="°"
                    />
                  </motion.p>

                  <div className="mb-2">
                    <motion.p
                      initial={{
                        opacity: 0,
                        x: 15,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration: 0.55,
                        delay: 0.48,
                      }}
                      className="text-sm font-extrabold sm:text-base"
                    >
                      {conditionLabel(
                        weather.current.code,
                      )}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.55 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.58,
                      }}
                      className="mt-1 text-[10px] font-semibold"
                    >
                      Feels like{" "}
                      {weather.current.apparent}°
                    </motion.p>
                  </div>
                </div>

                <motion.p
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 0.78,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.55,
                  }}
                  className="mt-7 max-w-xl text-xs font-medium leading-relaxed sm:text-sm"
                >
                  {insight}
                </motion.p>
              </div>

              {/* Glass weather metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                <WeatherMetric
                  icon={<Droplets className="size-4" />}
                  label={t("humidity")}
                  value={`${weather.current.humidity}%`}
                />

                <WeatherMetric
                  icon={<Wind className="size-4" />}
                  label={t("wind")}
                  value={`${weather.current.wind} km/h`}
                />

                <WeatherMetric
                  icon={<CloudRain className="size-4" />}
                  label={t("rainChance")}
                  value={`${weather.current.rainChance}%`}
                />

                <WeatherMetric
                  icon={<Sun className="size-4" />}
                  label="UV"
                  value={uvLabel(
                    weather.current.uvIndex,
                  )}
                />
              </div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.72,
              }}
              className="mt-9 border-t border-white/[0.09] pt-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {farmingWindow ? (
                  <div className="flex min-w-0 items-center gap-3">
                    <motion.span
                      animate={{
                        boxShadow: [
                          "0 0 0 rgba(255,255,255,0)",
                          "0 0 25px rgba(140,255,200,0.12)",
                          "0 0 0 rgba(255,255,255,0)",
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                      className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.07]"
                    >
                      <Lightbulb className="size-4" />
                    </motion.span>

                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] opacity-45">
                        Best field window
                      </p>

                      <p className="mt-0.5 truncate text-xs font-extrabold">
                        {farmingWindow.window}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span />
                )}

                <Link
                  to="/weather"
                  className="group flex w-fit items-center gap-1.5 text-xs font-extrabold opacity-65 transition-all duration-300 hover:gap-2.5 hover:opacity-100"
                >
                  {weatherLinkLabel}
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </>
        ) : weatherPending ? (
          <div className="mt-12">
            <motion.div
              animate={{
                opacity: [0.18, 0.4, 0.18],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
              }}
              className="h-28 w-60 rounded-[2rem] bg-white/[0.07]"
            />
          </div>
        ) : (
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.3,
            }}
            className="mt-12 max-w-md"
          >
            <p className="text-sm font-semibold opacity-75">
              Turn on your location to see live local weather
              and field conditions.
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.section>
  );
}

/* =========================================================
   WEATHER METRIC
========================================================= */

function WeatherMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.025,
      }}
      whileTap={{
        scale: 0.985,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 22,
      }}
      className="group relative overflow-hidden rounded-[1.15rem] border border-white/[0.10] bg-white/[0.065] px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
    >
      <motion.span
        className="absolute -right-5 -top-5 size-14 rounded-full bg-emerald-300/[0.08] blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] opacity-55 transition-opacity group-hover:opacity-90">
        {icon}
        {label}
      </div>

      <p className="relative mt-1.5 truncate text-xs font-extrabold sm:text-sm">
        {value}
      </p>
    </motion.div>
  );
}

/* =========================================================
   MAGNETIC CARD
========================================================= */

function MagneticCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-1, 1], [1.5, -1.5]);
  const rotateY = useTransform(x, [-1, 1], [-1.5, 1.5]);

  const sx = useSpring(rotateX, {
    stiffness: 250,
    damping: 25,
  });

  const sy = useSpring(rotateY, {
    stiffness: 250,
    damping: 25,
  });

  const move = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    x.set(
      Math.max(
        -1,
        Math.min(
          1,
          ((event.clientX - rect.left) / rect.width -
            0.5) *
            2,
        ),
      ),
    );

    y.set(
      Math.max(
        -1,
        Math.min(
          1,
          ((event.clientY - rect.top) / rect.height -
            0.5) *
            2,
        ),
      ),
    );
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{
        rotateX: sx,
        rotateY: sy,
        transformPerspective: 1200,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================
   MARKET COMMAND CENTER
========================================================= */

function MarketCommandCenter({
  primary,
  lang,
  location,
  priceQuery,
  records,
  best,
  marketCount,
  avgModal,
  spread,
  t,
}: {
  primary: any;
  lang: any;
  location: any;
  priceQuery: any;
  records: any[];
  best: any;
  marketCount: number;
  avgModal: number;
  spread: number;
  t: (key: any) => string;
}) {
  return (
    <MagneticCard>
      <section className="group/market relative overflow-hidden rounded-[2rem] border border-border/70 bg-background/80 shadow-[0_30px_100px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
        {/* Dynamic card glow */}
        <motion.div
          animate={{
            x: ["-10%", "80%", "-10%"],
            opacity: [0.15, 0.28, 0.15],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -top-32 h-64 w-[45%] rounded-full bg-primary/10 blur-[80px]"
        />

        {/* Scanner */}
        <motion.div
          animate={{
            x: ["-120%", "300%"],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            repeatDelay: 7,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute inset-y-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-primary/[0.07] to-transparent"
        />

        <div className="relative z-10 border-b border-border/70 px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">
                Market intelligence
              </p>

              <div className="mt-1 flex items-center gap-2">
                <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                  {primary.name[lang]}
                </h2>

                <motion.span
                  animate={{
                    y: [0, -3, 0],
                    rotate: [0, 3, -3, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    scale: 1.12,
                  }}
                  className="grid size-8 place-items-center rounded-xl bg-primary/10 text-base shadow-sm"
                >
                  {primary.emoji}
                </motion.span>
              </div>

              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                Official mandi reports from your selected district
              </p>
            </div>

            {priceQuery.data && (
              <FreshnessBadge
                freshness={priceQuery.data.freshness}
              />
            )}
          </div>
        </div>

        {!location?.district ? (
          <div className="relative z-10 px-5 py-9 sm:px-7">
            <EmptyMarketState />
          </div>
        ) : priceQuery.isPending ? (
          <div className="relative z-10 space-y-4 px-5 py-8 sm:px-7">
            <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
            <div className="h-14 w-48 animate-pulse rounded-2xl bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
          </div>
        ) : priceQuery.isError ? (
          <div className="relative z-10 px-5 py-8 sm:px-7">
            <UnavailableState
              onRetry={() =>
                void priceQuery.refetch()
              }
              message="The latest official market prices could not be loaded."
            />
          </div>
        ) : best ? (
          <div className="relative z-10 grid lg:grid-cols-[0.82fr_1.18fr]">
            {/* PRICE SIDE */}
            <div className="relative overflow-hidden border-b border-border/70 px-5 py-8 sm:px-7 lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full bg-primary/[0.06] blur-[70px]" />

              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Highest modal rate
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <motion.p
                    initial={{
                      opacity: 0,
                      y: 25,
                      scale: 0.9,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="font-display text-5xl font-extrabold tracking-[-0.06em] sm:text-6xl"
                  >
                    <AnimatedNumber
                      value={best.modalPrice}
                      prefix="₹"
                      formatIndian
                    />
                  </motion.p>

                  <span className="mb-2 text-[10px] font-bold text-muted-foreground">
                    / quintal
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-bold">
                  <Navigation className="size-3.5 text-primary" />
                  <span>{best.market}</span>

                  <motion.span
                    animate={{
                      scale: [1, 1.7, 1],
                      opacity: [1, 0.4, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="size-1.5 rounded-full bg-primary"
                  />
                </div>

                <div className="mt-7">
                  <PriceRange
                    min={best.minPrice}
                    modal={best.modalPrice}
                    max={best.maxPrice}
                  />
                </div>

                <div className="mt-7 grid grid-cols-3 border-y border-border/70 py-3">
                  <Metric
                    label={t("minPrice")}
                    value={inr(best.minPrice)}
                  />

                  <Metric
                    label={t("modalPrice")}
                    value={inr(best.modalPrice)}
                  />

                  <Metric
                    label={t("maxPrice")}
                    value={inr(best.maxPrice)}
                  />
                </div>

                <Link
                  to="/markets"
                  search={{
                    crop: primary.id,
                    qty: 20,
                  }}
                  className="group relative mt-6 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary text-sm font-extrabold text-primary-foreground shadow-[0_10px_35px_hsl(var(--primary)/0.2)] transition-shadow duration-500 hover:shadow-[0_15px_50px_hsl(var(--primary)/0.32)]"
                >
                  <motion.span
                    animate={{
                      x: ["-120%", "250%"],
                    }}
                    transition={{
                      duration: 3.8,
                      repeat: Infinity,
                      repeatDelay: 4,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-y-0 w-1/3 -skew-x-12 bg-white/15"
                  />

                  <span className="relative z-10">
                    Compare all markets
                  </span>

                  <ArrowRight className="relative z-10 size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
              </div>
            </div>

            {/* GRAPH SIDE */}
            <div className="min-w-0 px-5 py-8 sm:px-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold">
                    District market pulse
                  </p>

                  <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
                    Modal rates across reported markets
                  </p>
                </div>

                <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary">
                  <motion.span
                    animate={{
                      scale: [1, 1.8, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="size-1.5 rounded-full bg-primary"
                  />
                  Live
                </span>
              </div>

              {records.length > 1 ? (
                <MarketPulse records={records} />
              ) : (
                <div className="mt-6 flex h-44 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/10">
                  <p className="max-w-xs px-5 text-center text-xs font-semibold text-muted-foreground">
                    Market movement will appear when multiple
                    official reports are available.
                  </p>
                </div>
              )}

              {records.length > 0 && (
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <QuietMetric
                    label="Markets"
                    value={marketCount.toLocaleString(
                      "en-IN",
                    )}
                  />

                  <QuietMetric
                    label="Average"
                    value={inr(avgModal)}
                  />

                  <QuietMetric
                    label="Spread"
                    value={inr(spread)}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative z-10 px-5 py-8 sm:px-7">
            <UnavailableState
              onRetry={() =>
                void priceQuery.refetch()
              }
            />
          </div>
        )}
      </section>
    </MagneticCard>
  );
}

/* =========================================================
   PRICE RANGE
========================================================= */

function PriceRange({
  min,
  modal,
  max,
}: {
  min: number;
  modal: number;
  max: number;
}) {
  const range = Math.max(max - min, 1);

  const position = Math.min(
    100,
    Math.max(
      0,
      ((modal - min) / range) * 100,
    ),
  );

  return (
    <div>
      <div className="relative h-2 rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{
            width: `${position}%`,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 1.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/20 via-primary/50 to-primary"
        />

        <motion.span
          initial={{
            left: "0%",
            scale: 0,
          }}
          whileInView={{
            left: `${position}%`,
            scale: 1,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 1,
            delay: 0.15,
            type: "spring",
            stiffness: 180,
            damping: 20,
          }}
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-background bg-primary shadow-[0_0_0_5px_hsl(var(--primary)/0.08),0_4px_16px_hsl(var(--primary)/0.3)]"
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] font-bold text-muted-foreground tabular-nums">
        <span>{inr(min)}</span>
        <span>{inr(max)}</span>
      </div>
    </div>
  );
}

/* =========================================================
   MARKET GRAPH
========================================================= */

function MarketPulse({
  records,
}: {
  records: Array<{ modalPrice: number }>;
}) {
  const values = records
    .slice(0, 8)
    .map((record) => Number(record.modalPrice))
    .filter((value) => Number.isFinite(value));

  if (values.length < 2) return null;

  const width = 720;
  const height = 230;
  const paddingX = 12;
  const paddingY = 24;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  const points = values.map((value, index) => {
    const x =
      paddingX +
      (index / Math.max(values.length - 1, 1)) *
        (width - paddingX * 2);

    const y =
      height -
      paddingY -
      ((value - min) / range) *
        (height - paddingY * 2);

    return { x, y, value };
  });

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const areaPoints = [
    `${points[0]!.x},${height - paddingY}`,
    ...points.map(
      (point) => `${point.x},${point.y}`,
    ),
    `${points[points.length - 1]!.x},${height - paddingY}`,
  ].join(" ");

  const last = points[points.length - 1]!;

  return (
    <div className="relative mt-6 overflow-hidden rounded-[1.5rem] border border-border/70 bg-muted/[0.18] shadow-inner">
      {/* Moving graph light */}
      <motion.div
        animate={{
          x: ["-100%", "500%"],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "linear",
        }}
        className="pointer-events-none absolute inset-y-0 z-10 w-24 bg-gradient-to-r from-transparent via-primary/[0.08] to-transparent"
      />

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="relative z-0 h-48 w-full"
        role="img"
        aria-label="Market modal price pulse"
      >
        <defs>
          <linearGradient
            id="marketPulseFillV2"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="currentColor"
              stopOpacity="0.22"
            />
            <stop
              offset="100%"
              stopColor="currentColor"
              stopOpacity="0"
            />
          </linearGradient>

          <filter
            id="marketPulseGlowV2"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur
              stdDeviation="5"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0.2, 0.4, 0.6, 0.8].map(
          (ratio) => (
            <line
              key={ratio}
              x1="0"
              x2={width}
              y1={height * ratio}
              y2={height * ratio}
              stroke="currentColor"
              strokeOpacity="0.06"
              strokeWidth="1"
            />
          ),
        )}

        <motion.polygon
          points={areaPoints}
          fill="url(#marketPulseFillV2)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />

        <motion.polyline
          points={linePoints}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          pathLength={1}
          initial={{
            pathLength: 0,
            opacity: 0,
          }}
          whileInView={{
            pathLength: 1,
            opacity: 1,
          }}
          viewport={{ once: true }}
          transition={{
            pathLength: {
              duration: 1.5,
              ease: [0.22, 1, 0.36, 1],
            },
            opacity: {
              duration: 0.3,
            },
          }}
          filter="url(#marketPulseGlowV2)"
        />

        {points.map((point, index) => (
          <motion.circle
            key={`${point.x}-${point.y}-${index}`}
            cx={point.x}
            cy={point.y}
            r={index === points.length - 1 ? 5 : 3}
            className="fill-primary"
            initial={{
              opacity: 0,
              scale: 0,
            }}
            whileInView={{
              opacity:
                index === points.length - 1
                  ? 1
                  : 0.35,
              scale: 1,
            }}
            viewport={{ once: true }}
            transition={{
              delay: 0.7 + index * 0.08,
              duration: 0.35,
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          />
        ))}

        <motion.circle
          cx={last.x}
          cy={last.y}
          r="12"
          className="fill-primary"
          animate={{
            r: [8, 22, 8],
            opacity: [0.18, 0, 0.18],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        <motion.circle
          cx={last.x}
          cy={last.y}
          r="5"
          className="fill-primary"
          animate={{
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>

      <div className="flex items-center justify-between border-t border-border/60 px-3 py-2.5 text-[9px] font-bold text-muted-foreground">
        <span>{inr(Math.round(min))}</span>

        <span>{values.length} market reports</span>

        <span>{inr(Math.round(max))}</span>
      </div>
    </div>
  );
}

/* =========================================================
   FIELD SIGNAL
========================================================= */

function FieldSignal({ weather }: { weather: any }) {
  return (
    <Link
      to="/weather"
      className="group relative block overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/75 shadow-[0_20px_70px_rgba(0,0,0,0.06)] backdrop-blur-xl"
    >
      <motion.div
        animate={{
          x: ["-100%", "250%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeInOut",
        }}
        className="absolute inset-y-0 z-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-primary/[0.06] to-transparent"
      />

      <div className="absolute -right-20 -top-24 size-56 rounded-full bg-sky-500/[0.06] blur-[65px]" />

      <div className="relative z-10 flex items-center gap-4 px-5 py-5 sm:px-7">
        <motion.div
          animate={{
            y: [0, -4, 0],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sky-500/10 text-sky-500"
        >
          <motion.span
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0.25, 0, 0.25],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
            }}
            className="absolute size-8 rounded-full bg-sky-400/30"
          />

          <Leaf className="relative size-5" />
        </motion.div>

        <div className="min-w-0 flex-1">
          <p className="eyebrow">Field signal</p>

          <p className="mt-1 truncate text-sm font-extrabold">
            {todayInsight(weather)}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-muted-foreground">
            <span>{weather.current.temperature}°</span>
            <span>{weather.current.humidity}% humidity</span>
            <span>{weather.current.wind} km/h wind</span>
          </div>
        </div>

        <motion.div
          animate={{
            x: [0, 4, 0],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          whileHover={{
            scale: 1.15,
          }}
        >
          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </motion.div>
      </div>
    </Link>
  );
}

/* =========================================================
   MARKET ACTIVITY
========================================================= */

function MarketActivity({
  records,
  primary,
  lang,
  priceQuery,
  location,
  t,
}: {
  records: any[];
  primary: any;
  lang: any;
  priceQuery: any;
  location: any;
  t: (key: any) => string;
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <p className="eyebrow">Market activity</p>

          <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight">
            {t("todayPrices")}
          </h2>
        </div>

        <Link
          to="/crops"
          className="group flex items-center gap-1 text-xs font-extrabold text-primary"
        >
          {t("viewAll")}
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {priceQuery.isPending && location?.district ? (
        <div className="mt-4">
          <RowSkeleton rows={3} />
        </div>
      ) : records.length === 0 ? (
        <div className="relative mt-4 overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/75 px-5 py-7 shadow-[0_20px_70px_rgba(0,0,0,0.05)] backdrop-blur-xl">
          <Sparkles className="absolute right-6 top-6 size-5 text-primary/20" />

          <p className="text-xs font-semibold text-muted-foreground">
            {location?.district
              ? t("noPrices")
              : "Select your district to see prices."}
          </p>
        </div>
      ) : (
        <StaggerContainer
          className="relative mt-4 overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/75 shadow-[0_25px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl"
          staggerDelay={0.055}
        >
          {records.slice(0, 4).map(
            (record, index) => (
              <StaggerItem
                key={`${record.market}-${record.variety}-${record.date}`}
              >
                <Link
                  to="/market/$marketId"
                  params={{
                    marketId: record.market,
                  }}
                  search={{
                    crop: primary.id,
                    state: record.state,
                    district: record.district,
                  }}
                  className="group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 overflow-hidden border-b border-border/70 px-4 py-4 last:border-b-0 sm:px-6"
                >
                  {/* Hover energy */}
                  <span className="pointer-events-none absolute inset-y-0 left-0 w-0 bg-primary/[0.035] transition-all duration-500 group-hover:w-full" />

                  <motion.div
                    whileHover={{
                      scale: 1.1,
                      rotate: 4,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 22,
                    }}
                    className="relative z-10 grid size-10 place-items-center rounded-xl bg-muted/60 text-base shadow-inner"
                  >
                    {primary.emoji}

                    {index === 0 && (
                      <span className="absolute -right-1 -top-1 grid size-3.5 place-items-center rounded-full bg-primary text-[7px] font-black text-primary-foreground shadow-sm">
                        1
                      </span>
                    )}
                  </motion.div>

                  <div className="relative z-10 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-extrabold">
                        {record.market}
                      </p>

                      {index === 0 && (
                        <span className="hidden shrink-0 text-[8px] font-bold uppercase tracking-wide text-primary sm:block">
                          Highest
                        </span>
                      )}
                    </div>

                    <p className="mt-1 truncate text-[10px] font-semibold text-muted-foreground">
                      {record.district} ·{" "}
                      {record.variety ??
                        primary.name[lang]}
                    </p>
                  </div>

                  <div className="relative z-10 shrink-0 text-right">
                    <p className="font-display text-sm font-extrabold tabular-nums">
                      {inr(record.modalPrice)}
                    </p>

                    {priceQuery.data && (
                      <FreshnessBadge
                        freshness={
                          priceQuery.data.freshness
                        }
                        className="mt-1"
                      />
                    )}
                  </div>

                  <ArrowRight className="relative z-10 hidden size-3.5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary sm:block" />
                </Link>
              </StaggerItem>
            ),
          )}
        </StaggerContainer>
      )}

      {priceQuery.data && (
        <DataProvenance
          result={priceQuery.data}
          className="mt-3"
        />
      )}
    </section>
  );
}

/* =========================================================
   METRICS
========================================================= */

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
        scale: 1.02,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 22,
      }}
      className="min-w-0 text-center first:text-left last:text-right"
    >
      <p className="truncate font-display text-sm font-extrabold tabular-nums">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-semibold text-muted-foreground">
        {label}
      </p>
    </motion.div>
  );
}

function QuietMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
        scale: 1.02,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 22,
      }}
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/30 px-3 py-2.5 transition-colors duration-300 hover:border-primary/20"
    >
      <span className="absolute -right-5 -top-5 size-10 rounded-full bg-primary/[0.05] blur-lg transition-all duration-500 group-hover:bg-primary/[0.12]" />

      <p className="relative text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>

      <p className="relative mt-1 truncate font-display text-sm font-extrabold tabular-nums">
        {value}
      </p>
    </motion.div>
  );
}

/* =========================================================
   EMPTY MARKET
========================================================= */

function EmptyMarketState() {
  return (
    <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-dashed border-border/70 bg-muted/[0.12] p-4">
      <motion.span
        animate={{
          y: [0, -4, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"
      >
        <MapPin className="size-5" />
      </motion.span>

      <div>
        <p className="text-sm font-extrabold">
          Select your district
        </p>

        <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">
          We'll show matching official mandi prices here.
        </p>
      </div>
    </div>
  );
}