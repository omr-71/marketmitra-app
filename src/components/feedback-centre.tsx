import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bug, CheckCircle2, Loader2, MessageSquareHeart, Send } from "lucide-react";
import { ADMIN_FEEDBACK_CATEGORIES, submitUserFeedback } from "@/lib/admin.functions";

type FeedbackType = "share_feedback" | "report_problem";

const feedbackOptions: {
  type: FeedbackType;
  title: string;
  description: string;
  Icon: typeof MessageSquareHeart;
}[] = [
  {
    type: "share_feedback",
    title: "Share Feedback",
    description: "Share an idea, suggestion or experience.",
    Icon: MessageSquareHeart,
  },
  {
    type: "report_problem",
    title: "Report a Problem",
    description: "Tell us if something isn't working correctly.",
    Icon: Bug,
  },
];

export function FeedbackCentre() {
  const submitFeedback = useServerFn(submitUserFeedback);
  const submitLock = useRef(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFeedbackType(null);
    setCategory("");
    setCustomCategory("");
    setSubject("");
    setMessage("");
    setSubmitted(false);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!feedbackType || submitLock.current) return;

    submitLock.current = true;
    setSubmitting(true);
    setError(null);

    try {
      await submitFeedback({
        data: {
          feedbackType,
          category,
          customCategory,
          subject,
          message,
          pageContext: window.location.pathname,
        },
      });
      setSubmitted(true);
    } catch {
      setError("We couldn't send your feedback. Please try again.");
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="feedback-centre-title"
      className="rounded-[2rem] border border-border/70 bg-card/80 p-5 shadow-[0_12px_36px_-28px_rgba(27,65,43,0.35)] sm:p-7"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Your voice matters
        </p>
        <h2
          id="feedback-centre-title"
          className="mt-2 font-display text-2xl font-extrabold sm:text-3xl"
        >
          We&apos;d love your feedback
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your thoughts help us make MarketMitra better for every farmer.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {feedbackOptions.map(({ type, title, description, Icon }) => {
          const selected = feedbackType === type;
          return (
            <button
              key={type}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                if (feedbackType !== type) {
                  setCategory("");
                  setCustomCategory("");
                  setSubject("");
                  setMessage("");
                }
                setFeedbackType(type);
                setSubmitted(false);
                setError(null);
              }}
              className={`group flex min-h-24 items-center gap-4 rounded-2xl border p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                selected
                  ? "border-primary/45 bg-primary/[0.07] shadow-sm"
                  : "border-border/70 bg-background/70 hover:border-primary/30 hover:bg-primary/[0.03]"
              }`}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">{title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {feedbackType && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-border/70 bg-background/75">
          {submitted ? (
            <div className="px-5 py-8 text-center sm:px-8">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-extrabold">
                Thank you for helping us improve MarketMitra.
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your feedback has been received successfully.
              </p>
              <button
                type="button"
                onClick={reset}
                className="press mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
              >
                Submit another response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">
                    {feedbackType === "share_feedback"
                      ? "Share your thoughts"
                      : "Tell us what went wrong"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Required fields are marked with an asterisk.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setFeedbackType(null);
                    setError(null);
                  }}
                  className="min-h-10 shrink-0 rounded-xl px-3 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"
                >
                  Change type
                </button>
              </div>

              <label className="block">
                <span className="text-xs font-semibold">
                  Category <span aria-hidden="true">*</span>
                </span>
                <select
                  required
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    if (event.target.value !== "Custom Category") {
                      setCustomCategory("");
                    }
                  }}
                  className="mt-1.5 h-12 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                >
                  <option value="" disabled>
                    Choose a category
                  </option>
                  {ADMIN_FEEDBACK_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              {category === "Custom Category" && (
                <label className="block">
                  <span className="text-xs font-semibold">
                    Your category <span aria-hidden="true">*</span>
                  </span>
                  <input
                    required
                    maxLength={80}
                    value={customCategory}
                    onChange={(event) => setCustomCategory(event.target.value)}
                    placeholder="What would you like to share?"
                    className="mt-1.5 h-12 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                  />
                </label>
              )}

              <label className="block">
                <span className="text-xs font-semibold">
                  Subject <span aria-hidden="true">*</span>
                </span>
                <input
                  required
                  maxLength={160}
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="A short summary"
                  className="mt-1.5 h-12 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold">
                  Detailed description <span aria-hidden="true">*</span>
                </span>
                <textarea
                  required
                  minLength={1}
                  maxLength={4000}
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us a little more. The details help us understand how we can improve."
                  className="mt-1.5 min-h-32 w-full resize-y rounded-xl border border-border bg-card px-3 py-3 text-sm leading-relaxed outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                />
                <span className="mt-1 block text-right text-[11px] text-muted-foreground">
                  {message.length}/4000
                </span>
              </label>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="press inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-44"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Send feedback
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
