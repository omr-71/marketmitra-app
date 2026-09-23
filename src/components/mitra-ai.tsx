import { useChat } from "@ai-sdk/react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import {
  Leaf,
  ChevronLeft,
  X,
  Sprout,
  CloudSun,
  Landmark,
  Stethoscope,
  Mic,
  Square,
  Volume2,
  VolumeX,
  RotateCcw,
  RefreshCw,
  Sparkles,
  ArrowUp,
  Grip,
  MapPin,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
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
import {
  createThread,
  loadLatestThread,
  saveMessage,
  titleThread,
} from "@/lib/chat-history";

const copy = {
  title: {
    en: "Mitra AI",
    mr: "मित्र AI",
    hi: "मित्र AI",
  },

  subtitle: {
    en: "Agriculture Intelligence",
    mr: "शेतीसाठी बुद्धिमान मदत",
    hi: "खेती के लिए बुद्धिमान मदद",
  },

  greeting: {
    en: "Hello. I’m Mitra.",
    mr: "नमस्कार. मी मित्र.",
    hi: "नमस्ते. मैं मित्र हूँ.",
  },

  greetingSub: {
    en: "Ask me anything about your farm, markets, weather or schemes.",
    mr: "तुमच्या शेती, बाजारभाव, हवामान किंवा योजनांबद्दल काहीही विचारा.",
    hi: "अपनी खेती, मंडी भाव, मौसम या योजनाओं के बारे में कुछ भी पूछें.",
  },

  contextLabel: {
    en: "Recent crop check",
    mr: "अलीकडील पीक तपासणी",
    hi: "हाल की फसल जाँच",
  },

  placeholder: {
    en: "Ask Mitra anything...",
    mr: "मित्रला काहीही विचारा...",
    hi: "मित्र से कुछ भी पूछें...",
  },

  thinking: {
    en: "Mitra is thinking...",
    mr: "मित्र विचार करत आहे...",
    hi: "मित्र सोच रहा है...",
  },

  online: {
    en: "Mitra is ready",
    mr: "मित्र तयार आहे",
    hi: "मित्र तैयार है",
  },

  open: {
    en: "Open Mitra AI",
    mr: "मित्र AI उघडा",
    hi: "मित्र AI खोलें",
  },

  close: {
    en: "Close Mitra AI",
    mr: "मित्र AI बंद करा",
    hi: "मित्र AI बंद करें",
  },

  error: {
    en: "Mitra couldn't answer just now. Please try again.",
    mr: "मित्र आत्ता उत्तर देऊ शकला नाही. पुन्हा प्रयत्न करा.",
    hi: "मित्र अभी जवाब नहीं दे सका। फिर से कोशिश करें.",
  },

  listening: {
    en: "Listening...",
    mr: "ऐकत आहे...",
    hi: "सुन रहा है...",
  },

  speaking: {
    en: "Speaking...",
    mr: "बोलत आहे...",
    hi: "बोल रहा है...",
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
    en: "Retry",
    mr: "पुन्हा प्रयत्न",
    hi: "फिर से कोशिश",
  },

  replay: {
    en: "Replay answer",
    mr: "उत्तर पुन्हा ऐका",
    hi: "उत्तर फिर से सुनें",
  },

  micUnsupported: {
    en: "Voice input isn't available here. You can type instead.",
    mr: "या ब्राउझरमध्ये आवाज उपलब्ध नाही. तुम्ही टाइप करू शकता.",
    hi: "इस ब्राउज़र में आवाज़ उपलब्ध नहीं है। आप टाइप कर सकते हैं.",
  },

  micFailed: {
    en: "Could not hear that. Try again or type your question.",
    mr: "ते ऐकू आले नाही. पुन्हा प्रयत्न करा किंवा प्रश्न टाइप करा.",
    hi: "सुनाई नहीं दिया। फिर से कोशिश करें या सवाल टाइप करें.",
  },

  drag: {
    en: "Drag Mitra",
    mr: "मित्र हलवा",
    hi: "मित्र को खींचें",
  },
} as const;

const suggestions = {
  en: [
    {
      icon: Sprout,
      label: "Markets",
      text: "Best mandi for my onion today?",
    },
    {
      icon: CloudSun,
      label: "Weather",
      text: "Is it safe to spray this week?",
    },
    {
      icon: Landmark,
      label: "Schemes",
      text: "Which government schemes can help me?",
    },
    {
      icon: Stethoscope,
      label: "Crop care",
      text: "My leaves have yellow spots",
    },
  ],

  mr: [
    {
      icon: Sprout,
      label: "बाजार",
      text: "आज कांद्यासाठी सर्वोत्तम बाजार कोणता?",
    },
    {
      icon: CloudSun,
      label: "हवामान",
      text: "या आठवड्यात फवारणी सुरक्षित आहे का?",
    },
    {
      icon: Landmark,
      label: "योजना",
      text: "मला कोणत्या सरकारी योजना उपयोगी पडतील?",
    },
    {
      icon: Stethoscope,
      label: "पीक काळजी",
      text: "पानांवर पिवळे डाग आले आहेत",
    },
  ],

  hi: [
    {
      icon: Sprout,
      label: "मंडी",
      text: "आज प्याज के लिए सबसे अच्छा बाजार कौन सा है?",
    },
    {
      icon: CloudSun,
      label: "मौसम",
      text: "क्या इस हफ्ते छिड़काव करना सुरक्षित है?",
    },
    {
      icon: Landmark,
      label: "योजनाएँ",
      text: "मेरे लिए कौन सी सरकारी योजनाएँ उपयोगी हैं?",
    },
    {
      icon: Stethoscope,
      label: "फसल देखभाल",
      text: "मेरी पत्तियों पर पीले धब्बे हैं",
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
      const inset = Math.max(
        0,
        window.innerHeight - vv.height - vv.offsetTop,
      );

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
    const mq = window.matchMedia("(min-width: 1024px)");

    const update = () => setDesktop(mq.matches);

    update();

    mq.addEventListener("change", update);

    return () => mq.removeEventListener("change", update);
  }, []);

  return desktop;
}

type OrbPosition = {
  x: number;
  y: number;
};

const POSITION_KEY = "market-mitra:mitra-ai-orb-position";

function getDefaultOrbPosition(): OrbPosition {
  return {
    x: 0,
    y: 0,
  };
}

function getSavedOrbPosition(): OrbPosition {
  if (typeof window === "undefined") {
    return getDefaultOrbPosition();
  }

  try {
    const saved = window.localStorage.getItem(POSITION_KEY);

    if (!saved) {
      return getDefaultOrbPosition();
    }

    const parsed = JSON.parse(saved) as OrbPosition;

    if (
      typeof parsed.x !== "number" ||
      typeof parsed.y !== "number"
    ) {
      return getDefaultOrbPosition();
    }

    return parsed;
  } catch {
    return getDefaultOrbPosition();
  }
}

function getGreeting(lang: keyof typeof copy.greeting) {
  const hour = new Date().getHours();

  if (lang === "mr") {
    if (hour < 12) return "शुभ सकाळ. मी मित्र.";
    if (hour < 17) return "नमस्कार. मी मित्र.";
    return "शुभ संध्याकाळ. मी मित्र.";
  }

  if (lang === "hi") {
    if (hour < 12) return "सुप्रभात. मैं मित्र हूँ.";
    if (hour < 17) return "नमस्ते. मैं मित्र हूँ.";
    return "शुभ संध्या. मैं मित्र हूँ.";
  }

  if (hour < 12) return "Good morning. I’m Mitra.";
  if (hour < 17) return "Hello. I’m Mitra.";
  return "Good evening. I’m Mitra.";
}

export function MitraAI() {
  const { lang } = useLang();
  const { location } = useLocationContext();
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const flag = useFeature("mitra_ai");

  const [open, setOpen] = useState(false);
  const [orbPosition, setOrbPosition] = useState<OrbPosition>(
    getSavedOrbPosition,
  );

  const [dragging, setDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const orbRef = useRef<HTMLButtonElement | null>(null);

  const [text, setText] = useState("");

  const { user } = useAuth();

  const conversationIdRef = useRef<string | null>(null);
  const savedIdsRef = useRef<Set<string>>(new Set());

  const { inset: keyboardInset, height: viewportHeight } =
    useKeyboardInset();

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

  const { messages, setMessages, sendMessage, regenerate, status, error } =
    useChat({
      transport: new DefaultChatTransport({
        api: "/api/chat",

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

            diagnosis: diagnosisCtx,
          },
        }),
      }),
    });

  const busy =
    status === "submitted" ||
    status === "streaming";

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

        savedIdsRef.current = new Set(
          thread.messages.map((m) => m.id),
        );

        setMessages(thread.messages);
      } catch (cause) {
        console.error(
          "Unable to load your saved chat",
          cause,
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, setMessages]);

  useEffect(() => {
    if (!user || busy || messages.length === 0) return;

    let cancelled = false;

    void (async () => {
      for (const message of messages) {
        if (cancelled) return;

        if (
          message.role !== "user" &&
          message.role !== "assistant"
        ) {
          continue;
        }

        if (savedIdsRef.current.has(message.id)) {
          continue;
        }

        try {
          if (!conversationIdRef.current) {
            conversationIdRef.current =
              await createThread(user.id, lang);
          }

          await saveMessage({
            conversationId: conversationIdRef.current,
            userId: user.id,
            role: message.role,
            message,
          });

          savedIdsRef.current.add(message.id);

          if (message.role === "user") {
            await titleThread(
              conversationIdRef.current,
              message,
            );
          }
        } catch (cause) {
          console.error(
            "Unable to save this message",
            cause,
          );

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

  useEffect(() => {
    if (!open) return;

    const id = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (open && status === "ready") {
      inputRef.current?.focus();
    }
  }, [open, status]);

  /*
   * Voice
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

  const speech = useMitraSpeech(
    voicePrefs,
    resolveLang(settings.voice.lang, lang),
  );

  const mic = useSpeechRecognition(lang);

  const send = useCallback(
    (value: string) => {
      const trimmed = value.trim();

      if (!trimmed || busy) return;

      setText("");

      speech.stop();

      track("mitra_ai_message");

      void sendMessage({
        text: trimmed,
      });

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    [busy, sendMessage, speech],
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
        mic.setTranscript("");
        send(spoken);
      }
    }
  }, [
    mic.listening,
    mic.transcript,
    mic.setTranscript,
    send,
  ]);

  const lastAssistantText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];

      if (message?.role !== "assistant") continue;

      const body = message.parts
        .map((part) =>
          part.type === "text" ? part.text : "",
        )
        .join("");

      if (body.trim()) return body;
    }

    return "";
  }, [messages]);

  const spokenRef = useRef("");

  useEffect(() => {
    if (
      !settings.voice.autoPlay ||
      busy ||
      !lastAssistantText
    ) {
      return;
    }

    if (spokenRef.current === lastAssistantText) {
      return;
    }

    spokenRef.current = lastAssistantText;

    speech.speak(lastAssistantText);
  }, [
    settings.voice.autoPlay,
    busy,
    lastAssistantText,
    speech,
  ]);

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

  const voiceStatus = speech.error
    ? speech.error
    : mic.listening
      ? copy.listening[lang]
      : speech.speaking
        ? copy.speaking[lang]
        : mic.failed
          ? copy.micFailed[lang]
          : mic.supported
            ? copy.online[lang]
            : copy.micUnsupported[lang];

  /*
   * Smart draggable orb
   */

  const hasBottomNav =
    pathname !== "/" &&
    !pathname.startsWith("/admin");

  const keyboardOpen = keyboardInset > 0;

  const baseBottom =
    hasBottomNav && !keyboardOpen
      ? 100
      : 24;

  const orbHidden =
    (keyboardOpen && !open) ||
    (open && !isDesktop);

  const clampOrbPosition = useCallback(
    (position: OrbPosition): OrbPosition => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const size = isDesktop ? 64 : 56;

      const margin = 12;

      const maxX =
        Math.max(0, width - size - margin * 2);

      const maxY =
        Math.max(0, height - size - margin * 2);

      return {
        x: Math.max(
          -maxX / 2,
          Math.min(maxX / 2, position.x),
        ),

        y: Math.max(
          -maxY / 2,
          Math.min(maxY / 2, position.y),
        ),
      };
    },
    [isDesktop],
  );

  const snapOrb = useCallback(
    (position: OrbPosition) => {
      const width = window.innerWidth;

      const threshold = width * 0.22;

      const currentRight =
        width - 32 + position.x;

      let x = position.x;

      if (currentRight < threshold) {
        x = -(width / 2 - 48);
      } else if (
        width - currentRight <
        threshold
      ) {
        x = width / 2 - 48;
      }

      const clamped = clampOrbPosition({
        x,
        y: position.y,
      });

      setOrbPosition(clamped);

      try {
        window.localStorage.setItem(
          POSITION_KEY,
          JSON.stringify(clamped),
        );
      } catch {
        // Ignore localStorage failures.
      }
    },
    [clampOrbPosition],
  );

  const handleOrbPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    if (open) return;

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

    setDragging(true);
    setHasMoved(false);

    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: orbPosition.x,
      startY: orbPosition.y,
    };
  };

  const handleOrbPointerMove = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    if (!dragStartRef.current || open) return;

    const dx =
      event.clientX -
      dragStartRef.current.pointerX;

    const dy =
      event.clientY -
      dragStartRef.current.pointerY;

    if (
      Math.abs(dx) > 4 ||
      Math.abs(dy) > 4
    ) {
      setHasMoved(true);
    }

    setOrbPosition(
      clampOrbPosition({
        x: dragStartRef.current.startX + dx,
        y: dragStartRef.current.startY + dy,
      }),
    );
  };

  const handleOrbPointerUp = () => {
    if (!dragStartRef.current) return;

    const moved = hasMoved;

    dragStartRef.current = null;
    setDragging(false);

    snapOrb(orbPosition);

    if (!moved) {
      setOpen(true);
      track("mitra_ai_opened");
    }
  };

  useEffect(() => {
    const onResize = () => {
      setOrbPosition((current) =>
        clampOrbPosition(current),
      );
    };

    window.addEventListener("resize", onResize);

    return () =>
      window.removeEventListener(
        "resize",
        onResize,
      );
  }, [clampOrbPosition]);

  /*
   * Panel positioning
   */

  const panelMaxHeight = viewportHeight
    ? `${Math.max(
        280,
        viewportHeight -
          keyboardInset -
          90,
      )}px`
    : undefined;

  if (
    pathname.startsWith("/admin") ||
    flag?.enabled === false
  ) {
    return null;
  }

  return (
    <>
      {/* =========================================================
          PREMIUM FLOATING MITRA ORB
      ========================================================= */}

      <button
        ref={orbRef}
        type="button"
        onPointerDown={handleOrbPointerDown}
        onPointerMove={handleOrbPointerMove}
        onPointerUp={handleOrbPointerUp}
        onPointerCancel={() => {
          dragStartRef.current = null;
          setDragging(false);
        }}
        aria-label={
          open
            ? copy.close[lang]
            : copy.open[lang]
        }
        aria-expanded={open}
        aria-hidden={orbHidden}
        tabIndex={orbHidden ? -1 : 0}
        title={copy.drag[lang]}
        style={{
          bottom: `calc(env(safe-area-inset-bottom, 0px) + ${baseBottom}px + ${Math.max(
            0,
            keyboardInset,
          )}px)`,

          transform: `translate(${orbPosition.x}px, ${orbPosition.y}px)`,
        }}
        className={[
          "group fixed right-5 z-[60]",
          "grid size-14 place-items-center",
          "touch-none select-none",
          "lg:right-8 lg:size-16",
          "transition-[opacity,scale,box-shadow]",
          "duration-300",
          dragging
            ? "scale-110 cursor-grabbing"
            : "cursor-grab",
          orbHidden
            ? "pointer-events-none scale-75 opacity-0"
            : "opacity-100",
        ].join(" ")}
      >
        {/* Ambient glow */}

        <span
          className={[
            "absolute -inset-3 rounded-full",
            "bg-primary/20 blur-xl",
            "transition-all duration-500",
            dragging
              ? "scale-125 opacity-100"
              : "scale-90 opacity-70",
          ].join(" ")}
        />

        {/* Outer ring */}

        <span
          className={[
            "absolute inset-0 rounded-full",
            "border border-primary/30",
            "bg-primary/10",
            "backdrop-blur-md",
            "transition-transform duration-500",
            "group-hover:scale-110",
          ].join(" ")}
        />

        {/* Animated orbit */}

        <span
          className={[
            "absolute -inset-1 rounded-full",
            "border border-primary/20",
            dragging
              ? "animate-spin"
              : "animate-[spin_8s_linear_infinite]",
          ].join(" ")}
        />

        {/* Main orb */}

        <span
          className={[
            "relative grid size-12 place-items-center",
            "rounded-full",
            "border border-white/20",
            "bg-gradient-to-br",
            "from-primary via-primary/90 to-primary/70",
            "text-primary-foreground",
            "shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.65)]",
            "transition-all duration-300",
            "lg:size-14",
            dragging
              ? "scale-95"
              : "group-hover:scale-105",
          ].join(" ")}
        >
          <span className="absolute inset-[2px] rounded-full bg-white/10" />

          {open ? (
            <X
              className="relative size-5 lg:size-6"
              strokeWidth={2.2}
            />
          ) : (
            <Leaf
              className="relative size-6 lg:size-7"
              strokeWidth={2}
            />
          )}
        </span>

        {/* Tiny live indicator */}

        {!open && (
          <span className="absolute bottom-0.5 right-0.5 grid size-4 place-items-center rounded-full border-2 border-background bg-emerald-500">
            <span className="size-1.5 rounded-full bg-white" />
          </span>
        )}
      </button>

      {/* =========================================================
          CHAT WINDOW
      ========================================================= */}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.title[lang]}
          style={
            isDesktop
              ? {
                  bottom: `calc(env(safe-area-inset-bottom, 0px) + ${baseBottom + 76}px)`,
                  maxHeight: panelMaxHeight,
                }
              : viewportHeight
                ? {
                    height: `${viewportHeight}px`,
                  }
                : undefined
          }
          className={[
            "fixed inset-0 z-[55]",
            "h-[100dvh]",
            "lg:inset-auto",
            "lg:right-8",
            "lg:h-[min(700px,78vh)]",
            "lg:w-[460px]",
          ].join(" ")}
        >
          <div
            className={[
              "relative flex h-full min-h-0 flex-col",
              "overflow-hidden",
              "bg-background/95",
              "shadow-[0_30px_100px_-25px_hsl(var(--foreground)/0.35)]",
              "backdrop-blur-2xl",

              "lg:rounded-[28px]",
              "lg:border",
              "lg:border-border/60",
              "lg:bg-background/90",
            ].join(" ")}
          >
            {/* Decorative background atmosphere */}

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.08),transparent_38%)]" />
            </div>

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="relative shrink-0 border-b border-white/10 bg-gradient-to-br from-primary via-primary/95 to-primary/80 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-primary-foreground lg:rounded-t-[28px] lg:pt-4">
              <div className="flex items-center gap-3">
                {/* Mobile back */}

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={copy.close[lang]}
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 transition-all active:scale-95 lg:hidden"
                >
                  <ChevronLeft
                    className="size-5"
                    strokeWidth={2.2}
                  />
                </button>

                {/* Brand mark */}

                <div className="relative grid size-11 shrink-0 place-items-center rounded-[16px] border border-white/20 bg-white/10 shadow-inner backdrop-blur-md">
                  <span className="absolute inset-1 rounded-[12px] border border-white/10" />

                  <Leaf
                    className="relative size-5"
                    strokeWidth={2}
                  />

                  <span className="absolute bottom-1.5 right-1.5 size-1.5 rounded-full bg-emerald-300" />
                </div>

                {/* Brand text */}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-base font-bold tracking-tight">
                      {copy.title[lang]}
                    </p>

                    <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/80">
                      Intelligence
                    </span>
                  </div>

                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-white/65">
                    <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" />

                    {location?.place ||
                      copy.subtitle[lang]}
                  </p>
                </div>

                {/* Desktop close */}

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={copy.close[lang]}
                  className="hidden size-9 place-items-center rounded-full border border-white/10 bg-white/10 transition-all hover:bg-white/15 active:scale-95 lg:grid"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Header status */}

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-white/60">
                  <ShieldCheck className="size-3.5" />
                  <span>{copy.online[lang]}</span>
                </div>

                {location?.district && (
                  <div className="flex items-center gap-1 text-[10px] text-white/55">
                    <MapPin className="size-3" />
                    <span className="max-w-[130px] truncate">
                      {location.district}
                    </span>
                  </div>
                )}
              </div>
            </header>

            {/* =====================================================
                DIAGNOSIS CONTEXT
            ===================================================== */}

            {diagnosisCtx?.condition && (
              <div className="relative mx-3 mt-3 overflow-hidden rounded-2xl border border-primary/15 bg-primary/[0.055]">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Stethoscope className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-primary">
                      {copy.contextLabel[lang]}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] font-medium text-foreground/80">
                      {diagnosisCtx.crop
                        ? `${diagnosisCtx.crop} · `
                        : ""}
                      {diagnosisCtx.condition}
                    </p>
                  </div>

                  {diagnosisCtx.confidence && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary">
                      {diagnosisCtx.confidence}%
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* =====================================================
                CONVERSATION
            ===================================================== */}

            <Conversation className="relative min-h-0 flex-1">
              <ConversationContent className="gap-4 px-4 py-5">
                {/* Premium welcome */}

                {messages.length === 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <div className="mb-5">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="relative grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                          <Sparkles className="size-5" />

                          <span className="absolute inset-0 rounded-2xl border border-primary/15" />
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/70">
                            Mitra Intelligence
                          </p>

                          <p className="text-[11px] text-muted-foreground">
                            {copy.online[lang]}
                          </p>
                        </div>
                      </div>

                      <h2 className="font-display text-[25px] font-bold tracking-tight text-foreground">
                        {getGreeting(lang)}
                      </h2>

                      <p className="mt-2 max-w-[360px] text-[13px] leading-relaxed text-muted-foreground">
                        {copy.greetingSub[lang]}
                      </p>
                    </div>

                    {/* Suggestion cards */}

                    <div className="grid gap-2">
                      {suggestions[lang].map(
                        (
                          {
                            icon: Icon,
                            label,
                            text: suggestion,
                          },
                          index,
                        ) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() =>
                              send(suggestion)
                            }
                            style={{
                              animationDelay: `${index * 55}ms`,
                            }}
                            className={[
                              "group relative flex items-center gap-3",
                              "overflow-hidden rounded-[18px]",
                              "border border-border/60",
                              "bg-card/55",
                              "px-3.5 py-3",
                              "text-left",
                              "transition-all duration-300",
                              "hover:-translate-y-0.5",
                              "hover:border-primary/30",
                              "hover:bg-primary/[0.045]",
                              "hover:shadow-[0_12px_30px_-20px_hsl(var(--primary)/0.45)]",
                              "active:scale-[0.985]",
                              "animate-in fade-in slide-in-from-bottom-2",
                            ].join(" ")}
                          >
                            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary transition-transform duration-300 group-hover:scale-110">
                              <Icon
                                className="size-4"
                                strokeWidth={2}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.13em] text-primary/65">
                                {label}
                              </p>

                              <p className="text-[12px] font-semibold leading-snug text-foreground/85">
                                {suggestion}
                              </p>
                            </div>

                            <ArrowUp
                              className="size-4 shrink-0 rotate-45 text-muted-foreground/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                            />
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Messages */}

                {messages.map((message) => {
                  const body = message.parts
                    .map((part) =>
                      part.type === "text"
                        ? part.text
                        : "",
                    )
                    .join("");

                  if (!body.trim()) return null;

                  const isUser =
                    message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                      <Message
                        from={message.role}
                      >
                        <MessageContent
                          className={
                            isUser
                              ? [
                                  "rounded-[20px]",
                                  "bg-primary",
                                  "px-4 py-3",
                                  "text-primary-foreground",
                                  "shadow-[0_8px_25px_-16px_hsl(var(--primary))]",
                                ].join(" ")
                              : [
                                  "bg-transparent",
                                  "px-0",
                                  "text-foreground",
                                ].join(" ")
                          }
                        >
                          {!isUser && (
                            <div className="mb-2 flex items-center gap-2">
                              <div className="grid size-6 place-items-center rounded-lg bg-primary/10 text-primary">
                                <Leaf
                                  className="size-3.5"
                                  strokeWidth={2}
                                />
                              </div>

                              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary/65">
                                Mitra
                              </span>
                            </div>
                          )}

                          <MessageResponse>
                            {body}
                          </MessageResponse>
                        </MessageContent>

                        {message.role ===
                          "assistant" &&
                          message.id ===
                            lastAssistantId &&
                          !busy && (
                            <button
                              type="button"
                              onClick={() =>
                                retry(message.id)
                              }
                              aria-label={
                                copy.retry[lang]
                              }
                              className="mt-1.5 flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:text-primary active:scale-95"
                            >
                              <RefreshCw
                                className="size-3"
                                strokeWidth={2.2}
                              />
                              {copy.retry[lang]}
                            </button>
                          )}
                      </Message>
                    </div>
                  );
                })}

                {/* Thinking state */}

                {busy && (
                  <div className="flex items-center gap-2.5 animate-in fade-in duration-200">
                    <div className="grid size-7 place-items-center rounded-xl bg-primary/10">
                      <Sparkles className="size-3.5 animate-pulse text-primary" />
                    </div>

                    <Shimmer className="text-[12px]">
                      {copy.thinking[lang]}
                    </Shimmer>
                  </div>
                )}

                {/* Error */}

                {error && !busy && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 space-y-2 rounded-2xl border border-destructive/20 bg-destructive/[0.055] px-3.5 py-3">
                    <div className="flex items-start gap-2.5">
                      <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive">
                        <RefreshCw className="size-3.5" />
                      </div>

                      <p className="text-[12px] leading-relaxed text-destructive">
                        {copy.error[lang]}
                      </p>
                    </div>

                    {lastAssistantId && (
                      <button
                        type="button"
                        onClick={() =>
                          retry(lastAssistantId)
                        }
                        className="ml-9 flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-[10px] font-semibold text-foreground transition-all active:scale-95"
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

            {/* =====================================================
                COMPOSER
            ===================================================== */}

            <div className="relative shrink-0 border-t border-border/50 bg-card/75 p-3 backdrop-blur-xl pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:rounded-b-[28px] lg:pb-3">
              {/* Voice / status */}

              <div className="mb-2 flex min-h-6 items-center gap-2 px-1">
                <div
                  className={[
                    "grid size-5 place-items-center rounded-full",
                    mic.listening
                      ? "bg-primary/15 text-primary"
                      : speech.speaking
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {mic.listening ? (
                    <Mic className="size-2.5" />
                  ) : speech.speaking ? (
                    <Volume2 className="size-2.5" />
                  ) : (
                    <MessageCircle className="size-2.5" />
                  )}
                </div>

                <p className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground">
                  {voiceStatus}
                </p>

                {lastAssistantText &&
                  !mic.listening && (
                    <button
                      type="button"
                      onClick={() =>
                        speech.speaking
                          ? speech.stop()
                          : speech.speak(
                              lastAssistantText,
                            )
                      }
                      aria-label={
                        speech.speaking
                          ? copy.stopSpeak[lang]
                          : copy.replay[lang]
                      }
                      className="grid size-7 place-items-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-all hover:text-primary active:scale-95"
                    >
                      {speech.speaking ? (
                        <VolumeX className="size-3.5" />
                      ) : spokenRef.current ===
                        lastAssistantText ? (
                        <RotateCcw className="size-3.5" />
                      ) : (
                        <Volume2 className="size-3.5" />
                      )}
                    </button>
                  )}

                {mic.listening && (
                  <button
                    type="button"
                    onClick={mic.cancel}
                    aria-label={
                      copy.cancelMic[lang]
                    }
                    className="grid size-7 place-items-center rounded-full border border-border/60 bg-background/60 text-muted-foreground active:scale-95"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <PromptInput
                onSubmit={(_message, event) => {
                  event.preventDefault();
                  send(text);
                }}
              >
                <div className="rounded-[20px] border border-border/70 bg-background/75 p-1.5 shadow-[0_8px_30px_-25px_hsl(var(--foreground)/0.4)] transition-all focus-within:border-primary/35 focus-within:shadow-[0_12px_35px_-25px_hsl(var(--primary)/0.45)]">
                  <PromptInputTextarea
                    ref={inputRef}
                    value={text}
                    onChange={(event) =>
                      setText(
                        event.currentTarget.value,
                      )
                    }
                    placeholder={
                      copy.placeholder[lang]
                    }
                    className="min-h-[44px] border-0 bg-transparent px-3 pt-3 text-[13px] shadow-none focus:ring-0"
                  />

                  <PromptInputFooter className="justify-between gap-1.5 px-1 pb-1">
                    <button
                      type="button"
                      disabled={!mic.supported}
                      onClick={() =>
                        mic.listening
                          ? mic.stop()
                          : mic.start()
                      }
                      aria-label={
                        mic.listening
                          ? copy.stopMic[lang]
                          : copy.mic[lang]
                      }
                      className={[
                        "relative grid size-9 shrink-0",
                        "place-items-center rounded-full",
                        "border transition-all",
                        "disabled:opacity-35",
                        "active:scale-90",
                        mic.listening
                          ? "border-primary/40 bg-primary text-primary-foreground"
                          : "border-border/60 bg-background/70 text-muted-foreground hover:border-primary/30 hover:text-primary",
                      ].join(" ")}
                    >
                      {mic.listening && (
                        <>
                          <span className="absolute inset-0 animate-ping rounded-full bg-primary/25" />
                          <span className="absolute inset-1 rounded-full border border-white/15" />
                        </>
                      )}

                      {mic.listening ? (
                        <Square
                          className="relative size-3.5"
                          strokeWidth={2.4}
                        />
                      ) : (
                        <Mic
                          className="relative size-4"
                          strokeWidth={2.2}
                        />
                      )}
                    </button>

                    <PromptInputSubmit
                      status={status}
                      disabled={!text.trim() && !busy}
                      className="size-9 rounded-full"
                    />
                  </PromptInputFooter>
                </div>
              </PromptInput>

              {/* Tiny product signature */}

              <div className="mt-2 flex items-center justify-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.16em] text-muted-foreground/40">
                <Leaf className="size-2.5" />
                <span>Market Mitra</span>
                <span>·</span>
                <span>Sell Smarter. Earn Better.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}