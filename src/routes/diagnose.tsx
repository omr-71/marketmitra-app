import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Screen, TopBar } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { crops } from "@/lib/crops";
import {
  diagnoseCropImage,
  type DiagnosisOk,
  type DiagnosisResult,
} from "@/lib/diagnose.functions";
import {
  AlertTriangle,
  Camera,
  Eye,
  FlaskConical,
  ImageIcon,
  Leaf,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Thermometer,
  UploadCloud,
  X,
  BookOpen,
  Info,
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
        content:
          "Camera or gallery photo, image-quality check, transparent confidence, no invented pesticide advice.",
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
  deskSubtitle: {
    en: "AI-assisted identification from a real photo of your crop",
    mr: "तुमच्या पिकाच्या खऱ्या फोटोवरून AI-सहाय्यित ओळख",
    hi: "आपकी फ़सल की असली फ़ोटो से AI-सहायित पहचान",
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
  change: { en: "Change photo", mr: "फोटो बदला", hi: "फ़ोटो बदलें" },
  again: { en: "New diagnosis", mr: "नवीन तपासणी", hi: "नई जाँच" },
  retry: { en: "Try again", mr: "पुन्हा प्रयत्न", hi: "फिर कोशिश करें" },
  aiAnalysis: { en: "AI Analysis", mr: "AI विश्लेषण", hi: "AI विश्लेषण" },
  confidence: { en: "AI confidence", mr: "AI विश्वास", hi: "AI विश्वास" },
  confidenceNote: {
    en: "AI confidence — not scientific certainty",
    mr: "AI विश्वास — शास्त्रीय खात्री नाही",
    hi: "AI विश्वास — वैज्ञानिक निश्चितता नहीं",
  },
  cropDetected: { en: "Crop detected", mr: "ओळखलेले पीक", hi: "पहचानी गई फ़सल" },
  condition: { en: "Condition detected", mr: "ओळखलेला रोग / स्थिती", hi: "पहचानी गई बीमारी / स्थिति" },
  severity: { en: "Severity", mr: "तीव्रता", hi: "गंभीरता" },
  symptoms: { en: "Symptoms", mr: "लक्षणे", hi: "लक्षण" },
  causes: { en: "Causes", mr: "कारणे", hi: "कारण" },
  envConditions: { en: "Conditions that favour it", mr: "पोषक हवामान स्थिती", hi: "अनुकूल मौसम स्थितियाँ" },
  diagnosisTab: { en: "Diagnosis", mr: "निदान", hi: "निदान" },
  whatItIs: { en: "What it is", mr: "हे काय आहे", hi: "यह क्या है" },
  whyItHappens: { en: "Why it happens", mr: "हे का होते", hi: "यह क्यों होता है" },
  whatToDo: { en: "Immediate action", mr: "तातडीची कृती", hi: "तत्काल कार्रवाई" },
  treatment: { en: "Treatment", mr: "उपचार", hi: "उपचार" },
  sprays: { en: "Sprays", mr: "फवारणी", hi: "स्प्रे" },
  prevention: { en: "Prevention", mr: "प्रतिबंध", hi: "रोकथाम" },
  expert: { en: "Expert guidance", mr: "तज्ज्ञ मार्गदर्शन", hi: "विशेषज्ञ मार्गदर्शन" },
  sources: { en: "Sources", mr: "स्रोत", hi: "स्रोत" },
  monitoring: { en: "Keep watching for", mr: "पुढे लक्ष ठेवा", hi: "आगे ध्यान रखें" },
  uncertain: { en: "Not conclusive", mr: "निश्चित नाही", hi: "निश्चित नहीं" },
  imageProblem: { en: "Photo is not clear enough", mr: "फोटो पुरेसा स्पष्ट नाही", hi: "फ़ोटो पर्याप्त स्पष्ट नहीं" },
  disclaimer: {
    en: "AI guidance only — never 100% accurate. Confirm with your local KVK or agriculture officer before spending on inputs. Use only products registered for this crop and disease, and follow the product label for dose and interval.",
    mr: "हे केवळ AI मार्गदर्शन आहे — १००% अचूक नाही. खर्च करण्यापूर्वी स्थानिक KVK किंवा कृषी अधिकाऱ्याकडून खात्री करा. या पिकासाठी नोंदणीकृत उत्पादनेच वापरा आणि मात्रा व अंतर लेबलप्रमाणे पाळा.",
    hi: "यह केवल AI मार्गदर्शन है — 100% सटीक नहीं. खर्च करने से पहले स्थानीय KVK या कृषि अधिकारी से पुष्टि करें. इस फ़सल के लिए पंजीकृत उत्पाद ही उपयोग करें और मात्रा व अंतराल लेबल के अनुसार रखें.",
  },
  pickFirst: { en: "Add a photo to start", mr: "सुरू करण्यासाठी फोटो जोडा", hi: "शुरू करने के लिए फ़ोटो जोड़ें" },
  emptyTitle: {
    en: "Upload a clear photo of your crop or affected plant part to begin AI-assisted identification.",
    mr: "AI-सहाय्यित ओळख सुरू करण्यासाठी तुमच्या पिकाचा किंवा प्रभावित भागाचा स्पष्ट फोटो अपलोड करा.",
    hi: "AI-सहायित पहचान शुरू करने के लिए अपनी फ़सल या प्रभावित भाग की स्पष्ट फ़ोटो अपलोड करें.",
  },
  dropHint: {
    en: "Drag and drop an image here, or use the buttons below",
    mr: "इथे इमेज ड्रॅग-ड्रॉप करा, किंवा खालील बटणे वापरा",
    hi: "यहाँ इमेज ड्रैग-ड्रॉप करें, या नीचे के बटन इस्तेमाल करें",
  },
  tips: { en: "Photo tips", mr: "फोटो टिप्स", hi: "फ़ोटो टिप्स" },
  tip1: {
    en: "Fill the frame with the affected leaf or fruit",
    mr: "प्रभावित पान किंवा फळ पूर्ण फ्रेममध्ये घ्या",
    hi: "प्रभावित पत्ते या फल से फ़्रेम भरें",
  },
  tip2: { en: "Shoot in daylight, avoid shadows and flash", mr: "दिवसाच्या उजेडात, सावली व फ्लॅश टाळा", hi: "दिन के उजाले में लें, छाया व फ़्लैश से बचें" },
  tip3: { en: "Hold steady so the photo is sharp", mr: "फोटो स्पष्ट येण्यासाठी हात स्थिर ठेवा", hi: "फ़ोटो साफ़ आने के लिए हाथ स्थिर रखें" },
  tip4: { en: "Include both healthy and damaged parts", mr: "निरोगी व खराब दोन्ही भाग दिसू द्या", hi: "स्वस्थ और खराब दोनों हिस्से शामिल करें" },
  loading1: { en: "Analysing crop image…", mr: "पिकाचा फोटो तपासत आहे…", hi: "फ़सल की फ़ोटो जाँची जा रही है…" },
  loading2: { en: "Examining visible symptoms…", mr: "दिसणारी लक्षणे तपासत आहे…", hi: "दिखने वाले लक्षण जाँचे जा रहे हैं…" },
  loading3: { en: "Preparing agricultural guidance…", mr: "कृषी मार्गदर्शन तयार करत आहे…", hi: "कृषि मार्गदर्शन तैयार किया जा रहा है…" },
  noInfo: {
    en: "This information is not available for the current diagnosis.",
    mr: "सध्याच्या निदानासाठी ही माहिती उपलब्ध नाही.",
    hi: "वर्तमान निदान के लिए यह जानकारी उपलब्ध नहीं है.",
  },
  noSpray: {
    en: "No verified treatment information is currently available.",
    mr: "सध्या पडताळलेली फवारणी माहिती उपलब्ध नाही.",
    hi: "फ़िलहाल सत्यापित उपचार जानकारी उपलब्ध नहीं है.",
  },
  noSprayWhy: {
    en: "MarketMitra does not connect to a verified pesticide-label database, so no product name, active ingredient, dose or interval is shown. Ask your KVK or the state agriculture department for a label-approved recommendation for this crop and condition.",
    mr: "MarketMitra कोणत्याही पडताळलेल्या कीटकनाशक-लेबल डेटाबेसशी जोडलेले नाही, त्यामुळे उत्पादनाचे नाव, घटक, मात्रा किंवा अंतर दाखवले जात नाही. या पिकासाठी व स्थितीसाठी लेबल-मान्य शिफारशीसाठी KVK किंवा राज्य कृषी विभागाशी संपर्क साधा.",
    hi: "MarketMitra किसी सत्यापित कीटनाशक-लेबल डेटाबेस से जुड़ा नहीं है, इसलिए उत्पाद नाम, सक्रिय तत्व, मात्रा या अंतराल नहीं दिखाया जाता. इस फ़सल व स्थिति के लिए लेबल-अनुमोदित सिफ़ारिश हेतु KVK या राज्य कृषि विभाग से संपर्क करें.",
  },
  sourceAi: { en: "AI-generated interpretation", mr: "AI-निर्मित विश्लेषण", hi: "AI-निर्मित व्याख्या" },
  sourceAiBody: {
    en: "Crop, condition, symptoms, causes and guidance on this page are the vision model's reading of your photo only.",
    mr: "या पानावरील पीक, स्थिती, लक्षणे, कारणे व मार्गदर्शन हे केवळ तुमच्या फोटोवरील मॉडेलचे वाचन आहे.",
    hi: "इस पेज पर फ़सल, स्थिति, लक्षण, कारण व मार्गदर्शन केवल आपकी फ़ोटो पर मॉडल का पठन है.",
  },
  sourceVerified: { en: "Verified source information", mr: "पडताळलेली स्रोत माहिती", hi: "सत्यापित स्रोत जानकारी" },
  model: { en: "Model", mr: "मॉडेल", hi: "मॉडल" },
  analysedAt: { en: "Analysed at", mr: "तपासले", hi: "जाँचा गया" },
  language: { en: "Language", mr: "भाषा", hi: "भाषा" },
  askExpert: {
    en: "Confirm this reading with your local Krishi Vigyan Kendra (KVK) or the district agriculture officer before spending on any input. Carry the affected plant part with you if possible.",
    mr: "कोणताही खर्च करण्यापूर्वी हे निदान स्थानिक कृषी विज्ञान केंद्र (KVK) किंवा जिल्हा कृषी अधिकाऱ्याकडून तपासा. शक्य असल्यास प्रभावित भाग सोबत न्या.",
    hi: "कोई भी खर्च करने से पहले इस निदान की पुष्टि स्थानीय कृषि विज्ञान केंद्र (KVK) या ज़िला कृषि अधिकारी से करें. संभव हो तो प्रभावित हिस्सा साथ ले जाएँ.",
  },
  workspace: { en: "Diagnosis workspace", mr: "तपासणी कक्ष", hi: "जाँच कक्ष" },
  invalidImage: {
    en: "That file could not be read as an image. Please choose a JPG, PNG or WebP photo.",
    mr: "ही फाईल इमेज म्हणून वाचता आली नाही. कृपया JPG, PNG किंवा WebP फोटो निवडा.",
    hi: "यह फ़ाइल इमेज के रूप में नहीं पढ़ी जा सकी. कृपया JPG, PNG या WebP फ़ोटो चुनें.",
  },
  networkError: {
    en: "Analysis could not be completed. Please check your connection and try again.",
    mr: "विश्लेषण पूर्ण होऊ शकले नाही. कृपया इंटरनेट तपासून पुन्हा प्रयत्न करा.",
    hi: "विश्लेषण पूरा नहीं हो सका. कृपया कनेक्शन जाँचकर फिर कोशिश करें.",
  },
} as const;

const langLabel = { en: "English", mr: "मराठी", hi: "हिंदी" } as const;

type TabId =
  | "diagnosis"
  | "symptoms"
  | "causes"
  | "action"
  | "treatment"
  | "sprays"
  | "prevention"
  | "expert"
  | "sources";

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

function Bullets({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0)
    return <p className="text-sm leading-relaxed text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border/70 bg-card/40 p-4 lg:p-5">
      <h3 className="text-sm font-bold">{title}</h3>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

/** Circular AI-confidence indicator (SVG, no animation loops). */
function ConfidenceDial({ value, label, note }: { value: number; label: string; note: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <div className="relative size-[86px] shrink-0">
        <svg viewBox="0 0 80 80" className="size-full -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-muted" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out"
            strokeDasharray={c}
            strokeDashoffset={c - (c * Math.max(0, Math.min(100, value))) / 100}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-lg font-bold text-primary">{value}%</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>
      </div>
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
  const [dragging, setDragging] = useState(false);
  const [tab, setTab] = useState<TabId>("diagnosis");
  const [loadStep, setLoadStep] = useState(0);

  // Rotating status copy while the REAL request is in flight; no fake progress.
  useEffect(() => {
    if (!busy) {
      setLoadStep(0);
      return;
    }
    const id = setInterval(() => setLoadStep((n) => (n + 1) % 3), 2200);
    return () => clearInterval(id);
  }, [busy]);

  const pick = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setResult(null);
    setTab("diagnosis");
    if (!file.type.startsWith("image/")) {
      setError(L.invalidImage[lang]);
      return;
    }
    try {
      setPreview(await toCompactDataUrl(file));
    } catch {
      setError(L.invalidImage[lang]);
    }
  }, [lang]);

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
      setTab("diagnosis");
      if (!data.ok) setError(data.message);
    } catch {
      setError(L.networkError[lang]);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    setTab("diagnosis");
    if (cameraRef.current) cameraRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const diagnosis: DiagnosisOk | null = result?.ok && result.usable ? result : null;

  const tabs = useMemo(
    () =>
      [
        { id: "diagnosis" as const, label: s("diagnosisTab"), icon: Stethoscope },
        { id: "symptoms" as const, label: s("symptoms"), icon: Eye },
        { id: "causes" as const, label: s("causes"), icon: AlertTriangle },
        { id: "action" as const, label: s("whatToDo"), icon: Sparkles },
        { id: "treatment" as const, label: s("treatment"), icon: ShieldCheck },
        { id: "sprays" as const, label: s("sprays"), icon: FlaskConical },
        { id: "prevention" as const, label: s("prevention"), icon: Leaf },
        { id: "expert" as const, label: s("expert"), icon: Info },
        { id: "sources" as const, label: s("sources"), icon: BookOpen },
      ],
    [lang],
  );

  const uploader = (
    <div className="rounded-3xl border border-border/70 bg-card/50 p-4 lg:p-6">
      <h2 className="flex items-center gap-2 text-sm font-bold">
        <Stethoscope className="size-4 text-primary" />
        {s("aiAnalysis")}
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground lg:text-sm">{s("intro")}</p>

      {preview ? (
        <div className="animate-scale-in relative mt-4 overflow-hidden rounded-2xl border border-border/70">
          <img
            src={preview}
            alt="Crop photo selected for analysis"
            loading="lazy"
            decoding="async"
            className="h-56 w-full object-cover lg:h-[340px]"
          />
          <div className="absolute right-2 top-2 flex gap-2">
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="press rounded-full bg-background/85 px-3 py-2 text-xs font-bold backdrop-blur transition-colors hover:bg-background"
            >
              {s("change")}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label={s("remove")}
              className="press grid size-9 place-items-center rounded-full bg-background/85 backdrop-blur transition-colors hover:bg-background"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void pick(e.dataTransfer.files?.[0]);
          }}
          onClick={() => galleryRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              galleryRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={s("gallery")}
          className={`mt-4 grid cursor-pointer place-items-center rounded-2xl border border-dashed px-5 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:py-14 ${
            dragging ? "border-primary bg-primary/8" : "border-border/80 bg-muted/40 hover:border-primary/60"
          }`}
        >
          <UploadCloud className="size-7 text-primary/80" />
          <p className="mt-3 max-w-md text-sm font-semibold">{s("emptyTitle")}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">{s("dropHint")}</p>
        </div>
      )}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="press flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Camera className="size-4" />
          {s("camera")}
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="press flex items-center justify-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted/70"
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
        className="sr-only"
        aria-label={s("camera")}
        onChange={(e) => void pick(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={s("gallery")}
        onChange={(e) => void pick(e.target.files?.[0])}
      />

      <label
        htmlFor="crop-hint"
        className="mt-4 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
      >
        {s("cropHint")}
      </label>
      <select
        id="crop-hint"
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
        className="press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {busy ? s("analysing") : preview ? s("analyse") : s("pickFirst")}
      </button>

      {!preview && (
        <div className="mt-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{s("tips")}</p>
          <ul className="mt-2 space-y-1.5">
            {[s("tip1"), s("tip2"), s("tip3"), s("tip4")].map((tip) => (
              <li key={tip} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const tabContent = (d: DiagnosisOk) => {
    switch (tab) {
      case "diagnosis":
        return (
          <div className="space-y-3">
            <Block title={s("whatItIs")}>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {d.whatItIs || s("noInfo")}
              </p>
            </Block>
            <Block title={s("whyItHappens")}>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {d.whyItHappens || s("noInfo")}
              </p>
            </Block>
            <Block title={s("envConditions")}>
              <Bullets items={d.conditionsFavouring} empty={s("noInfo")} />
            </Block>
          </div>
        );
      case "symptoms":
        return (
          <Block title={s("symptoms")}>
            <Bullets items={d.symptoms} empty={s("noInfo")} />
          </Block>
        );
      case "causes":
        return (
          <Block title={s("causes")}>
            <Bullets items={d.causes} empty={s("noInfo")} />
          </Block>
        );
      case "action":
        return (
          <Block title={s("whatToDo")}>
            <Bullets items={d.whatToDoNow} empty={s("noInfo")} />
          </Block>
        );
      case "treatment":
        return (
          <div className="space-y-3">
            <Block title={s("treatment")}>
              <Bullets items={d.whatToDoNow} empty={s("noInfo")} />
            </Block>
            <Block title={s("monitoring")}>
              <Bullets items={d.monitoring} empty={s("noInfo")} />
            </Block>
            <p className="rounded-3xl border border-border/70 p-4 text-xs leading-relaxed text-muted-foreground">
              {s("disclaimer")}
            </p>
          </div>
        );
      case "sprays":
        return (
          <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-4 lg:p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400">
              <FlaskConical className="size-4" />
              {s("noSpray")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s("noSprayWhy")}</p>
          </div>
        );
      case "prevention":
        return (
          <Block title={s("prevention")}>
            <Bullets items={d.prevention} empty={s("noInfo")} />
          </Block>
        );
      case "expert":
        return (
          <div className="space-y-3">
            <Block title={s("expert")}>
              <p className="text-sm leading-relaxed text-muted-foreground">{s("askExpert")}</p>
            </Block>
            {d.uncertaintyNote && (
              <Block title={s("uncertain")}>
                <p className="text-sm leading-relaxed text-muted-foreground">{d.uncertaintyNote}</p>
              </Block>
            )}
          </div>
        );
      case "sources":
        return (
          <div className="space-y-3">
            <Block title={s("sourceAi")}>
              <p className="text-sm leading-relaxed text-muted-foreground">{s("sourceAiBody")}</p>
              <dl className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3 border-t border-border/60 pt-1.5">
                  <dt className="font-semibold">{s("model")}</dt>
                  <dd className="truncate">{d.model}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-border/60 pt-1.5">
                  <dt className="font-semibold">{s("analysedAt")}</dt>
                  <dd>{new Date(d.analysedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-border/60 pt-1.5">
                  <dt className="font-semibold">{s("language")}</dt>
                  <dd>{langLabel[lang]}</dd>
                </div>
              </dl>
            </Block>
            <Block title={s("sourceVerified")}>
              <p className="text-sm leading-relaxed text-muted-foreground">{s("noSpray")}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s("noSprayWhy")}</p>
            </Block>
          </div>
        );
    }
  };

  return (
    <Screen>
      <div className="lg:hidden">
        <TopBar
          title={s("title")}
          subtitle={s("subtitle")}
          back="/home"
          action={
            preview || result ? (
              <button
                type="button"
                onClick={reset}
                aria-label={s("again")}
                className="press grid size-9 place-items-center rounded-full bg-muted"
              >
                <RefreshCw className="size-4" />
              </button>
            ) : undefined
          }
        />
      </div>


      <div className="px-5 pb-6 pt-5 lg:px-0 lg:pt-8">
        {/* Desktop workspace header */}
        <header className="mb-6 hidden items-end justify-between gap-6 border-b border-border/70 pb-5 lg:flex">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              {s("workspace")}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold">{s("title")}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{s("deskSubtitle")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="rounded-full border border-border/70 px-3 py-1.5 text-xs font-bold text-muted-foreground">
              {langLabel[lang]}
            </span>
            <button
              type="button"
              onClick={reset}
              className="press flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm font-bold transition-colors hover:bg-muted/70"
            >
              <RefreshCw className="size-4" />
              {s("again")}
            </button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start lg:gap-6">
          <div className="lg:sticky lg:top-6">{uploader}</div>

          <div className="space-y-4">
            {busy && (
              <div className="animate-fade-in grid place-items-center rounded-3xl border border-border/70 bg-card/40 p-8 text-center lg:min-h-[360px]">
                <div>
                  <Loader2 className="mx-auto size-8 animate-spin text-primary" />
                  <p className="mt-4 text-sm font-bold">
                    {[s("loading1"), s("loading2"), s("loading3")][loadStep]}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">{s("confidenceNote")}</p>
                </div>
              </div>
            )}

            {!busy && error && (
              <div className="animate-fade-in flex items-start gap-2 rounded-3xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <div className="space-y-2">
                  <p>{error}</p>
                  {preview && (
                    <button type="button" onClick={() => void run()} className="press underline">
                      {s("retry")}
                    </button>
                  )}
                </div>
              </div>
            )}

            {!busy && result?.ok && !result.usable && (
              <div className="animate-fade-in rounded-3xl border border-amber-500/40 bg-amber-500/10 p-4 lg:p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="size-4" />
                  {s("imageProblem")}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {result.imageIssues.map((issue) => (
                    <li key={issue} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.advice}</p>
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

            {!busy && !error && !result && (
              <div className="hidden place-items-center rounded-3xl border border-dashed border-border/70 bg-card/30 p-10 text-center lg:grid lg:min-h-[360px]">
                <div className="max-w-md">
                  <Leaf className="mx-auto size-8 text-primary/70" />
                  <p className="mt-3 font-display text-lg font-bold">{s("workspace")}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s("emptyTitle")}</p>
                </div>
              </div>
            )}

            {!busy && diagnosis && (
              <div className="animate-fade-in space-y-4">
                <div className="rounded-3xl border border-border/70 bg-card/50 p-4 lg:p-6">
                  <div className="grid gap-5 lg:grid-cols-2 lg:items-center">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        {s("cropDetected")}
                      </p>
                      <p className="font-display text-xl font-bold lg:text-2xl">{diagnosis.crop}</p>
                      <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        {s("condition")}
                      </p>
                      <p className="font-display text-lg font-bold text-primary lg:text-xl">
                        {diagnosis.condition}
                      </p>
                      {diagnosis.severity && (
                        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold">
                          <Thermometer className="size-3.5 text-primary" />
                          {s("severity")}: {diagnosis.severity}
                        </p>
                      )}
                    </div>
                    <ConfidenceDial
                      value={diagnosis.confidence}
                      label={s("confidence")}
                      note={s("confidenceNote")}
                    />
                  </div>

                  {diagnosis.uncertaintyNote && (
                    <p className="mt-4 rounded-2xl bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                      <span className="font-bold">{s("uncertain")}: </span>
                      {diagnosis.uncertaintyNote}
                    </p>
                  )}
                </div>

                <div
                  role="tablist"
                  aria-label={s("aiAnalysis")}
                  className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible"
                >
                  {tabs.map(({ id, label, icon: Icon }) => {
                    const active = tab === id;
                    return (
                      <button
                        key={id}
                        role="tab"
                        type="button"
                        aria-selected={active}
                        onClick={() => setTab(id)}
                        className={`press flex shrink-0 items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                          active
                            ? "border-primary bg-primary/12 text-primary"
                            : "border-border/70 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="size-3.5" />
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div key={tab} className="animate-fade-in space-y-3">
                  {tabContent(diagnosis)}
                </div>

                <button
                  type="button"
                  onClick={reset}
                  className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm font-bold transition-colors hover:bg-muted/70"
                >
                  <RefreshCw className="size-4" />
                  {s("again")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Screen>
  );
}
