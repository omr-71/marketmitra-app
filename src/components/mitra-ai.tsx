import { useChat } from "@ai-sdk/react";
import { useRouterState } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
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
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";


import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
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
import { resolveLang, useSettings } from "@/lib/settings";
import { useSpeech, useSpeechRecognition } from "@/lib/voice";


const CHAT_STORAGE_KEY = "mm-mitra-chat";

/** Session-scoped chat memory: survives closing the panel, cleared with the tab. */
function loadSavedMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UIMessage[];
    return Array.isArray(parsed) ? parsed.slice(-40) : [];
  } catch {
    return [];
  }
}

const copy = {
  title: { en: "Mitra AI", mr: "मित्र AI", hi: "मित्र AI" },
  subtitle: {
    en: "Your farming companion",
    mr: "तुमचा शेती सहकारी",
    hi: "आपका खेती साथी",
  },
  greeting: {
    en: "Namaste 🙏 Ask me about mandi prices, weather, crop care or government schemes.",
    mr: "नमस्कार 🙏 बाजारभाव, हवामान, पीक काळजी किंवा शासकीय योजनांबद्दल विचारा.",
    hi: "नमस्ते 🙏 मंडी भाव, मौसम, फसल देखभाल या सरकारी योजनाओं के बारे में पूछें.",
  },
  placeholder: {
    en: "Ask Mitra AI…",
    mr: "मित्र AI ला विचारा…",
    hi: "मित्र AI से पूछें…",
  },
  thinking: { en: "Mitra is thinking…", mr: "मित्र विचार करत आहे…", hi: "मित्र सोच रहा है…" },
  open: { en: "Open Mitra AI", mr: "मित्र AI उघडा", hi: "मित्र AI खोलें" },
  close: { en: "Close", mr: "बंद करा", hi: "बंद करें" },
  error: {
    en: "Mitra could not answer just now. Please try again.",
    mr: "मित्र आत्ता उत्तर देऊ शकला नाही. पुन्हा प्रयत्न करा.",
    hi: "मित्र अभी उत्तर नहीं दे सका. दोबारा कोशिश करें.",
  },
  micIdle: {
    en: "Tap the microphone and ask Mitra.",
    mr: "माइक दाबा आणि मित्रला विचारा.",
    hi: "माइक दबाएँ और मित्र से पूछें.",
  },
  listening: { en: "Listening…", mr: "ऐकत आहे…", hi: "सुन रहा है…" },
  speaking: { en: "Speaking…", mr: "बोलत आहे…", hi: "बोल रहा है…" },
  mic: { en: "Speak", mr: "बोला", hi: "बोलें" },
  stopMic: { en: "Stop recording", mr: "रेकॉर्डिंग थांबवा", hi: "रिकॉर्डिंग रोकें" },
  cancelMic: { en: "Cancel", mr: "रद्द करा", hi: "रद्द करें" },
  stopSpeak: { en: "Stop speaking", mr: "बोलणे थांबवा", hi: "बोलना रोकें" },
  retry: { en: "Retry", mr: "पुन्हा", hi: "फिर से" },
  replay: { en: "Replay answer", mr: "उत्तर पुन्हा ऐका", hi: "उत्तर दोबारा सुनें" },
  voiceSettings: { en: "Voice settings", mr: "आवाज सेटिंग", hi: "आवाज़ सेटिंग" },
  voiceType: { en: "Voice", mr: "आवाज", hi: "आवाज़" },
  female: { en: "Female", mr: "स्त्री", hi: "महिला" },
  male: { en: "Male", mr: "पुरुष", hi: "पुरुष" },
  speed: { en: "Speed", mr: "वेग", hi: "गति" },
  autoSpeak: { en: "Speak answers aloud", mr: "उत्तरे मोठ्याने वाचा", hi: "उत्तर बोलकर सुनाएँ" },
  micUnsupported: {
    en: "Voice input is not available on this browser. You can type instead.",
    mr: "या ब्राउझरवर आवाज इनपुट उपलब्ध नाही. तुम्ही टाइप करू शकता.",
    hi: "इस ब्राउज़र में आवाज़ इनपुट उपलब्ध नहीं है. आप टाइप कर सकते हैं.",
  },
  micFailed: {
    en: "Could not hear that. Please try again or type your question.",
    mr: "ऐकू आले नाही. पुन्हा प्रयत्न करा किंवा प्रश्न टाइप करा.",
    hi: "सुनाई नहीं दिया. दोबारा कोशिश करें या प्रश्न टाइप करें.",
  },
} as const;


const suggestions = {
  en: [
    { icon: Sprout, text: "Best mandi for my onion today?" },
    { icon: CloudSun, text: "Is it safe to spray this week?" },
    { icon: Landmark, text: "Which schemes can help me?" },
    { icon: Stethoscope, text: "My leaves have yellow spots" },
  ],
  mr: [
    { icon: Sprout, text: "आज कांद्यासाठी सर्वोत्तम बाजार कोणता?" },
    { icon: CloudSun, text: "या आठवड्यात फवारणी सुरक्षित आहे का?" },
    { icon: Landmark, text: "कोणत्या योजना मला उपयोगी?" },
    { icon: Stethoscope, text: "पानांवर पिवळे डाग आले आहेत" },
  ],
  hi: [
    { icon: Sprout, text: "आज प्याज के लिए सबसे अच्छी मंडी?" },
    { icon: CloudSun, text: "इस हफ्ते छिड़काव सुरक्षित है?" },
    { icon: Landmark, text: "कौन सी योजनाएँ मेरे काम की हैं?" },
    { icon: Stethoscope, text: "पत्तों पर पीले धब्बे हैं" },
  ],
} as const;

/**
 * Tracks the on-screen keyboard inset (iOS/Android) plus the usable viewport
 * height, so the orb and panel are never hidden behind the keyboard.
 */
function useKeyboardInset() {
  const [state, setState] = useState({ inset: 0, height: 0 });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setState({ inset: inset > 80 ? Math.round(inset) : 0, height: Math.round(vv.height) });
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

/** Desktop gets an anchored conversation panel; smaller screens go full-screen. */
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


/** Premium floating assistant available on every screen. */
export function MitraAI() {
  const { lang } = useLang();
  const { location } = useLocationContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const flag = useFeature("mitra_ai");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState("");
  const initialMessages = useMemo(() => loadSavedMessages(), []);
  const { inset: keyboardInset, height: viewportHeight } = useKeyboardInset();
  const isDesktop = useIsDesktop();



  const { messages, sendMessage, regenerate, status, error } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages: msgs }) => ({
        body: {
          // Send the recent window so Mitra keeps the thread's context.
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

  // Persist the thread for this browser session only.
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      window.sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* storage full or blocked — chat still works in memory */
    }
  }, [messages]);

  useEffect(() => {
    if (error) track("mitra_ai_error");
  }, [error]);

  // Keep the composer focused during normal chat use.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 220);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (open && status === "ready") inputRef.current?.focus();
  }, [open, status]);

  /* ------------------------------------------- voice (configured in Settings) */
  const { settings } = useSettings();
  const voicePrefs = useMemo(
    () => ({
      voiceId: settings.voice.voiceId,
      rate: settings.voice.speed,
      volume: settings.voice.volume,
      expressive: settings.voice.emotional,
    }),
    [settings.voice],
  );
  const speech = useSpeech(resolveLang(settings.voice.lang, lang), voicePrefs);
  const mic = useSpeechRecognition(lang);

  const send = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || busy) return;
      setText("");
      speech.stop();
      track("mitra_ai_message");
      void sendMessage({ text: trimmed });
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [busy, sendMessage, speech],
  );

  // Mirror the live transcript into the composer, then send when speech ends.
  useEffect(() => {
    if (mic.listening && mic.transcript) setText(mic.transcript);
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
  }, [mic.listening, mic.transcript, mic.setTranscript, send]);

  const lastAssistantText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      if (m?.role !== "assistant") continue;
      const body = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
      if (body.trim()) return body;
    }
    return "";
  }, [messages]);

  // Read the finished answer aloud when the farmer asked for spoken replies.
  const spokenRef = useRef("");
  useEffect(() => {
    if (!settings.voice.autoPlay || busy || !lastAssistantText) return;
    if (spokenRef.current === lastAssistantText) return;
    spokenRef.current = lastAssistantText;
    speech.speak(lastAssistantText);
  }, [settings.voice.autoPlay, busy, lastAssistantText, speech]);

  /* Regenerate the latest answer without duplicating the farmer's question. */
  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === "assistant") return messages[i]!.id;
    }
    return null;
  }, [messages]);

  const retry = useCallback(
    (messageId: string) => {
      if (busy) return;
      speech.stop();
      spokenRef.current = "";
      track("mitra_ai_retry");
      void regenerate({ messageId });
    },
    [busy, regenerate, speech],
  );

  const voiceStatus = mic.listening
    ? copy.listening[lang]
    : speech.speaking
      ? copy.speaking[lang]
      : mic.failed
        ? copy.micFailed[lang]
        : mic.supported
          ? copy.micIdle[lang]
          : copy.micUnsupported[lang];



  // Pages rendered inside the app shell carry a mobile bottom nav; the landing
  // screen and the admin console do not. Lift the orb above whatever is there
  // and always respect the device safe area.
  const hasBottomNav = pathname !== "/" && !pathname.startsWith("/admin");
  const keyboardOpen = keyboardInset > 0;
  const baseGap = hasBottomNav && !keyboardOpen ? "6.25rem" : "1.5rem";
  // When the keyboard is up, sit above it (the bottom nav is off-screen anyway).
  const bottomOffset = `calc(env(safe-area-inset-bottom, 0px) + ${baseGap} + ${keyboardInset}px)`;

  // Never cover a focused page input: hide the orb while the keyboard is open
  // and the assistant itself is closed.
  // Never cover a focused page input, and step aside for the full-screen panel.
  const hideOrb = (keyboardOpen && !open) || (open && !isDesktop);


  // Keep the panel inside the usable viewport, keyboard included.
  const panelMaxHeight = viewportHeight
    ? `${Math.max(240, viewportHeight - keyboardInset - 96)}px`
    : undefined;

  if (pathname.startsWith("/admin") || flag?.enabled === false) return null;

  return (
    <>
      {/* Floating orb — offset so it never sits on top of navigation or CTAs */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            if (!v) track("mitra_ai_opened");
            return !v;
          });
        }}
        aria-label={copy.open[lang]}
        aria-expanded={open}
        aria-hidden={hideOrb}
        tabIndex={hideOrb ? -1 : 0}
        style={{ bottom: bottomOffset }}
        className={`press fixed right-4 z-50 grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] ring-1 ring-primary-foreground/20 transition-all duration-200 hover:scale-105 lg:right-8 lg:size-16 ${
          hideOrb ? "pointer-events-none scale-90 opacity-0" : "opacity-100"
        }`}
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/25" />
        {open ? (
          <X className="relative size-6" strokeWidth={2.4} />
        ) : (
          <Leaf className="relative size-7" strokeWidth={2.2} />
        )}
      </button>


      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.title[lang]}
          style={
            isDesktop
              ? { bottom: `calc(${bottomOffset} + 4.25rem)`, maxHeight: panelMaxHeight }
              : viewportHeight
                ? { height: `${viewportHeight}px` }
                : undefined
          }
          className="fixed inset-0 z-50 h-[100dvh] lg:inset-auto lg:right-8 lg:h-[600px] lg:max-h-[80vh] lg:w-[420px]"
        >
          <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background lg:rounded-3xl lg:border lg:border-border/70 lg:bg-background/95 lg:shadow-[var(--shadow-card)] lg:backdrop-blur-2xl">
            <header className="flex items-center gap-3 border-b border-border/60 bg-card/70 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:pt-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={copy.close[lang]}
                className="press grid size-11 shrink-0 place-items-center rounded-full bg-muted text-foreground lg:hidden"
              >
                <ChevronLeft className="size-5" strokeWidth={2.2} />
              </button>

              <span className="hidden size-10 place-items-center rounded-2xl bg-primary/15 text-primary lg:grid">
                <Leaf className="size-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold lg:text-base">{copy.title[lang]}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {location?.place ? location.place : copy.subtitle[lang]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={copy.close[lang]}
                className="press hidden size-9 place-items-center rounded-full bg-muted text-muted-foreground lg:grid"
              >
                <X className="size-4" />
              </button>
            </header>


            <Conversation className="min-h-0 flex-1">
              <ConversationContent className="gap-3 px-3 py-4">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <p className="rounded-2xl bg-primary/8 px-4 py-3 text-sm leading-relaxed">
                      {copy.greeting[lang]}
                    </p>
                    <div className="grid gap-2">
                      {suggestions[lang].map(({ icon: Icon, text: s }) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => send(s)}
                          className="press flex items-center gap-2.5 rounded-2xl border border-border/70 bg-card/60 px-3 py-2.5 text-left text-[13px] font-semibold text-foreground/90 transition-colors hover:border-primary/50 hover:text-primary"
                        >
                          <Icon className="size-4 shrink-0 text-primary" strokeWidth={2.1} />
                          <span className="min-w-0">{s}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => {
                  const body = message.parts
                    .map((part) => (part.type === "text" ? part.text : ""))
                    .join("");
                  if (!body.trim()) return null;
                  return (
                    <Message from={message.role} key={message.id}>
                      <MessageContent
                        className={
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-transparent px-0 text-foreground"
                        }
                      >
                        <MessageResponse>{body}</MessageResponse>
                      </MessageContent>
                      {message.role === "assistant" &&
                        message.id === lastAssistantId &&
                        !busy && (
                          <button
                            type="button"
                            onClick={() => retry(message.id)}
                            aria-label={copy.retry[lang]}
                            className="press flex w-fit items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                          >
                            <RefreshCw className="size-3.5" strokeWidth={2.2} />
                            {copy.retry[lang]}
                          </button>
                        )}
                    </Message>
                  );

                })}

                {busy && <Shimmer className="px-1 text-sm">{copy.thinking[lang]}</Shimmer>}
                {error && !busy && (
                  <div className="space-y-2 rounded-2xl border border-destructive/25 bg-destructive/8 px-3 py-2.5">
                    <p className="text-sm text-destructive">{copy.error[lang]}</p>
                    {lastAssistantId ? (
                      <button
                        type="button"
                        onClick={() => retry(lastAssistantId)}
                        className="press flex w-fit items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground"
                      >
                        <RefreshCw className="size-3.5" strokeWidth={2.2} />
                        {copy.retry[lang]}
                      </button>
                    ) : null}
                  </div>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="space-y-2 border-t border-border/60 bg-card/70 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-3">



              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                  {voiceStatus}
                </p>

                {mic.listening && (
                  <button
                    type="button"
                    onClick={mic.cancel}
                    aria-label={copy.cancelMic[lang]}
                    className="press grid size-9 place-items-center rounded-full border border-border/70 bg-background/70 text-muted-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}

                {speech.supported && lastAssistantText && !mic.listening && (
                  <button
                    type="button"
                    onClick={() =>
                      speech.speaking ? speech.stop() : speech.speak(lastAssistantText)
                    }
                    aria-label={speech.speaking ? copy.stopSpeak[lang] : copy.replay[lang]}
                    className="press grid size-9 place-items-center rounded-full border border-border/70 bg-background/70 text-foreground"
                  >
                    {speech.speaking ? (
                      <VolumeX className="size-4" />
                    ) : spokenRef.current === lastAssistantText ? (
                      <RotateCcw className="size-4" />
                    ) : (
                      <Volume2 className="size-4" />
                    )}
                  </button>
                )}

              </div>

              <PromptInput
                onSubmit={(_message, event) => {
                  event.preventDefault();
                  send(text);
                }}
              >
                <PromptInputTextarea
                  ref={inputRef}
                  value={text}
                  onChange={(event) => setText(event.currentTarget.value)}
                  placeholder={copy.placeholder[lang]}
                />
                <PromptInputFooter className="justify-end gap-1.5">
                  <button
                    type="button"
                    disabled={!mic.supported}
                    onClick={() => (mic.listening ? mic.stop() : mic.start())}
                    aria-label={mic.listening ? copy.stopMic[lang] : copy.mic[lang]}
                    className={`press relative grid size-9 shrink-0 place-items-center rounded-full border transition-colors disabled:opacity-40 ${
                      mic.listening
                        ? "border-primary/40 bg-primary text-primary-foreground"
                        : "border-border/70 bg-background/70 text-foreground"
                    }`}
                  >
                    {mic.listening && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                    )}
                    {mic.listening ? (
                      <Square className="relative size-4" strokeWidth={2.4} />
                    ) : (
                      <Mic className="relative size-4" strokeWidth={2.2} />
                    )}
                  </button>
                  <PromptInputSubmit status={status} disabled={!text.trim() && !busy} />
                </PromptInputFooter>
              </PromptInput>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
