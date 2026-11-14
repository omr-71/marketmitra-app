import { useChat } from "@ai-sdk/react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import {
  ArrowUpRight,
  ChevronLeft,
  CloudSun,
  CornerDownLeft,
  GripHorizontal,
  Landmark,
  Leaf,
  MapPin,
  MessageSquare,
  Mic,
  PanelLeft,
  PanelLeftClose,
  Plus,
  RefreshCw,
  RotateCcw,
  Sprout,
  Square,
  Stethoscope,
  Trash2,
  TrendingUp,
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
import { useSession } from "@/lib/session";
import {
  createThread,
  deleteThread,
  listUserConversations,
  loadLatestThread,
  loadThread,
  saveMessage,
  titleThread,
  type ChatSessionMeta,
} from "@/lib/chat-history";
import { useReducedMotion } from "@/lib/motion";
import { MitraAiLogo } from "./mitra-ai-logo";

const ORB_STORAGE_KEY = "market-mitra-mitra-orb-v2";
const PANEL_STORAGE_KEY = "market-mitra-mitra-panel-v2";
const PANEL_SIZE_STORAGE_KEY = "market-mitra-mitra-panel-size-v1";

const PANEL_DEFAULT_WIDTH = 520;
const PANEL_DEFAULT_HEIGHT = 700;
const PANEL_MIN_WIDTH = 380;
const PANEL_MIN_HEIGHT = 460;
const ORB_SIZE_DESKTOP = 64;
const ORB_SIZE_MOBILE = 56;

type Position = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
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

function getGreetingName(
  user: { user_metadata?: Record<string, unknown> } | null,
  profile?: { full_name?: string | null } | null,
) {
  if (profile?.full_name?.trim()) {
    return profile.full_name.trim().split(/\s+/)[0];
  }
  if (!user?.user_metadata) return "Om";

  const metadata = user.user_metadata;
  const candidates = [metadata["full_name"], metadata["name"], metadata["first_name"]];
  const name = candidates.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
  return name?.trim().split(/\s+/)[0] ?? "Om";
}

const suggestionChips = {
  en: [
    {
      label: "Check onion prices",
      prompt: "Check onion prices in nearby markets today",
      icon: TrendingUp,
    },
    {
      label: "Diagnose crop",
      prompt: "How can I diagnose a crop problem or disease?",
      icon: Stethoscope,
    },
    {
      label: "Weather forecast",
      prompt: "What is today's weather and spraying forecast?",
      icon: CloudSun,
    },
    {
      label: "Government schemes",
      prompt: "What government schemes are available for my farm?",
      icon: Sprout,
    },
  ],
  mr: [
    {
      label: "कांदा भाव तपासा",
      prompt: "जवळच्या बाजारातील आजचे कांदा भाव तपासा",
      icon: TrendingUp,
    },
    {
      label: "पीक रोग निदान",
      prompt: "पिकावरील रोग किंवा समस्या कशी ओळखायची?",
      icon: Stethoscope,
    },
    {
      label: "हवामान अंदाज",
      prompt: "आजचे हवामान आणि फवारणीचा अंदाज काय आहे?",
      icon: CloudSun,
    },
    {
      label: "शासकीय योजना",
      prompt: "माझ्या शेतीसाठी कोणत्या सरकारी योजना उपलब्ध आहेत?",
      icon: Sprout,
    },
  ],
  hi: [
    {
      label: "प्याज भाव देखें",
      prompt: "नजदीकी मंडी में आज प्याज के भाव देखें",
      icon: TrendingUp,
    },
    {
      label: "फसल रोग निदान",
      prompt: "फसल के रोग या समस्या की पहचान कैसे करें?",
      icon: Stethoscope,
    },
    {
      label: "मौसम पूर्वानुमान",
      prompt: "आज का मौसम और छिड़काव का पूर्वानुमान क्या है?",
      icon: CloudSun,
    },
    {
      label: "सरकारी योजनाएँ",
      prompt: "मेरे खेत के लिए कौन सी सरकारी योजनाएँ उपलब्ध हैं?",
      icon: Sprout,
    },
  ],
} as const;

function ChatHistorySidebar({
  sessions,
  currentId,
  loading,
  onSelect,
  onNewChat,
  onDelete,
  onClose,
  isMobile,
}: {
  sessions: ChatSessionMeta[];
  currentId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
}) {
  return (
    <aside
      className={
        isMobile
          ? "absolute inset-y-0 left-0 z-30 flex w-[270px] max-w-[85vw] flex-col border-r border-slate-200/80 bg-white shadow-2xl animate-in slide-in-from-left duration-200"
          : "relative flex w-56 sm:w-60 shrink-0 flex-col border-r border-slate-200/70 bg-slate-50/80 backdrop-blur-sm transition-all duration-200"
      }
    >
      {/* Top New Chat Button */}
      <div className="p-3 border-b border-slate-200/60 flex items-center gap-2">
        <button
          type="button"
          onClick={onNewChat}
          className="press flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-[0_3px_10px_rgba(16,185,129,0.3),0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(16,185,129,0.4)] active:translate-y-0"
        >
          <Plus className="size-3.5 stroke-[2.5]" />
          <span>New Chat</span>
        </button>
        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="press grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-2.5 pt-2 pb-1.5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Chat History
          </p>
          <span className="text-[10px] font-semibold text-slate-400">
            {sessions.length}
          </span>
        </div>

        {loading ? (
          <div className="space-y-2 p-2">
            <div className="h-8 rounded-xl bg-slate-200/50 animate-pulse" />
            <div className="h-8 rounded-xl bg-slate-200/50 animate-pulse" />
            <div className="h-8 rounded-xl bg-slate-200/50 animate-pulse" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 px-3 text-center">
            <MessageSquare className="mx-auto size-7 text-slate-300 stroke-[1.5]" />
            <p className="mt-2 text-xs font-medium text-slate-400">No past conversations</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Your chats will appear here</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === currentId;
            return (
              <div
                key={session.id}
                onClick={() => onSelect(session.id)}
                className={[
                  "group relative flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs transition-all cursor-pointer",
                  isActive
                    ? "!bg-white border border-emerald-500/30 text-emerald-900 font-semibold shadow-[0_2px_6px_-1px_rgba(16,185,129,0.12),0_1px_2px_rgba(0,0,0,0.04)]"
                    : "text-slate-600 hover:bg-white/90 hover:text-slate-900 hover:shadow-xs",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare
                    className={`size-3.5 shrink-0 transition-colors ${
                      isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-600"
                    }`}
                  />
                  <span className="truncate">{session.title || "Untitled Chat"}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                  }}
                  title="Delete chat"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-destructive hover:bg-red-50 transition-all"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
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

function readSize(key: string): Size | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.width !== "number" || typeof parsed?.height !== "number") {
      return null;
    }
    return {
      width: parsed.width,
      height: parsed.height,
    };
  } catch {
    return null;
  }
}

function saveSize(key: string, size: Size) {
  try {
    window.localStorage.setItem(key, JSON.stringify(size));
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

function getMaxPanelWidth(): number {
  return Math.min(840, Math.max(PANEL_MIN_WIDTH, window.innerWidth - 32));
}

function getMaxPanelHeight(): number {
  return Math.min(Math.round(window.innerHeight * 0.82), 820);
}

function getDefaultPanelSize(): Size {
  return {
    width: Math.min(PANEL_DEFAULT_WIDTH, getMaxPanelWidth()),
    height: Math.min(PANEL_DEFAULT_HEIGHT, getMaxPanelHeight()),
  };
}

function clampPanelSize(size: Size): Size {
  const maxW = getMaxPanelWidth();
  const maxH = getMaxPanelHeight();
  return {
    width: clamp(size.width, PANEL_MIN_WIDTH, maxW),
    height: clamp(size.height, PANEL_MIN_HEIGHT, maxH),
  };
}

function getDefaultPanelPosition(panelWidth = PANEL_DEFAULT_WIDTH, panelHeight = PANEL_DEFAULT_HEIGHT): Position {
  const actualHeight = Math.min(panelHeight, getMaxPanelHeight());
  const actualWidth = Math.min(panelWidth, getMaxPanelWidth());

  return {
    x: Math.max(16, window.innerWidth - actualWidth - 24),
    y: Math.max(16, window.innerHeight - actualHeight - 24),
  };
}

function clampPanelPosition(position: Position, panelWidth = PANEL_DEFAULT_WIDTH, panelHeight = PANEL_DEFAULT_HEIGHT): Position {
  const actualWidth = Math.min(panelWidth, getMaxPanelWidth());
  const actualHeight = Math.min(panelHeight, getMaxPanelHeight());

  return {
    x: clamp(position.x, 12, Math.max(12, window.innerWidth - actualWidth - 12)),
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
  const [panelSize, setPanelSize] = useState<Size>(getDefaultPanelSize);
  const [isResizing, setIsResizing] = useState(false);

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
  const { profile } = useSession();
  const greetingPeriod = getTimeGreetingPeriod();
  const greetingName = getGreetingName(user, profile);
  const localizedGreeting = copy.greetings[greetingPeriod][lang];
  const welcomeGreeting = greetingName
    ? `${localizedGreeting}, ${greetingName}.`
    : `${localizedGreeting}.`;

  const emptyGreeting =
    {
      en: `Hello, ${greetingName}. How can I help with your farm today?`,
      mr: `नमस्कार, ${greetingName}. आज तुमच्या शेतीसाठी मी काय मदत करू?`,
      hi: `नमस्ते, ${greetingName}। आज आपके खेत के लिए मैं क्या मदद करूँ?`,
    }[lang] ?? `Hello, ${greetingName}. How can I help with your farm today?`;

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionMeta[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const isDesktop = useIsDesktop();

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const next = !prev;
      if (next && isDesktop && panelSize.width < 680) {
        setPanelSize((s) => ({ ...s, width: Math.min(840, Math.max(s.width, 680)) }));
      }
      return next;
    });
  }, [isDesktop, panelSize.width]);

  const conversationIdRef = useRef<string | null>(null);

  const savedIdsRef = useRef<Set<string>>(new Set());

  const { inset: keyboardInset, height: viewportHeight } = useKeyboardInset();

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
    const savedSize = readSize(PANEL_SIZE_STORAGE_KEY);

    const initialSize = clampPanelSize(savedSize ?? getDefaultPanelSize());
    setPanelSize(initialSize);

    setPanelPosition(clampPanelPosition(savedPanel ?? getDefaultPanelPosition(initialSize.width, initialSize.height), initialSize.width, initialSize.height));

    setOrbPosition(
      clampOrbPosition(
        savedOrb ?? getDefaultOrbPosition(pathname !== "/" && !pathname.startsWith("/admin")),
      ),
    );
  }, [isDesktop, pathname]);

  useEffect(() => {
    if (!isDesktop) return;

    const handleResize = () => {
      setPanelSize((curSize) => {
        const nextSize = clampPanelSize(curSize);
        saveSize(PANEL_SIZE_STORAGE_KEY, nextSize);
        return nextSize;
      });

      setPanelPosition((current) => {
        if (!current) return current;

        const next = clampPanelPosition(current, panelSize.width, panelSize.height);

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
  }, [isDesktop, panelSize.width, panelSize.height]);

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
    }, panelSize.width, panelSize.height);

    setPanelPosition(next);
  }, [panelSize.width, panelSize.height]);

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
   * Desktop panel resize
   * ---------------------------------------------------------
   */

  const panelResizeRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originWidth: 0,
    originHeight: 0,
  });

  const handleResizePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDesktop) return;

      event.preventDefault();
      event.stopPropagation();

      panelResizeRef.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originWidth: panelSize.width,
        originHeight: panelSize.height,
      };

      setIsResizing(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [isDesktop, panelSize.width, panelSize.height],
  );

  const handleResizePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const resize = panelResizeRef.current;
    if (!resize.active || resize.pointerId !== event.pointerId) return;

    const dx = event.clientX - resize.startX;
    const dy = event.clientY - resize.startY;

    const nextSize = clampPanelSize({
      width: resize.originWidth + dx,
      height: resize.originHeight + dy,
    });

    setPanelSize(nextSize);
  }, []);

  const handleResizePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const resize = panelResizeRef.current;
      if (!resize.active || resize.pointerId !== event.pointerId) return;

      resize.active = false;
      setIsResizing(false);
      saveSize(PANEL_SIZE_STORAGE_KEY, panelSize);

      try {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      } catch {
        // Pointer capture may already be released.
      }
    },
    [panelSize],
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
   * Chat Sessions & History Management
   * ---------------------------------------------------------
   */

  const refreshSessions = useCallback(async () => {
    if (!user) {
      setSessions([]);
      return;
    }
    setLoadingSessions(true);
    try {
      const list = await listUserConversations(user.id);
      setSessions(list);
    } catch (err) {
      console.error("Unable to load chat sessions", err);
    } finally {
      setLoadingSessions(false);
    }
  }, [user]);

  useEffect(() => {
    if (open && user) {
      void refreshSessions();
    }
  }, [open, user, refreshSessions]);

  /*
   * ---------------------------------------------------------
   * Restore saved conversation
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!user) {
      conversationIdRef.current = null;
      setCurrentConversationId(null);
      savedIdsRef.current = new Set();
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const thread = await loadLatestThread(user.id);

        if (cancelled || !thread) return;

        conversationIdRef.current = thread.id;
        setCurrentConversationId(thread.id);

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
            setCurrentConversationId(conversationIdRef.current);
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
            void refreshSessions();
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
  }, [messages, busy, user, lang, refreshSessions]);

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

  const handleNewChat = useCallback(() => {
    speech.stop();
    conversationIdRef.current = null;
    setCurrentConversationId(null);
    savedIdsRef.current = new Set();
    setMessages([]);
    setText("");
    if (!isDesktop) {
      setSidebarOpen(false);
    }
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [speech, setMessages, isDesktop]);

  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      if (!user || sessionId === currentConversationId || busy) return;
      speech.stop();
      try {
        const thread = await loadThread(sessionId, user.id);
        if (!thread) return;
        conversationIdRef.current = thread.id;
        setCurrentConversationId(thread.id);
        savedIdsRef.current = new Set(thread.messages.map((m) => m.id));
        setMessages(thread.messages);
        if (!isDesktop) {
          setSidebarOpen(false);
        }
      } catch (err) {
        console.error("Unable to load chat session", err);
      }
    },
    [user, currentConversationId, busy, speech, setMessages, isDesktop],
  );

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      if (!user) return;
      try {
        await deleteThread(sessionId, user.id);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (conversationIdRef.current === sessionId) {
          handleNewChat();
        }
      } catch (err) {
        console.error("Unable to delete chat session", err);
      }
    },
    [user, handleNewChat],
  );

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
          <MitraAiLogo size="lg" pulse={false} withOrb={true} />
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
            width: `${panelSize.width}px`,
            height: `${panelSize.height}px`,
          }}
          className={[
            "fixed z-50",
            "min-w-[380px] max-w-[840px] min-h-[460px] max-h-[82vh]",
            isResizing ? "" : "transition-[opacity,transform] duration-300 ease-out",
            panelReady
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-3 scale-[0.985] opacity-0",
          ].join(" ")}
        >
          <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15),0_8px_20px_-6px_rgba(0,0,0,0.06)]">

            <header
              onPointerDown={handlePanelPointerDown}
              onPointerMove={handlePanelPointerMove}
              onPointerUp={handlePanelPointerUp}
              className="relative flex shrink-0 cursor-grab touch-none select-none items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 active:cursor-grabbing"
            >
              <button
                type="button"
                onClick={toggleSidebar}
                title={sidebarOpen ? "Hide chat history" : "Show chat history"}
                aria-label={sidebarOpen ? "Hide chat history" : "Show chat history"}
                aria-expanded={sidebarOpen}
                className="press grid size-9 place-items-center rounded-xl bg-gradient-to-b from-white to-slate-100/90 text-slate-700 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:text-emerald-700 hover:shadow-[0_4px_10px_-1px_rgba(0,0,0,0.12)] transition-all active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
              >
                {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeft className="size-4" />}
              </button>

              <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-white to-slate-50 grid place-items-center shadow-[0_3px_8px_-2px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]">
                <MitraAiLogo size="xs" pulse={false} withOrb={false} />
              </div>

              <div className="relative min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-[15px] font-bold tracking-[-0.01em] text-slate-900">
                    {copy.title[lang]}
                  </p>

                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <span className="size-1.5 rounded-full bg-emerald-600 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                    {copy.online[lang]}
                  </span>
                </div>

                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {location?.place ? location.place : copy.subtitle[lang]}
                </p>
              </div>

              <div className="relative flex items-center gap-1">
                <div
                  className="mr-1 hidden items-center gap-1 text-slate-400 xl:flex"
                  title={copy.dragHint[lang]}
                >
                  <GripHorizontal className="size-4" />
                </div>

                <button
                  type="button"
                  onClick={closeMitra}
                  aria-label={copy.close[lang]}
                  className="press grid size-9 place-items-center rounded-full bg-gradient-to-b from-white to-slate-100/90 text-slate-700 shadow-[0_3px_8px_-1px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_14px_-2px_rgba(0,0,0,0.12)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                >
                  <X className="size-4" />
                </button>
              </div>
            </header>

            <div className="relative flex flex-1 min-h-0 overflow-hidden">
              {sidebarOpen && (
                <ChatHistorySidebar
                  sessions={sessions}
                  currentId={currentConversationId}
                  loading={loadingSessions}
                  onSelect={handleSelectSession}
                  onNewChat={handleNewChat}
                  onDelete={handleDeleteSession}
                />
              )}

              <div className="flex flex-1 min-w-0 flex-col h-full overflow-hidden bg-white">
                <Conversation className="min-h-0 flex-1 bg-white">
                  <ConversationContent className="gap-6 px-5 py-6 bg-white">
                    {messages.length === 0 && (
                      <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-8 text-center my-auto">
                        <div className="relative mb-5 grid size-16 place-items-center rounded-2xl bg-gradient-to-b from-white to-slate-50 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_4px_10px_-2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] ring-1 ring-slate-100">
                          <MitraAiLogo size="md" pulse={false} withOrb={true} />
                        </div>

                        <h2 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 leading-snug max-w-md">
                          {emptyGreeting}
                        </h2>

                        <p className="mt-2.5 text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                          {copy.greetingSmall[lang]}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 max-w-lg">
                          {suggestionChips[lang].map((chip) => {
                            const Icon = chip.icon;
                            return (
                              <button
                                key={chip.label}
                                type="button"
                                onClick={() => send(chip.prompt)}
                                className="group press flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-[0_3px_8px_-1px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-800 hover:shadow-[0_8px_18px_-2px_rgba(16,185,129,0.18)] active:translate-y-0 active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
                              >
                                <span className="grid size-6 sm:size-7 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 shadow-[0_1px_3px_rgba(16,185,129,0.12)] group-hover:bg-emerald-100 transition-colors">
                                  <Icon className="size-3.5 sm:size-4" />
                                </span>
                                <span>{chip.label}</span>
                              </button>
                            );
                          })}
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
                      <MessageContent
                        className={
                          isAssistant
                            ? "rounded-2xl border border-gray-100 bg-white p-4 text-[14px] leading-[1.72] text-slate-800 shadow-md ring-1 ring-slate-900/[0.03] [&_table]:text-xs [&_table]:leading-relaxed"
                            : "rounded-2xl border border-emerald-100/80 bg-emerald-50/90 p-4 text-[14px] leading-[1.55] text-slate-900 shadow-md ring-1 ring-emerald-900/[0.03]"
                        }
                      >
                        <MessageResponse>{body}</MessageResponse>
                      </MessageContent>

                      {isAssistant && message.id === lastAssistantId && !busy && (
                        <button
                          type="button"
                          onClick={() => retry(message.id)}
                          aria-label={copy.retry[lang]}
                          className="press ml-1 mt-1 flex w-fit items-center gap-1.5 rounded-full border border-gray-200/80 bg-gradient-to-b from-white to-slate-50 px-3 py-1 text-[10px] font-bold text-slate-600 shadow-xs hover:-translate-y-0.5 hover:text-emerald-700 hover:shadow-sm transition-all"
                        >
                          <RefreshCw className="size-3" />
                          {copy.retry[lang]}
                        </button>
                      )}
                    </Message>
                  );
                })}

                {busy && (
                  <div className="flex items-start gap-2.5 px-1">
                    <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-md ring-1 ring-slate-900/[0.03]">
                      <span className="text-xs font-semibold text-slate-500">{copy.thinking[lang]}</span>
                      <div className="flex items-center gap-1">
                        <span className="size-1.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.3s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.15s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-emerald-600" />
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

            <div className="shrink-0 border-t border-slate-100 bg-white p-3 sm:p-4">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  send(text);
                }}
                className="group relative flex items-center gap-2.5 rounded-full border-0 bg-white px-3.5 py-1.5 shadow-[0_8px_20px_-3px_rgba(0,0,0,0.08),0_3px_8px_-2px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,1)] ring-1 ring-slate-900/[0.05] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_10px_-2px_rgba(0,0,0,0.05)] focus-within:-translate-y-0.5 focus-within:ring-2 focus-within:ring-emerald-600/30 focus-within:shadow-[0_12px_28px_-4px_rgba(16,185,129,0.18)]"
              >
                <textarea
                  ref={inputRef}
                  value={text}
                  rows={1}
                  onChange={(event) => {
                    const val = event.currentTarget.value;
                    if (val.trim()) preloadResponseRenderer();
                    setText(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (text.trim() && !busy) {
                        send(text);
                      }
                    }
                  }}
                  placeholder={copy.placeholder[lang]}
                  className="min-h-[38px] max-h-28 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[14px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                />

                <div className="flex shrink-0 items-center gap-1.5">
                  {/* Inline Replay / Speaker Button */}
                  {lastAssistantText && !mic.listening && (
                    <button
                      type="button"
                      onClick={() =>
                        speech.speaking ? speech.stop() : speech.speak(lastAssistantText)
                      }
                      aria-label={speech.speaking ? copy.stopSpeak[lang] : copy.replay[lang]}
                      title={speech.speaking ? copy.stopSpeak[lang] : copy.replay[lang]}
                      className="press grid size-9 place-items-center rounded-full bg-gradient-to-b from-white to-slate-100/80 text-slate-600 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 hover:text-emerald-700 hover:shadow-[0_4px_10px_-1px_rgba(0,0,0,0.12)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                    >
                      {speech.speaking ? (
                        <VolumeX className="size-4 text-emerald-600 animate-pulse" />
                      ) : spokenRef.current === lastAssistantText ? (
                        <RotateCcw className="size-4" />
                      ) : (
                        <Volume2 className="size-4" />
                      )}
                    </button>
                  )}

                  {/* Inline Microphone Voice Input */}
                  <button
                    type="button"
                    disabled={!mic.supported}
                    onClick={() => (mic.listening ? mic.stop() : mic.start())}
                    aria-label={mic.listening ? copy.stopMic[lang] : copy.mic[lang]}
                    title={mic.listening ? copy.stopMic[lang] : copy.mic[lang]}
                    className={[
                      "press relative grid size-9 place-items-center rounded-full transition-all",
                      "disabled:opacity-40",
                      mic.listening
                        ? "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.3)]"
                        : "bg-gradient-to-b from-white to-slate-100/80 text-slate-600 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:text-emerald-700 hover:shadow-[0_4px_10px_-1px_rgba(0,0,0,0.12)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]",
                    ].join(" ")}
                  >
                    {mic.listening && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
                    )}

                    {mic.listening ? (
                      <Square className="relative size-3.5 fill-current" />
                    ) : (
                      <Mic className="relative size-4" />
                    )}
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!text.trim() || busy}
                    aria-label="Send message"
                    className="press grid size-9 place-items-center rounded-full bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-[0_4px_12px_rgba(16,185,129,0.35),0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(16,185,129,0.45)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none"
                  >
                    <CornerDownLeft className="size-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Custom 3D Resize Handle (Bottom-Right Corner) */}
            <div
              onPointerDown={handleResizePointerDown}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              title="Resize window"
              className="group/resizer absolute bottom-1 right-1 z-30 flex size-5 cursor-nwse-resize touch-none select-none items-end justify-end p-0.5"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-slate-300 transition-colors group-hover/resizer:text-emerald-600"
              >
                <circle cx="8" cy="2" r="1" fill="currentColor" />
                <circle cx="8" cy="5.5" r="1" fill="currentColor" />
                <circle cx="8" cy="9" r="1" fill="currentColor" />
                <circle cx="4.5" cy="5.5" r="1" fill="currentColor" />
                <circle cx="4.5" cy="9" r="1" fill="currentColor" />
                <circle cx="1" cy="9" r="1" fill="currentColor" />
              </svg>
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
            "bg-white",
            "transition-[opacity,transform] duration-300 ease-out",
            panelReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          ].join(" ")}
        >
          <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
            <header className="relative flex shrink-0 items-center gap-2.5 border-b border-slate-100 bg-white px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <button
                type="button"
                onClick={closeMitra}
                aria-label={copy.close[lang]}
                className="press relative grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-b from-white to-slate-100/90 text-slate-700 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)]"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                title={sidebarOpen ? "Hide chat history" : "Show chat history"}
                aria-label={sidebarOpen ? "Hide chat history" : "Show chat history"}
                className="press relative grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-white to-slate-100/90 text-slate-700 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:text-emerald-700"
              >
                {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeft className="size-4" />}
              </button>

              <div className="relative size-9 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-white to-slate-50 grid place-items-center shadow-[0_2px_6px_-1px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
                <MitraAiLogo size="xs" pulse={false} withOrb={false} />
              </div>

              <div className="relative min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-sm font-bold text-slate-900">{copy.title[lang]}</p>

                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <span className="size-1.5 rounded-full bg-emerald-600 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                    {copy.online[lang]}
                  </span>
                </div>

                <p className="truncate text-[10px] text-slate-500">
                  {location?.place || copy.subtitle[lang]}
                </p>
              </div>
            </header>

            <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden bg-white">
              {sidebarOpen && (
                <>
                  <div
                    onClick={() => setSidebarOpen(false)}
                    className="absolute inset-0 z-20 bg-slate-900/30 backdrop-blur-[2px] transition-opacity"
                  />
                  <ChatHistorySidebar
                    sessions={sessions}
                    currentId={currentConversationId}
                    loading={loadingSessions}
                    onSelect={handleSelectSession}
                    onNewChat={handleNewChat}
                    onDelete={handleDeleteSession}
                    onClose={() => setSidebarOpen(false)}
                    isMobile={true}
                  />
                </>
              )}

              <Conversation className="min-h-0 flex-1 bg-white">
                <ConversationContent className="gap-4 px-4 py-5 bg-white">
                  {messages.length === 0 && (
                    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-8 text-center my-auto">
                      <div className="relative mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-b from-white to-slate-50 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] ring-1 ring-slate-100">
                        <MitraAiLogo size="sm" pulse={false} withOrb={true} />
                      </div>

                      <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug max-w-xs">
                        {emptyGreeting}
                      </h2>

                      <p className="mt-2 text-xs text-slate-500 max-w-xs leading-relaxed font-sans">
                        {copy.greetingSmall[lang]}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-sm">
                        {suggestionChips[lang].map((chip) => {
                          const Icon = chip.icon;
                          return (
                            <button
                              key={chip.label}
                              type="button"
                              onClick={() => send(chip.prompt)}
                              className="group press flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all hover:border-emerald-400 hover:text-emerald-800 active:scale-[0.98]"
                            >
                              <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                                <Icon className="size-3.5" />
                              </span>
                              <span>{chip.label}</span>
                            </button>
                          );
                        })}
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
                      <MessageContent
                        className={
                          isAssistant
                            ? "rounded-2xl border border-gray-100 bg-white p-4 text-[14px] leading-[1.72] text-slate-800 shadow-md ring-1 ring-slate-900/[0.03] [&_table]:text-xs [&_table]:leading-relaxed"
                            : "rounded-2xl border border-emerald-100/80 bg-emerald-50/90 p-4 text-[14px] leading-[1.55] text-slate-900 shadow-md ring-1 ring-emerald-900/[0.03]"
                        }
                      >
                        <MessageResponse>{body}</MessageResponse>
                      </MessageContent>

                      {isAssistant && message.id === lastAssistantId && !busy && (
                        <button
                          type="button"
                          onClick={() => retry(message.id)}
                          aria-label={copy.retry[lang]}
                          className="press ml-1 mt-1 flex w-fit items-center gap-1.5 rounded-full border border-gray-200/80 bg-gradient-to-b from-white to-slate-50 px-3 py-1 text-[10px] font-bold text-slate-600 shadow-xs hover:-translate-y-0.5 hover:text-emerald-700 hover:shadow-sm transition-all"
                        >
                          <RefreshCw className="size-3" />
                          {copy.retry[lang]}
                        </button>
                      )}
                    </Message>
                  );
                })}

                {busy && (
                  <div className="flex items-start gap-2.5 px-1">
                    <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-md ring-1 ring-slate-900/[0.03]">
                      <span className="text-xs font-semibold text-slate-500">{copy.thinking[lang]}</span>
                      <div className="flex items-center gap-1">
                        <span className="size-1.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.3s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.15s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-emerald-600" />
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

            <div className="shrink-0 border-t border-slate-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  send(text);
                }}
                className="group relative flex items-center gap-2.5 rounded-full border-0 bg-white px-3.5 py-1.5 shadow-[0_8px_20px_-3px_rgba(0,0,0,0.08),0_3px_8px_-2px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,1)] ring-1 ring-slate-900/[0.05] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_10px_-2px_rgba(0,0,0,0.05)] focus-within:-translate-y-0.5 focus-within:ring-2 focus-within:ring-emerald-600/30 focus-within:shadow-[0_12px_28px_-4px_rgba(16,185,129,0.18)]"
              >
                <textarea
                  ref={inputRef}
                  value={text}
                  rows={1}
                  onChange={(event) => {
                    const val = event.currentTarget.value;
                    if (val.trim()) preloadResponseRenderer();
                    setText(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (text.trim() && !busy) {
                        send(text);
                      }
                    }
                  }}
                  placeholder={copy.placeholder[lang]}
                  className="min-h-[38px] max-h-28 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[14px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                />

                <div className="flex shrink-0 items-center gap-1.5">
                  {/* Inline Replay / Speaker Button */}
                  {lastAssistantText && !mic.listening && (
                    <button
                      type="button"
                      onClick={() =>
                        speech.speaking ? speech.stop() : speech.speak(lastAssistantText)
                      }
                      aria-label={speech.speaking ? copy.stopSpeak[lang] : copy.replay[lang]}
                      title={speech.speaking ? copy.stopSpeak[lang] : copy.replay[lang]}
                      className="press grid size-9 place-items-center rounded-full bg-gradient-to-b from-white to-slate-100/80 text-slate-600 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 hover:text-emerald-700 hover:shadow-[0_4px_10px_-1px_rgba(0,0,0,0.12)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                    >
                      {speech.speaking ? (
                        <VolumeX className="size-4 text-emerald-600 animate-pulse" />
                      ) : spokenRef.current === lastAssistantText ? (
                        <RotateCcw className="size-4" />
                      ) : (
                        <Volume2 className="size-4" />
                      )}
                    </button>
                  )}

                  {/* Inline Microphone Voice Input */}
                  <button
                    type="button"
                    disabled={!mic.supported}
                    onClick={() => (mic.listening ? mic.stop() : mic.start())}
                    aria-label={mic.listening ? copy.stopMic[lang] : copy.mic[lang]}
                    title={mic.listening ? copy.stopMic[lang] : copy.mic[lang]}
                    className={[
                      "press relative grid size-9 place-items-center rounded-full transition-all",
                      "disabled:opacity-40",
                      mic.listening
                        ? "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.3)]"
                        : "bg-gradient-to-b from-white to-slate-100/80 text-slate-600 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:text-emerald-700 hover:shadow-[0_4px_10px_-1px_rgba(0,0,0,0.12)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]",
                    ].join(" ")}
                  >
                    {mic.listening && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
                    )}

                    {mic.listening ? (
                      <Square className="relative size-3.5 fill-current" />
                    ) : (
                      <Mic className="relative size-4" />
                    )}
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!text.trim() || busy}
                    aria-label="Send message"
                    className="press grid size-9 place-items-center rounded-full bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-[0_4px_12px_rgba(16,185,129,0.35),0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(16,185,129,0.45)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none"
                  >
                    <CornerDownLeft className="size-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
