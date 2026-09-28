import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

import { useFeature } from "@/lib/features";
import { useLang } from "@/lib/i18n";
import { track } from "@/lib/analytics";

const DeferredMitraAI = lazy(() =>
  import("@/components/mitra-ai").then((module) => ({
    default: module.MitraAI,
  })),
);

const ORB_STORAGE_KEY = "market-mitra-mitra-orb-v2";
const ORB_SIZE_DESKTOP = 64;
const ORB_SIZE_MOBILE = 56;

type Position = { x: number; y: number };

const openLabel = {
  en: "Open Mitra",
  mr: "मित्र उघडा",
  hi: "मित्र खोलें",
} as const;

function clampOrbPosition(position: Position): Position {
  const size = window.innerWidth >= 1024 ? ORB_SIZE_DESKTOP : ORB_SIZE_MOBILE;

  return {
    x: Math.min(Math.max(position.x, 8), Math.max(8, window.innerWidth - size - 8)),
    y: Math.min(Math.max(position.y, 8), Math.max(8, window.innerHeight - size - 8)),
  };
}

function readOrbPosition(): Position | null {
  try {
    const raw = window.localStorage.getItem(ORB_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("x" in parsed) ||
      !("y" in parsed) ||
      typeof parsed.x !== "number" ||
      typeof parsed.y !== "number"
    ) {
      return null;
    }

    return { x: parsed.x, y: parsed.y };
  } catch {
    return null;
  }
}

function defaultOrbPosition(hasBottomNav: boolean): Position {
  const size = window.innerWidth >= 1024 ? ORB_SIZE_DESKTOP : ORB_SIZE_MOBILE;
  const bottomSpace = hasBottomNav ? 104 : 24;

  return {
    x: Math.max(12, window.innerWidth - size - 24),
    y: Math.max(12, window.innerHeight - size - bottomSpace),
  };
}

function saveOrbPosition(position: Position) {
  try {
    window.localStorage.setItem(ORB_STORAGE_KEY, JSON.stringify(position));
  } catch {
    // Storage can be unavailable in private browsing.
  }
}

function MitraMark() {
  return (
    <span className="relative grid size-7 shrink-0 place-items-center" aria-hidden="true">
      <span className="absolute left-1/2 top-[10%] size-[28%] -translate-x-1/2 rounded-full bg-current" />
      <span className="absolute left-1/2 top-[34%] h-[28%] w-[52%] -translate-x-1/2 rounded-[55%_55%_30%_30%] bg-current" />
      <span className="absolute bottom-[13%] left-[12%] h-[10%] w-[76%] rotate-[-5deg] rounded-full border-t-[1.5px] border-current/80" />
      <span className="absolute bottom-[5%] left-[20%] h-[8%] w-[60%] rotate-[4deg] rounded-full border-t-[1.5px] border-current/45" />
      <span className="absolute inset-0 rounded-full bg-current/10 animate-pulse" />
    </span>
  );
}

function LauncherOrb({
  position,
  hideOrb,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onClick,
}: {
  position: Position | null;
  hideOrb: boolean;
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>;
  onPointerMove: React.PointerEventHandler<HTMLButtonElement>;
  onPointerUp: React.PointerEventHandler<HTMLButtonElement>;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
  const { lang } = useLang();

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      aria-label={openLabel[lang]}
      aria-expanded={false}
      aria-hidden={hideOrb}
      tabIndex={hideOrb ? -1 : 0}
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              right: "auto",
              bottom: "auto",
            }
          : undefined
      }
      className={[
        "fixed z-[60] grid place-items-center",
        "size-14 lg:size-16",
        "touch-none select-none",
        "cursor-grab active:cursor-grabbing",
        "rounded-full",
        "text-primary-foreground",
        "shadow-[var(--shadow-float)]",
        "ring-1 ring-white/20",
        "transition-[transform,opacity] duration-300",
        "hover:scale-105",
        "active:scale-95",
        hideOrb ? "pointer-events-none scale-90 opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <span className="absolute -inset-2 rounded-full bg-primary/10 blur-xl" />
      <span className="absolute -inset-1 rounded-full bg-primary/20 blur-md" />
      <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="absolute -left-8 top-0 h-full w-1/2 rotate-12 bg-white/15 blur-xl" />
      </span>
      <span className="relative grid size-full place-items-center overflow-hidden rounded-full grad-primary ring-1 ring-white/20">
        <span className="absolute left-3 top-2 size-3 rounded-full bg-white/50 blur-[2px]" />
        <MitraMark />
        <span className="absolute bottom-2 right-2 size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
      </span>
    </button>
  );
}

export function MitraAILauncher() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const flag = useFeature("mitra_ai");
  const [activated, setActivated] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const dragRef = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const updateDesktop = () => setIsDesktop(media.matches);
    updateDesktop();
    media.addEventListener("change", updateDesktop);

    return () => media.removeEventListener("change", updateDesktop);
  }, []);

  useEffect(() => {
    const saved = readOrbPosition();
    setPosition(
      clampOrbPosition(
        saved ??
          defaultOrbPosition(pathname !== "/" && !pathname.startsWith("/admin")),
      ),
    );
  }, [isDesktop, pathname]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const inset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      const next = inset > 80 ? Math.round(inset) : 0;
      setKeyboardInset((current) => (current === next ? current : next));
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleResize = () => {
      setPosition((current) => {
        if (!current) return current;
        const next = clampOrbPosition(current);
        saveOrbPosition(next);
        return next;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isDesktop]);

  if (pathname.startsWith("/admin") || flag?.enabled === false) return null;

  if (activated) {
    return (
      <Suspense
        fallback={
          <LauncherOrb
            position={position}
            hideOrb={keyboardInset > 0}
            onPointerDown={() => {}}
            onPointerMove={() => {}}
            onPointerUp={() => {}}
            onClick={() => {}}
          />
        }
      >
        <DeferredMitraAI initialOpen />
      </Suspense>
    );
  }

  return (
    <LauncherOrb
      position={position}
      hideOrb={keyboardInset > 0}
      onPointerDown={(event) => {
        if (!position) return;
        dragRef.current = {
          active: true,
          moved: false,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originX: position.x,
          originY: position.y,
        };
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag.active || drag.pointerId !== event.pointerId) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) drag.moved = true;
        setPosition(
          clampOrbPosition({ x: drag.originX + dx, y: drag.originY + dy }),
        );
      }}
      onPointerUp={(event) => {
        const drag = dragRef.current;
        if (!drag.active || drag.pointerId !== event.pointerId) return;
        drag.active = false;
        setPosition((current) => {
          if (!current) return current;
          const next = clampOrbPosition(current);
          saveOrbPosition(next);
          return next;
        });
        try {
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        } catch {
          // Pointer capture may already be released.
        }
      }}
      onClick={(event) => {
        if (dragRef.current.moved) {
          dragRef.current.moved = false;
          event.preventDefault();
          return;
        }
        track("mitra_ai_opened");
        setActivated(true);
      }}
    />
  );
}
