import { useChat } from "@ai-sdk/react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import {
  ArrowUpRight,
  ChevronLeft,
  CloudSun,
  GripHorizontal,
  Landmark,
  Leaf,
  MapPin,
  Mic,
  RefreshCw,
  RotateCcw,
  Sprout,
  Square,
  Stethoscope,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { preloadMessageResponse } from "@/components/ai-elements/message-response-loader";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { track } from "@/lib/analytics";
import { useFeature } from "@/lib/features";
import { useLang } from "@/lib/i18n";
import { useLocationContext } from "@/lib/location";
import { latestDiagnosisContext } from "@/lib/diagnose.functions";
import { resolveLang, useSettings } from "@/lib/settings";
import { useSpeechRecognition } from "@/lib/voice";
import { useMitraSpeech } from "@/lib/mitra-speech";
import { useAuth } from "@/lib/auth";
import { createThread, loadLatestThread, saveMessage, titleThread } from "@/lib/chat-history";
import { useReducedMotion } from "@/lib/motion";
import mitraFarmerMascot from "@/assets/mitra-farmer-mascot.webp";

const ORB_STORAGE_KEY = "market-mitra-mitra-orb-v2";
const PANEL_STORAGE_KEY = "market-mitra-mitra-panel-v2";

const PANEL_WIDTH = 520;
const PANEL_HEIGHT = 720;
const ORB_SIZE_DESKTOP = 64;
const ORB_SIZE_MOBILE = 56;

type Position = {
  x: number;
  y: number;
};

const copy = {
  contextLabel: {
    en: "Recent crop check",
    mr: "अलीकडील पीक तपासणी",
    hi: "हाल की फ़सल जाँच",
  },

  title: {
    en: "Mitra",
    mr: "मित्र",
    hi: "मित्र",
  },

  subtitle: {
    en: "Your farming companion",
    mr: "तुमचा शेती सहकारी",
    hi: "आपका खेती साथी",
  },

  greetings: {
    morning: {
      en: "Good morning",
      mr: "सुप्रभात",
      hi: "सुप्रभात",
    },
    afternoon: {
      en: "Good afternoon",
      mr: "दुपारची नमस्कार",
      hi: "नमस्कार",
    },
    evening: {
      en: "Good evening",
      mr: "शुभ संध्याकाळ",
      hi: "शुभ संध्या",
    },
  },

  greeting: {
    en: "Welcome back. Tell me what’s happening in your field today, and we’ll work it out together.",
    mr: "पुन्हा स्वागत आहे. आज शेतात काय चाललंय ते सांगा — आपण मिळून पाहूया.",
    hi: "वापसी पर स्वागत है। आज खेत में क्या हो रहा है, बताइए — हम मिलकर देखते हैं।",
  },

  greetingSmall: {
    en: "Prices, weather, crop care, schemes — ask me anything.",
    mr: "बाजारभाव, हवामान, पीक काळजी, योजना — काहीही विचारा.",
    hi: "मंडी भाव, मौसम, फसल देखभाल, योजनाएँ — कुछ भी पूछें।",
  },

  placeholder: {
    en: "Ask Mitra anything…",
    mr: "मित्रला काहीही विचारा…",
    hi: "मित्र से कुछ भी पूछें…",
  },

  thinking: {
    en: "Mitra is thinking",
    mr: "मित्र विचार करत आहे",
    hi: "मित्र सोच रहा है",
  },

  online: {
    en: "Online",
    mr: "ऑनलाइन",
    hi: "ऑनलाइन",
  },

  open: {
    en: "Open Mitra",
    mr: "मित्र उघडा",
    hi: "मित्र खोलें",
  },

  close: {
    en: "Close Mitra",
    mr: "मित्र बंद करा",
    hi: "मित्र बंद करें",
  },

  error: {
    en: "I couldn’t answer that just now. Please try again.",
    mr: "आत्ता उत्तर देता आले नाही. कृपया पुन्हा प्रयत्न करा.",
    hi: "अभी इसका जवाब नहीं दे पाया। कृपया फिर कोशिश करें।",
  },

  micIdle: {
    en: "Tap the microphone to speak",
    mr: "बोलण्यासाठी माइक दाबा",
    hi: "बोलने के लिए माइक दबाएँ",
  },

  listening: {
    en: "Listening…",
    mr: "ऐकत आहे…",
    hi: "सुन रहा है…",
  },

  speaking: {
    en: "Speaking…",
    mr: "बोलत आहे…",
    hi: "बोल रहा है…",
  },

  mic: {
    en: "Speak",
    mr: "बोला",
    hi: "बोलें",
  },

  stopMic: {
    en: "Stop recording",
    mr: "रेकॉर्डिंग थांबवा",
    hi: "रिकॉर्डिंग रोकें",
  },

  cancelMic: {
    en: "Cancel",
    mr: "रद्द करा",
    hi: "रद्द करें",
  },

  stopSpeak: {
    en: "Stop speaking",
    mr: "बोलणे थांबवा",
    hi: "बोलना रोकें",
  },

  retry: {
    en: "Try again",
    mr: "पुन्हा प्रयत्न",
    hi: "फिर कोशिश",
  },

  replay: {
    en: "Replay answer",
    mr: "उत्तर पुन्हा ऐका",
    hi: "उत्तर दोबारा सुनें",
  },

  micUnsupported: {
    en: "Voice input isn't available here. You can type instead.",
    mr: "या ब्राउझरमध्ये आवाज इनपुट उपलब्ध नाही. तुम्ही टाइप करू शकता.",
    hi: "इस ब्राउज़र में आवाज़ इनपुट उपलब्ध नहीं है। आप टाइप कर सकते हैं।",
  },

  micFailed: {
    en: "I couldn't hear that. Try again or type your question.",
    mr: "ते ऐकू आले नाही. पुन्हा प्रयत्न करा किंवा प्रश्न टाइप करा.",
    hi: "सुनाई नहीं दिया। फिर कोशिश करें या सवाल टाइप करें।",
  },

  dragHint: {
    en: "Drag to move",
    mr: "हलवण्यासाठी ड्रॅग करा",
    hi: "हिलाने के लिए ड्रैग करें",
  },
} as const;

function getTimeGreetingPeriod(): keyof typeof copy.greetings {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function getGreetingName(user: { user_metadata?: Record<string, unknown> } | null) {
  if (!user?.user_metadata) return "";

  const candidates = [user.user_metadata.full_name, user.user_metadata.name, user.user_metadata.first_name];
  const name = candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0);
  return name?.trim().split(/\s+/)[0] ?? "";
}

const suggestions = {
  en: [
    {
      icon: Sprout,
      title: "Today’s market",
      text: "Check onion prices",
    },
    {
      icon: CloudSun,
      title: "Weather",
      text: "Should I spray this week?",
    },
    {
      icon: Stethoscope,
      title: "Crop care",
      text: "My leaves look unusual",
    },
    {
      icon: Landmark,
      title: "Government schemes",
      text: "Find schemes for me",
    },
  ],

  mr: [
    {
      icon: Sprout,
      title: "आजचा बाजारभाव",
      text: "कांद्याचे भाव तपासा",
    },
    {
      icon: CloudSun,
      title: "हवामान",
      text: "या आठवड्यात फवारणी करू?",
    },
    {
      icon: Stethoscope,
      title: "पीक काळजी",
      text: "पानांमध्ये बदल दिसतोय",
    },
    {
      icon: Landmark,
      title: "शासकीय योजना",
      text: "माझ्यासाठी योजना शोधा",
    },
  ],

  hi: [
    {
      icon: Sprout,
      title: "आज का बाजार",
      text: "प्याज़ के भाव देखें",
    },
    {
      icon: CloudSun,
      title: "मौसम",
      text: "इस हफ्ते छिड़काव करूँ?",
    },
    {
      icon: Stethoscope,
      title: "फसल देखभाल",
      text: "पत्तों में बदलाव है",
    },
    {
      icon: Landmark,
      title: "सरकारी योजनाएँ",
      text: "मेरे लिए योजनाएँ खोजें",
    },
  ],
} as const;

function useKeyboardInset() {
  const [state, setState] = useState({
    inset: 0,
    height: 0,
  });

  useEffect(() => {
    const vv = window.visualViewport;

    if (!vv) return;

    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);

      setState({
        inset: inset > 80 ? Math.round(inset) : 0,
        height: Math.round(vv.height),
      });
    };

    update();

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return state;
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const update = () => setDesktop(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return desktop;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function readPosition(key: string): Position | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (typeof parsed?.x !== "number" || typeof parsed?.y !== "number") {
      return null;
    }

    return {
      x: parsed.x,
      y: parsed.y,
    };
  } catch {
    return null;
  }
}

function savePosition(key: string, position: Position) {
  try {
    window.localStorage.setItem(key, JSON.stringify(position));
  } catch {
    // Storage can be unavailable in private browsing.
  }
}

function getDefaultOrbPosition(hasBottomNav: boolean): Position {
  const width = window.innerWidth >= 1024 ? ORB_SIZE_DESKTOP : ORB_SIZE_MOBILE;

  const bottomSpace = hasBottomNav ? 104 : 24;

  return {
    x: Math.max(12, window.innerWidth - width - 24),
    y: Math.max(12, window.innerHeight - width - bottomSpace),
  };
}

function getDefaultPanelPosition(): Position {
  const height = Math.min(PANEL_HEIGHT, Math.max(420, window.innerHeight * 0.8));

  return {
    x: Math.max(16, window.innerWidth - PANEL_WIDTH - 24),
    y: Math.max(16, window.innerHeight - height - 24),
  };
}

function clampPanelPosition(position: Position): Position {
  const actualHeight = Math.min(PANEL_HEIGHT, Math.max(420, window.innerHeight * 0.8));

  return {
    x: clamp(position.x, 12, Math.max(12, window.innerWidth - PANEL_WIDTH - 12)),
    y: clamp(position.y, 12, Math.max(12, window.innerHeight - actualHeight - 12)),
  };
}

function clampOrbPosition(position: Position): Position {
  const size = window.innerWidth >= 1024 ? ORB_SIZE_DESKTOP : ORB_SIZE_MOBILE;

  return {
    x: clamp(position.x, 8, Math.max(8, window.innerWidth - size - 8)),
    y: clamp(position.y, 8, Math.max(8, window.innerHeight - size - 8)),
  };
}

function MitraMark({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "size-4",
    md: "size-5",
    lg: "size-7",
  };

  return (
    <span
      className={`relative grid ${sizes[size]} shrink-0 place-items-center ${className}`}
      aria-hidden="true"
    >
      {/* Farmer */}
      <span className="absolute top-[10%] left-1/2 size-[28%] -translate-x-1/2 rounded-full bg-current" />

      <span className="absolute top-[34%] left-1/2 h-[28%] w-[52%] -translate-x-1/2 rounded-[55%_55%_30%_30%] bg-current" />

      {/* Field lines */}
      <span className="absolute bottom-[13%] left-[12%] h-[10%] w-[76%] rotate-[-5deg] rounded-full border-t-[1.5px] border-current/80" />

      <span className="absolute bottom-[5%] left-[20%] h-[8%] w-[60%] rotate-[4deg] rounded-full border-t-[1.5px] border-current/45" />

      {/* Live effect */}
      <span className="absolute inset-0 rounded-full bg-current/10 animate-pulse" />
    </span>
  );
}

export function MitraAI({ initialOpen = false }: { initialOpen?: boolean }) {
  const { lang } = useLang();
  const { location } = useLocationContext();
  const reducedMotion = useReducedMotion();
  const coarsePointer =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const simplifyMotion = reducedMotion || coarsePointer;

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const flag = useFeature("mitra_ai");

  const [open, setOpen] = useState(initialOpen);
  const [text, setText] = useState("");

  const [orbPosition, setOrbPosition] = useState<Position | null>(null);

  const [panelPosition, setPanelPosition] = useState<Position | null>(null);

  const [panelReady, setPanelReady] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const responseRendererPreloadRef = useRef(false);

  const preloadResponseRenderer = useCallback(() => {
    if (responseRendererPreloadRef.current) return;
    responseRendererPreloadRef.current = true;
    void preloadMessageResponse().catch((cause: unknown) => {
      responseRendererPreloadRef.current = false;
      console.error("Unable to preload the Mitra response renderer", cause);
    });
  }, []);

  const { user, session } = useAuth();
  const greetingPeriod = getTimeGreetingPeriod();
  const greetingName = getGreetingName(user);
  const localizedGreeting = copy.greetings[greetingPeriod][lang];
  const welcomeGreeting = greetingName
    ? `${localizedGreeting}, ${greetingName}.`
    : `${localizedGreeting}.`;

  const conversationIdRef = useRef<string | null>(null);

  const savedIdsRef = useRef<Set<string>>(new Set());

  const { inset: keyboardInset, height: viewportHeight } = useKeyboardInset();

  const isDesktop = useIsDesktop();

  const diagnosisFn = useServerFn(latestDiagnosisContext);

  const diagnosis = useQuery({
    queryKey: ["mitra-diagnosis-context"],
    queryFn: () => diagnosisFn(),
    enabled: open,
    retry: false,
    staleTime: 120_000,
  });

  const diagnosisCtx = diagnosis.data ?? null;

  const { messages, setMessages, sendMessage, regenerate, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: () =>
        session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},

      prepareSendMessagesRequest: ({ messages: msgs }) => ({
        body: {
          messages: msgs.slice(-24),

          lang,

          location: location
            ? {
                state: location.state,
                district: location.district,
                place: location.place,
                latitude: location.latitude,
                longitude: location.longitude,
              }
            : null,
        },
      }),
    }),
  });

  const busy = status === "submitted" || status === "streaming";

  /*
   * ---------------------------------------------------------
   * Position persistence
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const savedPanel = readPosition(PANEL_STORAGE_KEY);

    const savedOrb = readPosition(ORB_STORAGE_KEY);

    setPanelPosition(clampPanelPosition(savedPanel ?? getDefaultPanelPosition()));

    setOrbPosition(
      clampOrbPosition(
        savedOrb ?? getDefaultOrbPosition(pathname !== "/" && !pathname.startsWith("/admin")),
      ),
    );
  }, [isDesktop, pathname]);

  useEffect(() => {
    if (!isDesktop) return;

    const handleResize = () => {
      setPanelPosition((current) => {
        if (!current) return current;

        const next = clampPanelPosition(current);

        savePosition(PANEL_STORAGE_KEY, next);

        return next;
      });

      setOrbPosition((current) => {
        if (!current) return current;

        const next = clampOrbPosition(current);

        savePosition(ORB_STORAGE_KEY, next);

        return next;
      });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isDesktop]);

  /*
   * ---------------------------------------------------------
   * Desktop panel drag
   * ---------------------------------------------------------
   */

  const panelDragRef = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const handlePanelPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!isDesktop || !panelPosition) return;

      if (event.pointerType !== "mouse" && event.pointerType !== "touch") {
        return;
      }

      const target = event.target as HTMLElement;

      if (target.closest("button")) return;

      panelDragRef.current = {
        active: true,
        moved: false,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: panelPosition.x,
        originY: panelPosition.y,
      };

      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [isDesktop, panelPosition],
  );

  const handlePanelPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const drag = panelDragRef.current;

    if (!drag.active || drag.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      drag.moved = true;
    }

    const next = clampPanelPosition({
      x: drag.originX + dx,
      y: drag.originY + dy,
    });

    setPanelPosition(next);
  }, []);

  const handlePanelPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const drag = panelDragRef.current;

      if (!drag.active || drag.pointerId !== event.pointerId) {
        return;
      }

      drag.active = false;

      if (panelPosition) {
        savePosition(PANEL_STORAGE_KEY, panelPosition);
      }

      try {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      } catch {
        // Pointer capture may already be released.
      }
    },
    [panelPosition],
  );

  /*
   * ---------------------------------------------------------
   * Closed orb drag
   * ---------------------------------------------------------
   */

  const orbDragRef = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const handleOrbPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!orbPosition) return;

      orbDragRef.current = {
        active: true,
        moved: false,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: orbPosition.x,
        originY: orbPosition.y,
      };

      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [orbPosition],
  );

  const handleOrbPointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = orbDragRef.current;

    if (!drag.active || drag.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      drag.moved = true;
    }

    setOrbPosition(
      clampOrbPosition({
        x: drag.originX + dx,
        y: drag.originY + dy,
      }),
    );
  }, []);

  const handleOrbPointerUp = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = orbDragRef.current;

    if (!drag.active || drag.pointerId !== event.pointerId) {
      return;
    }

    drag.active = false;

    setOrbPosition((current) => {
      if (!current) return current;

      const next = clampOrbPosition(current);

      savePosition(ORB_STORAGE_KEY, next);

      return next;
    });

    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture may already be released.
    }
  }, []);

  /*
   * ---------------------------------------------------------
   * Open / close animation
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!open) {
      setPanelReady(false);
      return;
    }

    setPanelReady(false);

    const frame = window.requestAnimationFrame(() => {
      setPanelReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const openMitra = useCallback(() => {
    if (!isDesktop) {
      setOpen(true);
      track("mitra_ai_opened");
      return;
    }

    if (!panelPosition) {
      setPanelPosition(getDefaultPanelPosition());
    }

    track("mitra_ai_opened");
    setOpen(true);
  }, [isDesktop, panelPosition]);

  const closeMitra = useCallback(() => {
    setOpen(false);

    if (panelPosition) {
      savePosition(PANEL_STORAGE_KEY, panelPosition);
    }
  }, [panelPosition]);

  /*
   * ---------------------------------------------------------
   * Restore saved conversation
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!user) {
      conversationIdRef.current = null;
      savedIdsRef.current = new Set();
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const thread = await loadLatestThread(user.id);

        if (cancelled || !thread) return;

        conversationIdRef.current = thread.id;

        savedIdsRef.current = new Set(thread.messages.map((message) => message.id));

        setMessages(thread.messages);
      } catch (cause) {
        console.error("Unable to load your saved chat", cause);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, setMessages]);

  /*
   * ---------------------------------------------------------
   * Save conversation
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!user || busy || messages.length === 0) {
      return;
    }

    let cancelled = false;

    void (async () => {
      for (const message of messages) {
        if (cancelled) return;

        if (message.role !== "user" && message.role !== "assistant") {
          continue;
        }

        if (savedIdsRef.current.has(message.id)) {
          continue;
        }

        try {
          if (!conversationIdRef.current) {
            conversationIdRef.current = await createThread(user.id, lang);
          }

          await saveMessage({
            conversationId: conversationIdRef.current,
            userId: user.id,
            role: message.role,
            message,
          });

          savedIdsRef.current.add(message.id);

          if (message.role === "user") {
            await titleThread(conversationIdRef.current, message);
          }
        } catch (cause) {
          console.error("Unable to save this message", cause);
          return;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [messages, busy, user, lang]);

  useEffect(() => {
    if (error) {
      track("mitra_ai_error");
    }
  }, [error]);

  /*
   * ---------------------------------------------------------
   * Composer focus
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!open) return;

    const id = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 240);

    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (open && status === "ready") {
      inputRef.current?.focus();
    }
  }, [open, status]);

  /*
   * ---------------------------------------------------------
   * Voice
   * ---------------------------------------------------------
   */

  const { settings } = useSettings();

  const voicePrefs = useMemo(
    () => ({
      voiceId: settings.voice.voiceId,
      speed: settings.voice.speed,
      volume: settings.voice.volume,
      expressive: settings.voice.emotional,
    }),
    [settings.voice],
  );

  const speech = useMitraSpeech(voicePrefs, resolveLang(settings.voice.lang, lang));

  const mic = useSpeechRecognition(lang);
  const { setTranscript: setMicTranscript } = mic;

  const send = useCallback(
    (value: string) => {
      const trimmed = value.trim();

      if (!trimmed || busy) return;

      setText("");
      speech.stop();

      track("mitra_ai_message");
      preloadResponseRenderer();

      void sendMessage({
        text: trimmed,
      });

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    [busy, preloadResponseRenderer, sendMessage, speech],
  );

  useEffect(() => {
    if (mic.listening && mic.transcript) {
      setText(mic.transcript);
    }
  }, [mic.listening, mic.transcript]);

  const pendingVoice = useRef(false);

  useEffect(() => {
    if (mic.listening) {
      pendingVoice.current = true;
      return;
    }

    if (pendingVoice.current) {
      pendingVoice.current = false;

      const spoken = mic.transcript.trim();

      if (spoken) {
        setMicTranscript("");
        send(spoken);
      }
    }
  }, [mic.listening, mic.transcript, setMicTranscript, send]);

  /*
   * ---------------------------------------------------------
   * Latest assistant answer
   * ---------------------------------------------------------
   */

  const lastAssistantText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];

      if (message?.role !== "assistant") {
        continue;
      }

      const body = message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");

      if (body.trim()) {
        return body;
      }
    }

    return "";
  }, [messages]);

  const spokenRef = useRef("");

  useEffect(() => {
    if (!settings.voice.autoPlay || busy || !lastAssistantText) {
      return;
    }

    if (spokenRef.current === lastAssistantText) {
      return;
    }

    spokenRef.current = lastAssistantText;

    speech.speak(lastAssistantText);
  }, [settings.voice.autoPlay, busy, lastAssistantText, speech]);

  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === "assistant") {
        return messages[i]!.id;
      }
    }

    return null;
  }, [messages]);

  const retry = useCallback(
    (messageId: string) => {
      if (busy) return;

      speech.stop();
      spokenRef.current = "";

      track("mitra_ai_retry");

      void regenerate({
        messageId,
      });
    },
    [busy, regenerate, speech],
  );

  /*
   * ---------------------------------------------------------
   * Status
   * ---------------------------------------------------------
   */

  const voiceStatus = speech.error
    ? speech.error
    : mic.listening
      ? copy.listening[lang]
      : speech.speaking
        ? copy.speaking[lang]
        : mic.failed
          ? copy.micFailed[lang]
          : mic.supported
            ? copy.micIdle[lang]
            : copy.micUnsupported[lang];

  const hasBottomNav = pathname !== "/" && !pathname.startsWith("/admin");

  const keyboardOpen = keyboardInset > 0;

  const hideOrb = keyboardOpen || (open && !isDesktop);

  const mobilePanelStyle = viewportHeight
    ? {
        height: `${viewportHeight}px`,
      }
    : undefined;

  if (pathname.startsWith("/admin") || flag?.enabled === false) {
    return null;
  }

  return (
    <>
      {/*
       * =====================================================
       * CLOSED DESKTOP ORB
       * =====================================================
       */}

      {!open && (
        <button
          type="button"
          onClick={(event) => {
            if (orbDragRef.current.moved) {
              orbDragRef.current.moved = false;
              event.preventDefault();
              return;
            }

            openMitra();
          }}
          onPointerDown={simplifyMotion ? undefined : handleOrbPointerDown}
          onPointerMove={simplifyMotion ? undefined : handleOrbPointerMove}
          onPointerUp={simplifyMotion ? undefined : handleOrbPointerUp}
          aria-label={copy.open[lang]}
          aria-expanded={false}
          aria-hidden={hideOrb}
          tabIndex={hideOrb ? -1 : 0}
          style={
            orbPosition
              ? {
                  left: `${orbPosition.x}px`,
                  top: `${orbPosition.y}px`,
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
            simplifyMotion ? "" : "hover:scale-105 active:scale-95",
            hideOrb ? "pointer-events-none scale-90 opacity-0" : "opacity-100",
          ].join(" ")}
        >
          <span className="relative grid size-full place-items-center overflow-hidden rounded-full border-2 border-primary/80 bg-card ring-1 ring-white/20">
            <img
              src={mitraFarmerMascot}
              alt="Mitra AI Farmer Assistant"
              draggable={false}
              className="size-full select-none object-cover object-center"
            />
          </span>
        </button>
      )}

      {/*
       * =====================================================
       * DESKTOP PANEL
       * =====================================================
       */}

      {open && isDesktop && panelPosition && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.title[lang]}
          style={{
            left: `${panelPosition.x}px`,
            top: `${panelPosition.y}px`,
          }}
          className={[
            "fixed z-50",
            "h-[min(720px,82vh)] w-[520px]",
            "transition-[opacity,transform] duration-300 ease-out",
            panelReady
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-3 scale-[0.985] opacity-0",
          ].join(" ")}
        >
          <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] border border-black/10 bg-[#fcfcfa] shadow-[0_28px_90px_-38px_rgba(22,36,28,0.7)] dark:border-white/10 dark:bg-[#111512]">

            <header
              onPointerDown={handlePanelPointerDown}
              onPointerMove={handlePanelPointerMove}
              onPointerUp={handlePanelPointerUp}
              className="relative flex shrink-0 cursor-grab touch-none select-none items-center gap-3 border-b border-border/60 px-5 py-3.5 active:cursor-grabbing"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-[14px] border border-black/8 bg-[#eef3ec]">
                <img src={mitraFarmerMascot} alt="" className="size-full object-cover" />
              </div>

              <div className="relative min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-[15px] font-bold tracking-[-0.01em]">
                    {copy.title[lang]}
                  </p>

                  <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-primary">
                    <span className="size-1.5 rounded-full bg-primary shadow-[0_0_7px_hsl(var(--primary))]" />
                    {copy.online[lang]}
                  </span>
                </div>

                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {location?.place ? location.place : copy.subtitle[lang]}
                </p>
              </div>

              <div className="relative flex items-center gap-1">
                <div
                  className="mr-1 hidden items-center gap-1 text-muted-foreground/40 xl:flex"
                  title={copy.dragHint[lang]}
                >
                  <GripHorizontal className="size-4" />
                </div>

                <button
                  type="button"
                  onClick={closeMitra}
                  aria-label={copy.close[lang]}
                  className="press grid size-9 place-items-center rounded-full border border-border/60 bg-background/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </header>

            {diagnosisCtx?.condition && (
              <div className="mx-3 mt-3 flex shrink-0 items-center gap-2.5 rounded-2xl border border-primary/15 bg-primary/[0.055] px-3 py-2.5">
                <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10">
                  <Stethoscope className="size-4 text-primary" />
                </div>

                <p className="min-w-0 truncate text-[11px] leading-relaxed">
                  <span className="font-semibold text-foreground">{copy.contextLabel[lang]}</span>

                  <span className="mx-1.5 text-muted-foreground">·</span>

                  {diagnosisCtx.crop ? `${diagnosisCtx.crop} — ` : ""}

                  {diagnosisCtx.condition}

                  {diagnosisCtx.confidence ? ` (${diagnosisCtx.confidence}%)` : ""}
                </p>
              </div>
            )}

            <Conversation className="min-h-0 flex-1">
              <ConversationContent className="gap-6 px-5 py-6">
                {messages.length === 0 && (
                  <div className="flex min-h-full flex-col justify-center pb-1">
                    <div className="mb-6 overflow-hidden border-b border-border/70 pb-6">
                      <div className="grid grid-cols-[1fr_112px] items-end gap-4">
                        <div>
                          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                            {location?.place ?? copy.subtitle[lang]}
                          </p>
                          <h2 className="max-w-[330px] font-display text-[32px] font-semibold leading-[1.08] tracking-[-0.045em] text-foreground">
                            {welcomeGreeting}
                          </h2>
                          <p className="mt-3 max-w-[320px] text-[13px] leading-[1.65] text-muted-foreground">
                            {copy.greetingSmall[lang]}
                          </p>
                        </div>
                        <div className="relative h-[112px] overflow-hidden rounded-[18px] border border-primary/15 bg-[#edf2e9]">
                          <img src={mitraFarmerMascot} alt="" className="size-full object-cover object-center" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {suggestions[lang].map(({ icon: Icon, title, text: suggestionText }, index) => (
                        <button
                          key={`${title}-${suggestionText}`}
                          type="button"
                          onClick={() => send(suggestionText)}
                          className={[
                            "group relative min-h-[82px] text-left transition-[background-color,border-color,transform] duration-200 active:scale-[0.99]",
                            index === 0
                              ? "col-span-2 grid grid-cols-[44px_1fr_auto] items-center gap-3 border-y border-primary/20 bg-primary/[0.055] px-4 py-3"
                              : "rounded-[10px] border border-border/70 bg-card px-3 py-3 hover:border-primary/25 hover:bg-primary/[0.025]",
                          ].join(" ")}
                        >
                          <span className={`${index === 0 ? "grid size-11 place-items-center bg-primary text-primary-foreground" : "mb-2.5 grid size-8 place-items-center bg-primary/[0.09] text-primary"} rounded-[9px]`}>
                            <Icon className="size-4" strokeWidth={1.8} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[13px] font-semibold text-foreground">{title}</span>
                            <span className="mt-1 block line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{suggestionText}</span>
                          </span>
                          <ArrowUpRight className={`${index === 0 ? "" : "absolute right-3 top-3"} size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5`} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => {
                  const body = message.parts
                    .map((part) => (part.type === "text" ? part.text : ""))
                    .join("");

                  if (!body.trim()) {
                    return null;
                  }

                  const isAssistant = message.role === "assistant";

                  return (
                    <Message from={message.role} key={message.id}>
                      {isAssistant && (
                        <div className="mb-1 flex items-center gap-1.5 px-1">
                          <span className="grid size-5 place-items-center rounded-md bg-primary/10">
                            <MitraMark size="sm" className="text-primary" />
                          </span>

                          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                            Mitra
                          </span>
                        </div>
                      )}

                      <MessageContent
                        className={
                          isAssistant
                            ? "w-full px-0 text-[15px] leading-[1.72] text-foreground [&_table]:text-xs [&_table]:leading-relaxed"
                            : "rounded-[14px] bg-[#edf2eb] px-4 py-3 text-[14px] leading-[1.55] text-[#1b2b20] shadow-none dark:bg-white/[0.07] dark:text-foreground"
                        }
                      >
                        <MessageResponse>{body}</MessageResponse>
                      </MessageContent>

                      {isAssistant && message.id === lastAssistantId && !busy && (
                        <button
                          type="button"
                          onClick={() => retry(message.id)}
                          aria-label={copy.retry[lang]}
                          className="press ml-1 mt-1 flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                        >
                          <RefreshCw className="size-3" />
                          {copy.retry[lang]}
                        </button>
                      )}
                    </Message>
                  );
                })}

                {busy && (
                  <div className="flex items-center gap-3 px-1">
                    <div className="relative grid size-8 place-items-center rounded-xl bg-primary/8">
                      <span className="absolute inset-0 rounded-xl bg-primary/10 animate-pulse" />

                      <MitraMark size="sm" className="text-primary" />
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-card/40 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Shimmer className="text-[12px]">{copy.thinking[lang]}</Shimmer>

                        <div className="flex gap-0.5">
                          <span className="size-1 animate-pulse rounded-full bg-primary/50" />
                          <span className="[animation-delay:120ms] size-1 animate-pulse rounded-full bg-primary/50" />
                          <span className="[animation-delay:240ms] size-1 animate-pulse rounded-full bg-primary/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && !busy && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.045] px-3.5 py-3">
                    <p className="text-sm leading-relaxed text-destructive">{copy.error[lang]}</p>

                    {lastAssistantId && (
                      <button
                        type="button"
                        onClick={() => retry(lastAssistantId)}
                        className="press mt-2 flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-[10px] font-semibold"
                      >
                        <RefreshCw className="size-3" />
                        {copy.retry[lang]}
                      </button>
                    )}
                  </div>
                )}
              </ConversationContent>

              <ConversationScrollButton />
            </Conversation>

            <div className="shrink-0 border-t border-border/60 bg-[#f8f8f5]/95 px-4 py-3 dark:bg-[#111512]/95">
              <div className="mb-2 flex min-h-5 items-center gap-2 px-1">
                {mic.listening || speech.speaking ? (
                  <div className="flex items-center gap-2">
                    <div className="flex h-4 items-end gap-0.5">
                      <span
                        className="w-0.5 rounded-full bg-primary animate-pulse"
                        style={{ height: "45%" }}
                      />
                      <span
                        className="w-0.5 rounded-full bg-primary animate-pulse"
                        style={{ height: "85%", animationDelay: "100ms" }}
                      />
                      <span
                        className="w-0.5 rounded-full bg-primary animate-pulse"
                        style={{ height: "60%", animationDelay: "180ms" }}
                      />
                      <span
                        className="w-0.5 rounded-full bg-primary animate-pulse"
                        style={{ height: "95%", animationDelay: "260ms" }}
                      />
                    </div>

                    <p className="text-[10px] font-medium text-primary">{voiceStatus}</p>
                  </div>
                ) : (
                  <p className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground">
                    {voiceStatus}
                  </p>
                )}

                {mic.listening && (
                  <button
                    type="button"
                    onClick={mic.cancel}
                    aria-label={copy.cancelMic[lang]}
                    className="press grid size-7 place-items-center rounded-full border border-border/60 bg-background/60 text-muted-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}

                {lastAssistantText && !mic.listening && (
                  <button
                    type="button"
                    onClick={() =>
                      speech.speaking ? speech.stop() : speech.speak(lastAssistantText)
                    }
                    aria-label={speech.speaking ? copy.stopSpeak[lang] : copy.replay[lang]}
                    className="press grid size-7 place-items-center rounded-full border border-border/60 bg-background/60 text-foreground"
                  >
                    {speech.speaking ? (
                      <VolumeX className="size-3.5" />
                    ) : spokenRef.current === lastAssistantText ? (
                      <RotateCcw className="size-3.5" />
                    ) : (
                      <Volume2 className="size-3.5" />
                    )}
                  </button>
                )}
              </div>

              <PromptInput
                className="rounded-[16px] border border-border bg-background px-1.5 py-1.5 shadow-[0_8px_28px_-18px_rgba(0,0,0,0.55)] transition-[border-color,box-shadow] focus-within:border-primary/40 focus-within:shadow-[0_10px_30px_-18px_rgba(22,101,52,0.45)]"
                onSubmit={(_message, event) => {
                  event.preventDefault();
                  send(text);
                }}
              >
                <PromptInputTextarea
                  ref={inputRef}
                  value={text}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    if (value.trim()) preloadResponseRenderer();
                    setText(value);
                  }}
                  placeholder={copy.placeholder[lang]}
                  className="min-h-11 resize-none px-3 py-2 text-[14px]"
                />

                <PromptInputFooter className="justify-end gap-1.5">
                  <button
                    type="button"
                    disabled={!mic.supported}
                    onClick={() => (mic.listening ? mic.stop() : mic.start())}
                    aria-label={mic.listening ? copy.stopMic[lang] : copy.mic[lang]}
                    className={[
                      "press relative grid size-9 shrink-0 place-items-center rounded-[11px] border transition-all",
                      "disabled:opacity-40",
                      mic.listening
                        ? "border-primary/40 bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.25)]"
                        : "border-border/70 bg-background/70 text-foreground hover:border-primary/30 hover:bg-primary/5",
                    ].join(" ")}
                  >
                    {mic.listening && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                    )}

                    {mic.listening ? (
                      <Square className="relative size-4" strokeWidth={2.4} />
                    ) : (
                      <Mic className="relative size-4" strokeWidth={2.2} />
                    )}
                  </button>

                  <PromptInputSubmit className="size-9 rounded-[11px]" status={status} disabled={!text.trim() && !busy} />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>
        </div>
      )}

      {/*
       * =====================================================
       * MOBILE FULL-SCREEN PANEL
       * =====================================================
       */}

      {open && !isDesktop && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.title[lang]}
          style={mobilePanelStyle}
          className={[
            "fixed inset-0 z-[70]",
            "h-[100dvh]",
            "bg-background",
            "transition-[opacity,transform] duration-300 ease-out",
            panelReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          ].join(" ")}
        >
          <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
            <header className="relative flex shrink-0 items-center gap-3 border-b border-border/60 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <button
                type="button"
                onClick={closeMitra}
                aria-label={copy.close[lang]}
                className="press relative grid size-11 shrink-0 place-items-center rounded-full bg-muted/60"
              >
                <ChevronLeft className="size-5" />
              </button>

              <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-card">
                <img src={mitraFarmerMascot} alt="" className="size-full object-cover" />
              </div>

              <div className="relative min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-sm font-bold">{copy.title[lang]}</p>

                  <span className="flex items-center gap-1 text-[9px] font-semibold text-primary">
                    <span className="size-1.5 rounded-full bg-primary shadow-[0_0_7px_hsl(var(--primary))]" />
                    {copy.online[lang]}
                  </span>
                </div>

                <p className="truncate text-[10px] text-muted-foreground">
                  {location?.place || copy.subtitle[lang]}
                </p>
              </div>
            </header>

            {diagnosisCtx?.condition && (
              <div className="mx-3 mt-3 flex shrink-0 items-center gap-2.5 rounded-2xl border border-primary/15 bg-primary/[0.055] px-3 py-2.5">
                <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10">
                  <Stethoscope className="size-4 text-primary" />
                </div>

                <p className="min-w-0 truncate text-[11px]">
                  <span className="font-semibold">{copy.contextLabel[lang]}</span>

                  <span className="mx-1.5 text-muted-foreground">·</span>

                  {diagnosisCtx.crop ? `${diagnosisCtx.crop} — ` : ""}

                  {diagnosisCtx.condition}
                </p>
              </div>
            )}

            <Conversation className="min-h-0 flex-1">
              <ConversationContent className="gap-6 px-4 py-5">
                {messages.length === 0 && (
                  <div className="flex min-h-full flex-col justify-center pb-3">
                    <div className="mb-5 border-b border-border/70 pb-5">
                      <div className="grid grid-cols-[1fr_88px] items-end gap-3">
                        <div>
                          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-primary">
                            {location?.place ?? copy.subtitle[lang]}
                          </p>
                          <h2 className="font-display text-[27px] font-semibold leading-[1.08] tracking-[-0.04em]">
                            {welcomeGreeting}
                          </h2>
                          <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
                            {copy.greetingSmall[lang]}
                          </p>
                        </div>
                        <div className="h-[88px] overflow-hidden rounded-[14px] border border-primary/15 bg-[#edf2e9]">
                          <img src={mitraFarmerMascot} alt="" className="size-full object-cover" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {suggestions[lang].map(({ icon: Icon, title, text: suggestionText }, index) => (
                        <button
                          key={`${title}-${suggestionText}`}
                          type="button"
                          onClick={() => send(suggestionText)}
                          className={[
                            "group relative min-h-[78px] text-left active:scale-[0.99]",
                            index === 0
                              ? "col-span-2 flex items-center gap-3 border-y border-primary/20 bg-primary/[0.055] px-3 py-2.5"
                              : "rounded-[10px] border border-border/70 bg-card px-3 py-2.5",
                          ].join(" ")}
                        >
                          <span className={`${index === 0 ? "grid size-10 place-items-center bg-primary text-primary-foreground" : "mb-2 grid size-8 place-items-center bg-primary/[0.09] text-primary"} shrink-0 rounded-[9px]`}>
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[12px] font-semibold">{title}</span>
                            <span className="mt-1 block line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                            {suggestionText}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => {
                  const body = message.parts
                    .map((part) => (part.type === "text" ? part.text : ""))
                    .join("");

                  if (!body.trim()) {
                    return null;
                  }

                  const isAssistant = message.role === "assistant";

                  return (
                    <Message from={message.role} key={message.id}>
                      {isAssistant && (
                        <div className="mb-1 flex items-center gap-1.5 px-1">
                          <span className="grid size-5 place-items-center rounded-md bg-primary/10">
                            <Leaf className="size-3 text-primary" strokeWidth={2} />
                          </span>

                          <span className="text-[10px] font-semibold text-muted-foreground">
                            Mitra
                          </span>
                        </div>
                      )}

                      <MessageContent
                        className={
                          isAssistant
                            ? "w-full px-0 text-[15px] leading-[1.72] text-foreground [&_table]:text-xs [&_table]:leading-relaxed"
                            : "rounded-[14px] bg-[#edf2eb] px-4 py-3 text-[14px] leading-[1.55] text-[#1b2b20] dark:bg-white/[0.07] dark:text-foreground"
                        }
                      >
                        <MessageResponse>{body}</MessageResponse>
                      </MessageContent>

                      {isAssistant && message.id === lastAssistantId && !busy && (
                        <button
                          type="button"
                          onClick={() => retry(message.id)}
                          className="press ml-1 mt-1 flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground"
                        >
                          <RefreshCw className="size-3" />
                          {copy.retry[lang]}
                        </button>
                      )}
                    </Message>
                  );
                })}

                {busy && (
                  <div className="flex items-center gap-3 px-1">
                    <div className="relative grid size-8 place-items-center rounded-xl bg-primary/8">
                      <span className="absolute inset-0 rounded-xl bg-primary/10 animate-pulse" />

                      <MitraMark size="sm" className="text-primary" />
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-card/40 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Shimmer className="text-[12px]">{copy.thinking[lang]}</Shimmer>

                        <div className="flex gap-0.5">
                          <span className="size-1 animate-pulse rounded-full bg-primary/50" />
                          <span className="[animation-delay:120ms] size-1 animate-pulse rounded-full bg-primary/50" />
                          <span className="[animation-delay:240ms] size-1 animate-pulse rounded-full bg-primary/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && !busy && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.045] px-3.5 py-3">
                    <p className="text-sm text-destructive">{copy.error[lang]}</p>

                    {lastAssistantId && (
                      <button
                        type="button"
                        onClick={() => retry(lastAssistantId)}
                        className="press mt-2 flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-[10px] font-semibold"
                      >
                        <RefreshCw className="size-3" />
                        {copy.retry[lang]}
                      </button>
                    )}
                  </div>
                )}
              </ConversationContent>

              <ConversationScrollButton />
            </Conversation>

            <div className="shrink-0 border-t border-border/60 bg-[#f8f8f5]/95 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] dark:bg-[#111512]/95">
              <div className="mb-2 flex min-h-5 items-center gap-2 px-1">
                {mic.listening || speech.speaking ? (
                  <div className="flex items-center gap-2">
                    <div className="flex h-4 items-end gap-0.5">
                      <span
                        className="w-0.5 rounded-full bg-primary animate-pulse"
                        style={{ height: "45%" }}
                      />
                      <span
                        className="w-0.5 rounded-full bg-primary animate-pulse"
                        style={{ height: "85%", animationDelay: "100ms" }}
                      />
                      <span
                        className="w-0.5 rounded-full bg-primary animate-pulse"
                        style={{ height: "60%", animationDelay: "180ms" }}
                      />
                      <span
                        className="w-0.5 rounded-full bg-primary animate-pulse"
                        style={{ height: "95%", animationDelay: "260ms" }}
                      />
                    </div>

                    <p className="text-[10px] font-medium text-primary">{voiceStatus}</p>
                  </div>
                ) : (
                  <p className="flex-1 truncate text-[10px] text-muted-foreground">{voiceStatus}</p>
                )}

                {mic.listening && (
                  <button
                    type="button"
                    onClick={mic.cancel}
                    aria-label={copy.cancelMic[lang]}
                    className="press grid size-7 place-items-center rounded-full border border-border/60"
                  >
                    <X className="size-3.5" />
                  </button>
                )}

                {lastAssistantText && !mic.listening && (
                  <button
                    type="button"
                    onClick={() =>
                      speech.speaking ? speech.stop() : speech.speak(lastAssistantText)
                    }
                    aria-label={speech.speaking ? copy.stopSpeak[lang] : copy.replay[lang]}
                    className="press grid size-7 place-items-center rounded-full border border-border/60"
                  >
                    {speech.speaking ? (
                      <VolumeX className="size-3.5" />
                    ) : spokenRef.current === lastAssistantText ? (
                      <RotateCcw className="size-3.5" />
                    ) : (
                      <Volume2 className="size-3.5" />
                    )}
                  </button>
                )}
              </div>

              <PromptInput
                className="rounded-[15px] border border-border bg-background px-1.5 py-1.5 shadow-[0_8px_28px_-18px_rgba(0,0,0,0.55)] focus-within:border-primary/40"
                onSubmit={(_message, event) => {
                  event.preventDefault();
                  send(text);
                }}
              >
                <PromptInputTextarea
                  ref={inputRef}
                  value={text}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    if (value.trim()) preloadResponseRenderer();
                    setText(value);
                  }}
                  placeholder={copy.placeholder[lang]}
                  className="min-h-11 resize-none px-3 py-2 text-[14px]"
                />

                <PromptInputFooter className="justify-end gap-1.5">
                  <button
                    type="button"
                    disabled={!mic.supported}
                    onClick={() => (mic.listening ? mic.stop() : mic.start())}
                    aria-label={mic.listening ? copy.stopMic[lang] : copy.mic[lang]}
                    className={[
                      "press relative grid size-9 shrink-0 place-items-center rounded-[11px] border",
                      mic.listening
                        ? "border-primary/40 bg-primary text-primary-foreground"
                        : "border-border/70 bg-background/70",
                    ].join(" ")}
                  >
                    {mic.listening && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                    )}

                    {mic.listening ? (
                      <Square className="relative size-4" />
                    ) : (
                      <Mic className="relative size-4" />
                    )}
                  </button>

                  <PromptInputSubmit className="size-9 rounded-[11px]" status={status} disabled={!text.trim() && !busy} />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
