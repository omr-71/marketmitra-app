import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Screen, TopBar } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { crops } from "@/lib/crops";
import {
  diagnoseCropImage,
  type DiagnosisResult,
} from "@/lib/diagnose.functions";
import {
  AlertTriangle,
  Camera,
  ImageIcon,
  Leaf,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";

export const Route = createFileRoute("/diagnose")({
  head: () => ({
    meta: [
      { title: "Crop disease identifier — MarketMitra" },
      {
        name: "description",
        content:
          "Photograph a leaf and get an AI reading of the visible crop condition, with farmer-friendly, label-driven guidance in English, Marathi or Hindi.",
      },
      { property: "og:title", content: "Crop disease identifier — MarketMitra" },
      {
        property: "og:description",
        content: "Camera or gallery photo, image-quality check, transparent confidence, no invented pesticide advice.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiagnosePage,
});

const L = {
  title: { en: "Crop disease identifier", mr: "पीक रोग ओळख", hi: "फ़सल रोग पहचान" },
  subtitle: {
    en: "AI reading of a real leaf photo",
    mr: "प्रत्यक्ष पानाच्या फोटोवरून AI विश्लेषण",
    hi: "असली पत्ते की फ़ोटो से AI विश्लेषण",
  },
  intro: {
    en: "Take a close-up of the affected leaf, fruit or stem in daylight. The photo is analysed by an AI vision model — it is a guide, not a lab test.",
    mr: "प्रभावित पान, फळ किंवा खोडाचा दिवसाच्या उजेडात जवळून फोटो घ्या. फोटोचे AI विश्लेषण होते — हा सल्ला आहे, प्रयोगशाळा चाचणी नाही.",
    hi: "प्रभावित पत्ता, फल या तना दिन के उजाले में नज़दीक से फ़ोटो लें. फ़ोटो का AI विश्लेषण होता है — यह मार्गदर्शन है, प्रयोगशाला जाँच नहीं.",
  },
  camera: { en: "Take photo", mr: "फोटो घ्या", hi: "फ़ोटो लें" },
  gallery: { en: "Upload from gallery", mr: "गॅलरीतून अपलोड", hi: "गैलरी से अपलोड" },
  cropHint: { en: "Crop (optional)", mr: "पीक (ऐच्छिक)", hi: "फ़सल (वैकल्पिक)" },
  notSure: { en: "Not sure", mr: "माहीत नाही", hi: "पता नहीं" },
  analyse: { en: "Analyse photo", mr: "फोटो तपासा", hi: "फ़ोटो जाँचें" },
  analysing: { en: "Analysing the photo…", mr: "फोटो तपासत आहे…", hi: "फ़ोटो जाँच रहे हैं…" },
  remove: { en: "Remove photo", mr: "फोटो काढा", hi: "फ़ोटो हटाएँ" },
  again: { en: "Analyse another photo", mr: "दुसरा फोटो तपासा", hi: "दूसरी फ़ोटो जाँचें" },
  retry: { en: "Try again", mr: "पुन्हा प्रयत्न", hi: "फिर कोशिश करें" },
  aiAnalysis: { en: "AI Analysis", mr: "AI विश्लेषण", hi: "AI विश्लेषण" },
  confidence: { en: "Confidence", mr: "विश्वास", hi: "विश्वास" },
  cropDetected: { en: "Crop detected", mr: "ओळखलेले पीक", hi: "पहचानी गई फ़सल" },
  condition: { en: "Condition detected", mr: "ओळखलेला रोग / स्थिती", hi: "पहचानी गई बीमारी / स्थिति" },
  severity: { en: "Severity", mr: "तीव्रता", hi: "गंभीरता" },
  symptoms: { en: "Visible signs", mr: "दिसणारी लक्षणे", hi: "दिखने वाले लक्षण" },
  causes: { en: "Possible causes", mr: "संभाव्य कारणे", hi: "संभावित कारण" },
  envConditions: {
    en: "Conditions that favour it",
    mr: "पोषक हवामान स्थिती",
    hi: "अनुकूल मौसम स्थितियाँ",
  },
  whatItIs: { en: "What it is", mr: "हे काय आहे", hi: "यह क्या है" },
  whyItHappens: { en: "Why it happens", mr: "हे का होते", hi: "यह क्यों होता है" },
  whatToDo: { en: "What to do now", mr: "आता काय करावे", hi: "अब क्या करें" },
  prevention: { en: "Prevention", mr: "प्रतिबंध", hi: "रोकथाम" },
  monitoring: { en: "Keep watching for", mr: "पुढे लक्ष ठेवा", hi: "आगे ध्यान रखें" },
  uncertain: { en: "Not conclusive", mr: "निश्चित नाही", hi: "निश्चित नहीं" },
  imageProblem: { en: "Photo is not clear enough", mr: "फोटो पुरेसा स्पष्ट नाही", hi: "फ़ोटो पर्याप्त स्पष्ट नहीं" },
  disclaimer: {
    en: "AI guidance only — never 100% accurate. Confirm with your local KVK or agriculture officer before spending on inputs. Use only products registered for this crop and disease, and follow the product label for dose and interval.",
    mr: "हे केवळ AI मार्गदर्शन आहे — १००% अचूक नाही. खर्च करण्यापूर्वी स्थानिक KVK किंवा कृषी अधिकाऱ्याकडून खात्री करा. या पिकासाठी नोंदणीकृत उत्पादनेच वापरा आणि मात्रा व अंतर लेबलप्रमाणे पाळा.",
    hi: "यह केवल AI मार्गदर्शन है — 100% सटीक नहीं. खर्च करने से पहले स्थानीय KVK या कृषि अधिकारी से पुष्टि करें. इस फ़सल के लिए पंजीकृत उत्पाद ही उपयोग करें और मात्रा व अंतराल लेबल के अनुसार रखें.",
  },
  pickFirst: { en: "Add a photo to start", mr: "सुरू करण्यासाठी फोटो जोडा", hi: "शुरू करने के लिए फ़ोटो जोड़ें" },
} as const;

/** Downscale in the browser so uploads stay small and fast on mobile data. */
async function toCompactDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1280;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.82);
}

function Section({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Leaf;
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="glass rounded-3xl p-4">
      <p className="flex items-center gap-2 text-sm font-bold">
        <Icon className="size-4 text-primary" />
        {title}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DiagnosePage() {
  const { lang } = useLang();
  const s = <K extends keyof typeof L>(k: K) => L[k][lang];

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [cropHint, setCropHint] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setResult(null);
    try {
      setPreview(await toCompactDataUrl(file));
    } catch {
      setError("That file could not be read as an image. Please try another photo.");
    }
  };

  const run = async () => {
    if (!preview) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const data = await diagnoseCropImage({
        data: { image: preview, lang, ...(cropHint ? { cropHint } : {}) },
      });
      setResult(data);
      if (!data.ok) setError(data.message);
    } catch {
      setError("Analysis could not be completed. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const diagnosis = result?.ok && result.usable ? result : null;

  return (
    <Screen>
      <TopBar title={s("title")} subtitle={s("subtitle")} back="/home" />

      <div className="px-5 pb-6 pt-5 lg:px-0">
        <div className="glass rounded-3xl p-4">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Stethoscope className="size-4 text-primary" />
            {s("aiAnalysis")}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s("intro")}</p>

          {preview ? (
            <div className="relative mt-4 overflow-hidden rounded-2xl border border-border/70">
              <img src={preview} alt="Crop photo to analyse" className="h-56 w-full object-cover lg:h-80" />
              <button
                type="button"
                onClick={reset}
                aria-label={s("remove")}
                className="press absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-background/85 backdrop-blur"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="mt-4 grid h-40 place-items-center rounded-2xl border border-dashed border-border/80 bg-muted/40 text-xs font-semibold text-muted-foreground">
              <span className="flex flex-col items-center gap-2">
                <Leaf className="size-6 text-primary/70" />
                {s("pickFirst")}
              </span>
            </div>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="press flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              <Camera className="size-4" />
              {s("camera")}
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="press flex items-center justify-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm font-bold text-foreground"
            >
              <ImageIcon className="size-4" />
              {s("gallery")}
            </button>
          </div>

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => void pick(e.target.files?.[0])}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void pick(e.target.files?.[0])}
          />

          <label className="mt-4 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            {s("cropHint")}
          </label>
          <select
            value={cropHint}
            onChange={(e) => setCropHint(e.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-border bg-background px-3 py-3 text-sm font-semibold"
          >
            <option value="">{s("notSure")}</option>
            {crops.map((c) => (
              <option key={c.id} value={c.commodity}>
                {c.name[lang]}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!preview || busy}
            onClick={() => void run()}
            className="press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {busy ? s("analysing") : s("analyse")}
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-3xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-2">
              <p>{error}</p>
              <button type="button" onClick={() => void run()} className="press underline">
                {s("retry")}
              </button>
            </div>
          </div>
        )}

        {result?.ok && !result.usable && (
          <div className="mt-4 rounded-3xl border border-amber-500/40 bg-amber-500/10 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4" />
              {s("imageProblem")}
            </p>
            <ul className="mt-2 space-y-1.5">
              {result.imageIssues.map((issue) => (
                <li key={issue} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{result.advice}</p>
            <button
              type="button"
              onClick={reset}
              className="press mt-3 flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-xs font-bold"
            >
              <RefreshCw className="size-3.5" />
              {s("again")}
            </button>
          </div>
        )}

        {diagnosis && (
          <div className="mt-4 space-y-3">
            <div className="glass rounded-3xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {s("cropDetected")}
                  </p>
                  <p className="font-display text-lg font-bold">{diagnosis.crop}</p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {s("condition")}
                  </p>
                  <p className="font-display text-base font-bold text-primary">{diagnosis.condition}</p>
                </div>
                <div className="shrink-0 rounded-2xl bg-primary/12 px-3 py-2 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-primary">{s("aiAnalysis")}</p>
                  <p className="font-display text-xl font-bold text-primary">{diagnosis.confidence}%</p>
                  <p className="text-[10px] font-semibold text-muted-foreground">{s("confidence")}</p>
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${diagnosis.confidence}%` }} />
              </div>

              {diagnosis.severity && (
                <p className="mt-3 text-xs font-semibold text-muted-foreground">
                  {s("severity")}: <span className="text-foreground">{diagnosis.severity}</span>
                </p>
              )}

              {diagnosis.uncertaintyNote && (
                <p className="mt-3 rounded-2xl bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                  <span className="font-bold">{s("uncertain")}: </span>
                  {diagnosis.uncertaintyNote}
                </p>
              )}
            </div>

            {diagnosis.whatItIs && (
              <div className="glass rounded-3xl p-4">
                <p className="flex items-center gap-2 text-sm font-bold">
                  <Leaf className="size-4 text-primary" />
                  {s("whatItIs")}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{diagnosis.whatItIs}</p>
              </div>
            )}

            {diagnosis.whyItHappens && (
              <div className="glass rounded-3xl p-4">
                <p className="text-sm font-bold">{s("whyItHappens")}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{diagnosis.whyItHappens}</p>
              </div>
            )}

            <Section icon={Stethoscope} title={s("symptoms")} items={diagnosis.symptoms} />
            <Section icon={AlertTriangle} title={s("causes")} items={diagnosis.causes} />
            <Section icon={Sparkles} title={s("envConditions")} items={diagnosis.conditionsFavouring} />
            <Section icon={ShieldCheck} title={s("whatToDo")} items={diagnosis.whatToDoNow} />
            <Section icon={ShieldCheck} title={s("prevention")} items={diagnosis.prevention} />
            <Section icon={RefreshCw} title={s("monitoring")} items={diagnosis.monitoring} />

            <p className="rounded-3xl border border-border/70 p-4 text-[11px] leading-relaxed text-muted-foreground">
              {s("disclaimer")}
            </p>

            <button
              type="button"
              onClick={reset}
              className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm font-bold"
            >
              <RefreshCw className="size-4" />
              {s("again")}
            </button>
          </div>
        )}
      </div>
    </Screen>
  );
}
