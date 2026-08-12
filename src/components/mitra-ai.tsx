import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Leaf, X, Sprout, CloudSun, Landmark, Stethoscope } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
import { useLang } from "@/lib/i18n";
import { useLocationContext } from "@/lib/location";

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

/** Premium floating assistant available on every screen. */
export function MitraAI() {
  const { lang } = useLang();
  const { location } = useLocationContext();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages: msgs }) => ({
        body: {
          messages: msgs,
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

  // Keep the composer focused during normal chat use.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 220);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (open && status === "ready") inputRef.current?.focus();
  }, [open, status]);

  const send = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setText("");
    void sendMessage({ text: trimmed });
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <>
      {/* Floating orb */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={copy.open[lang]}
        className="press fixed bottom-24 right-4 z-50 grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] ring-1 ring-primary-foreground/20 transition-transform hover:scale-105 lg:bottom-8 lg:right-8 lg:size-16"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/25" />
        {open ? (
          <X className="relative size-6" strokeWidth={2.4} />
        ) : (
          <Leaf className="relative size-7" strokeWidth={2.2} />
        )}
      </button>

      {open && (
        <div className="fixed inset-x-2 bottom-24 z-50 lg:inset-x-auto lg:bottom-28 lg:right-8 lg:w-[420px]">
          <div className="glass flex h-[70vh] max-h-[620px] flex-col overflow-hidden rounded-3xl border border-border/70 bg-background/95 shadow-[var(--shadow-card)] backdrop-blur-2xl lg:h-[600px]">
            <header className="flex items-center gap-3 border-b border-border/60 bg-card/70 px-4 py-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Leaf className="size-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold">{copy.title[lang]}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {location?.place ? location.place : copy.subtitle[lang]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={copy.close[lang]}
                className="press ml-auto grid size-8 place-items-center rounded-full bg-muted text-muted-foreground"
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
                    </Message>
                  );
                })}

                {busy && <Shimmer className="px-1 text-sm">{copy.thinking[lang]}</Shimmer>}
                {error && <p className="text-sm text-destructive">{copy.error[lang]}</p>}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="border-t border-border/60 bg-card/70 p-3">
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
                <PromptInputFooter className="justify-end">
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
