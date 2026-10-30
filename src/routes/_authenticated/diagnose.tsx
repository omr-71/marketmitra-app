import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Screen, TopBar } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { crops } from "@/lib/crops";
import { toCompactCropImageDataUrl } from "@/lib/crop-image";
import {
  deleteCropDiagnosis,
  diagnoseCropImage,
  getDiagnosisTreatmentGuidance,
  listCropDiagnoses,
  type DiagnosisOk,
  type DiagnosisResult,
  type SavedDiagnosis,
  type TreatmentRecommendation,
} from "@/lib/diagnose.functions";
import { buildDiagnosisManagementFallback } from "@/lib/treatments.presentation";
import {
  AlertTriangle,
  BookOpen,
  Camera,
  FlaskConical,
  History as HistoryIcon,
  ImageIcon,
  Leaf,
  Loader2,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Thermometer,
  UploadCloud,
  X,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/diagnose")({
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
      { property: "og:url", content: "https://marketmitra.app/diagnose" },
    ],
    links: [{ rel: "canonical", href: "https://marketmitra.app/diagnose" }],
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
  condition: {
    en: "Likely condition",
    mr: "संभाव्य स्थिती",
    hi: "संभावित स्थिति",
  },
  likely: { en: "Likely", mr: "संभाव्य", hi: "संभावित" },
  severity: { en: "Severity", mr: "तीव्रता", hi: "गंभीरता" },
  symptoms: { en: "Symptoms", mr: "लक्षणे", hi: "लक्षण" },
  causes: { en: "Causes", mr: "कारणे", hi: "कारण" },
  observed: { en: "What we observed", mr: "दिसलेली लक्षणे", hi: "क्या दिखाई दिया" },
  evidence: { en: "Why this may fit", mr: "हे का जुळू शकते", hi: "यह क्यों मेल खा सकता है" },
  otherPossibilities: {
    en: "Other possible causes",
    mr: "इतर संभाव्य कारणे",
    hi: "अन्य संभावित कारण",
  },
  nextSteps: {
    en: "What should I do now?",
    mr: "आता काय करावे?",
    hi: "अब मुझे क्या करना चाहिए?",
  },
  imageTooLarge: {
    en: "This photo is too large to process safely. Choose a smaller photo or take a new picture.",
    mr: "हा फोटो सुरक्षितपणे प्रक्रिया करण्यासाठी खूप मोठा आहे. लहान फोटो निवडा किंवा नवीन फोटो घ्या.",
    hi: "यह फ़ोटो सुरक्षित रूप से प्रोसेस करने के लिए बहुत बड़ी है। छोटी फ़ोटो चुनें या नई फ़ोटो लें।",
  },
  unsupportedImage: {
    en: "Choose a readable JPG, PNG, WebP or AVIF photo. HEIC is not supported by this browser.",
    mr: "वाचता येणारा JPG, PNG, WebP किंवा AVIF फोटो निवडा. या ब्राउझरमध्ये HEIC समर्थित नाही.",
    hi: "पढ़ने योग्य JPG, PNG, WebP या AVIF फ़ोटो चुनें। इस ब्राउज़र में HEIC समर्थित नहीं है।",
  },
  envConditions: {
    en: "Conditions that favour it",
    mr: "पोषक हवामान स्थिती",
    hi: "अनुकूल मौसम स्थितियाँ",
  },
  diagnosisTab: { en: "Diagnosis", mr: "निदान", hi: "निदान" },
  diseaseSection: {
    en: "Disease / problem",
    mr: "रोग / समस्या",
    hi: "रोग / समस्या",
  },
  organicSection: {
    en: "Treatment & sprays",
    mr: "उपचार व फवारणी",
    hi: "उपचार और छिड़काव",
  },
  spraySection: {
    en: "Prevention",
    mr: "प्रतिबंध",
    hi: "रोकथाम",
  },
  sourcesTab: { en: "Sources", mr: "स्रोत", hi: "स्रोत" },
  nonChemicalSteps: {
    en: "Non-chemical steps",
    mr: "विना-रासायनिक उपाय",
    hi: "बिना-रासायनिक उपाय",
  },
  treatmentNote: {
    en: "General AI guidance is not a confirmed diagnosis or a verified product recommendation. Confirm consequential decisions with your local KVK or agriculture officer.",
    mr: "सामान्य AI मार्गदर्शन हे निश्चित निदान किंवा पडताळलेली उत्पादन शिफारस नाही. महत्त्वाचे निर्णय स्थानिक KVK किंवा कृषी अधिकाऱ्यांकडून तपासा.",
    hi: "सामान्य AI मार्गदर्शन पुष्टि किया हुआ निदान या सत्यापित उत्पाद सुझाव नहीं है। महत्त्वपूर्ण निर्णय स्थानीय KVK या कृषि अधिकारी से जाँचें।",
  },
  sourcesUnavailable: {
    en: "No authoritative source page was returned for this scan. Product and crop-specific organic recommendations that need evidence are omitted.",
    mr: "या तपासणीसाठी अधिकृत स्रोत पृष्ठ मिळाले नाही. पुरावा आवश्यक असलेली उत्पादने व पीक-विशिष्ट सेंद्रिय सूचना दाखवलेल्या नाहीत.",
    hi: "इस जाँच के लिए कोई आधिकारिक स्रोत पृष्ठ नहीं मिला। प्रमाण की आवश्यकता वाले उत्पाद और फ़सल-विशिष्ट जैविक सुझाव शामिल नहीं किए गए हैं।",
  },
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
  imageProblem: {
    en: "Photo is not clear enough",
    mr: "फोटो पुरेसा स्पष्ट नाही",
    hi: "फ़ोटो पर्याप्त स्पष्ट नहीं",
  },
  disclaimer: {
    en: "AI guidance only — never 100% accurate. Confirm with your local KVK or agriculture officer before spending on inputs. Use only products registered for this crop and disease, and follow the product label for dose and interval.",
    mr: "हे केवळ AI मार्गदर्शन आहे — १००% अचूक नाही. खर्च करण्यापूर्वी स्थानिक KVK किंवा कृषी अधिकाऱ्याकडून खात्री करा. या पिकासाठी नोंदणीकृत उत्पादनेच वापरा आणि मात्रा व अंतर लेबलप्रमाणे पाळा.",
    hi: "यह केवल AI मार्गदर्शन है — 100% सटीक नहीं. खर्च करने से पहले स्थानीय KVK या कृषि अधिकारी से पुष्टि करें. इस फ़सल के लिए पंजीकृत उत्पाद ही उपयोग करें और मात्रा व अंतराल लेबल के अनुसार रखें.",
  },
  pickFirst: {
    en: "Add a photo to start",
    mr: "सुरू करण्यासाठी फोटो जोडा",
    hi: "शुरू करने के लिए फ़ोटो जोड़ें",
  },
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
  tip2: {
    en: "Shoot in daylight, avoid shadows and flash",
    mr: "दिवसाच्या उजेडात, सावली व फ्लॅश टाळा",
    hi: "दिन के उजाले में लें, छाया व फ़्लैश से बचें",
  },
  tip3: {
    en: "Hold steady so the photo is sharp",
    mr: "फोटो स्पष्ट येण्यासाठी हात स्थिर ठेवा",
    hi: "फ़ोटो साफ़ आने के लिए हाथ स्थिर रखें",
  },
  tip4: {
    en: "Include both healthy and damaged parts",
    mr: "निरोगी व खराब दोन्ही भाग दिसू द्या",
    hi: "स्वस्थ और खराब दोनों हिस्से शामिल करें",
  },
  loading1: {
    en: "Analysing crop image…",
    mr: "पिकाचा फोटो तपासत आहे…",
    hi: "फ़सल की फ़ोटो जाँची जा रही है…",
  },
  loading2: {
    en: "Examining visible symptoms…",
    mr: "दिसणारी लक्षणे तपासत आहे…",
    hi: "दिखने वाले लक्षण जाँचे जा रहे हैं…",
  },
  loading3: {
    en: "Preparing agricultural guidance…",
    mr: "कृषी मार्गदर्शन तयार करत आहे…",
    hi: "कृषि मार्गदर्शन तैयार किया जा रहा है…",
  },
  noInfo: {
    en: "This information is not available for the current diagnosis.",
    mr: "सध्याच्या निदानासाठी ही माहिती उपलब्ध नाही.",
    hi: "वर्तमान निदान के लिए यह जानकारी उपलब्ध नहीं है.",
  },
  noSprayWhy: {
    en: "AI-generated suggestions are not verified label instructions. Never use a product unless its current official label covers this crop and condition; follow its safety directions and consult a local expert.",
    mr: "AI सूचना पडताळलेल्या लेबल सूचना नाहीत. सध्याच्या अधिकृत लेबलवर हे पीक व स्थिती नमूद नसल्यास उत्पादन वापरू नका; सुरक्षा सूचना पाळा आणि स्थानिक तज्ज्ञांचा सल्ला घ्या.",
    hi: "AI सुझाव सत्यापित लेबल निर्देश नहीं हैं। मौजूदा आधिकारिक लेबल में यह फ़सल और स्थिति शामिल न हो तो उत्पाद न इस्तेमाल करें; सुरक्षा निर्देशों का पालन करें और स्थानीय विशेषज्ञ से सलाह लें।",
  },
  treatmentLoading: {
    en: "Finding crop-specific candidates and checking available sources…",
    mr: "पीक-विशिष्ट पर्याय आणि उपलब्ध स्रोत तपासत आहे…",
    hi: "फ़सल-विशिष्ट विकल्प और उपलब्ध स्रोत खोजे जा रहे हैं…",
  },
  treatmentError: {
    en: "Treatment research could not be completed. Try again.",
    mr: "उपचार शोध पूर्ण होऊ शकला नाही. पुन्हा प्रयत्न करा.",
    hi: "उपचार जानकारी नहीं मिल सकी। फिर कोशिश करें।",
  },
  treatmentInvalidResponse: {
    en: "No complete, source-checked spray results were returned. No product is recommended; use the non-chemical steps below and confirm the cause with your local KVK before spraying.",
    mr: "पूर्ण आणि स्रोत-पडताळलेले फवारणी परिणाम मिळाले नाहीत. कोणतेही उत्पादन सुचवलेले नाही; खालील विना-रासायनिक पायऱ्या वापरा आणि फवारणीपूर्वी स्थानिक KVK कडून कारणाची खात्री करा.",
    hi: "पूरे और स्रोत-जाँचे स्प्रे परिणाम नहीं मिले। कोई उत्पाद सुझाया नहीं गया है; नीचे दिए गैर-रासायनिक कदम अपनाएँ और छिड़काव से पहले स्थानीय KVK से कारण की पुष्टि करें।",
  },
  treatmentRateLimit: {
    en: "The spray research service is temporarily busy. Wait a moment and retry.",
    mr: "फवारणी संशोधन सेवा सध्या व्यस्त आहे. थोडा वेळ थांबून पुन्हा प्रयत्न करा.",
    hi: "स्प्रे शोध सेवा अभी व्यस्त है। थोड़ी देर बाद फिर कोशिश करें।",
  },
  treatmentUsageLimit: {
    en: "You have reached the spray research limit for now. Please try again later.",
    mr: "सध्या फवारणी संशोधनाची मर्यादा पूर्ण झाली आहे. कृपया नंतर पुन्हा प्रयत्न करा.",
    hi: "अभी स्प्रे शोध की अनुरोध सीमा पूरी हो गई है। कृपया बाद में फिर कोशिश करें।",
  },
  treatmentNotConfigured: {
    en: "Spray research is not configured on the server. Please contact support.",
    mr: "सर्व्हरवर फवारणी संशोधन कॉन्फिगर केलेले नाही. कृपया मदत केंद्राशी संपर्क साधा.",
    hi: "सर्वर पर स्प्रे शोध कॉन्फ़िगर नहीं है। कृपया सहायता से संपर्क करें।",
  },
  treatmentAuthorization: {
    en: "Your sign-in session needs attention. Sign in again before requesting treatment research.",
    mr: "उपचार संशोधनापूर्वी तुमच्या साइन-इन सत्राची पुन्हा पुष्टी करा.",
    hi: "उपचार शोधने से पहले अपने साइन-इन सत्र की पुष्टि करें।",
  },
  treatmentUnavailable: {
    en: "The spray research service is unavailable right now. Your diagnosis is saved; please retry.",
    mr: "फवारणी संशोधन सेवा सध्या उपलब्ध नाही. तुमचे निदान जतन केले आहे; पुन्हा प्रयत्न करा.",
    hi: "स्प्रे शोध सेवा अभी उपलब्ध नहीं है। आपका निदान सुरक्षित है; फिर कोशिश करें।",
  },
  treatmentEvidenceUnavailable: {
    en: "No supported product options were found. Use the diagnosis-based non-chemical guidance and confirm the cause with your local KVK.",
    mr: "स्रोत-समर्थित उत्पादन पर्याय मिळाले नाहीत. निदानावर आधारित विना-रासायनिक मार्गदर्शन वापरा आणि स्थानिक KVK कडून कारणाची खात्री करा.",
    hi: "स्रोत-समर्थित उत्पाद विकल्प नहीं मिले। निदान-आधारित गैर-रासायनिक सुझाव अपनाएँ और स्थानीय KVK से कारण की पुष्टि करें।",
  },
  treatmentRetry: { en: "Retry search", mr: "पुन्हा शोधा", hi: "फिर खोजें" },
  treatmentRetryWait: {
    en: "Retry in {seconds}s",
    mr: "{seconds} सेकंदांनी पुन्हा प्रयत्न करा",
    hi: "{seconds} सेकंड में फिर कोशिश करें",
  },
  treatmentNeedsSaved: {
    en: "Save the crop scan before requesting treatment research.",
    mr: "उपचार शोधण्यापूर्वी पीक तपासणी जतन करा.",
    hi: "उपचार जानकारी माँगने से पहले फ़सल जाँच सहेजें।",
  },
  treatmentGeneral: {
    en: "General AI care suggestions",
    mr: "सामान्य AI काळजी सूचना",
    hi: "सामान्य AI देखभाल सुझाव",
  },
  treatmentOrganicNatural: {
    en: "Organic & natural management",
    mr: "सेंद्रिय व नैसर्गिक व्यवस्थापन",
    hi: "जैविक और प्राकृतिक प्रबंधन",
  },
  treatmentOrganicFallback: {
    en: "No distinct crop- and condition-specific organic practice was verified. See Non-chemical steps above; ask your local KVK about locally suitable biological options.",
    mr: "पीक व स्थितीसाठी वेगळी सेंद्रिय पद्धत स्रोतावरून पडताळली नाही. वरील विना-रासायनिक उपाय पहा; स्थानिक जैविक पर्यायांसाठी KVK ला विचारा.",
    hi: "फ़सल और समस्या के लिए कोई अलग जैविक तरीका सत्यापित नहीं हुआ। ऊपर दिए गैर-रासायनिक कदम देखें; स्थानीय जैविक विकल्पों के लिए KVK से पूछें।",
  },
  treatmentSourceSupported: {
    en: "Source supports crop and problem; check the current label",
    mr: "स्रोत पीक व समस्येला समर्थन देतो; सध्याचे लेबल तपासा",
    hi: "स्रोत फ़सल और समस्या का समर्थन करता है; मौजूदा लेबल जाँचें",
  },
  treatmentPartial: {
    en: "Some guidance is available, but no crop-specific product or organic practice was supported by a suitable source.",
    mr: "काही मार्गदर्शन उपलब्ध आहे; परंतु योग्य स्रोताने पीक-विशिष्ट उत्पादन किंवा सेंद्रिय पद्धतीला समर्थन दिले नाही.",
    hi: "कुछ मार्गदर्शन उपलब्ध है, लेकिन उपयुक्त स्रोत से फ़सल-विशिष्ट उत्पाद या जैविक तरीके का समर्थन नहीं मिला।",
  },
  treatmentComplete: {
    en: "Each option shown has a relevant source link. Product sources are not a substitute for checking the current label.",
    mr: "दाखवलेल्या प्रत्येक पर्यायासाठी संबंधित स्रोत दुवा आहे. उत्पादनाचा स्रोत सध्याचे लेबल तपासण्याचा पर्याय नाही.",
    hi: "दिखाए गए हर विकल्प के साथ संबंधित स्रोत लिंक है। उत्पाद स्रोत मौजूदा लेबल जाँचने का विकल्प नहीं है।",
  },
  treatmentOrganic: {
    en: "Organic sprays",
    mr: "सेंद्रिय / जैविक पर्याय",
    hi: "जैविक विकल्प",
  },
  treatmentChemical: {
    en: "Inorganic (chemical) sprays",
    mr: "रासायनिक पर्याय",
    hi: "रासायनिक विकल्प",
  },
  treatmentOrganicTab: { en: "Organic", mr: "सेंद्रिय", hi: "जैविक" },
  treatmentInorganicTab: { en: "Inorganic", mr: "रासायनिक", hi: "अकार्बनिक" },
  treatmentMissingCategory: {
    en: "No crop- and condition-specific option in this category could be supported by an authoritative source. No product is being suggested.",
    mr: "या विभागातील पीक व स्थितीसाठीचा पर्याय अधिकृत स्रोताने समर्थित केला नाही. कोणतेही उत्पादन सुचवलेले नाही.",
    hi: "इस श्रेणी में फ़सल और समस्या के लिए किसी विकल्प को आधिकारिक स्रोत का समर्थन नहीं मिला। कोई उत्पाद सुझाया नहीं जा रहा है।",
  },
  treatmentCommercialType: {
    en: "Source-supported product candidate — check current India label and registration",
    mr: "स्रोत-समर्थित उत्पादन पर्याय — सध्याचे भारतीय लेबल व नोंदणी तपासा",
    hi: "स्रोत-समर्थित उत्पाद विकल्प — मौजूदा भारतीय लेबल और पंजीकरण जाँचें",
  },
  treatmentIngredientType: {
    en: "Active ingredient supported by agricultural guidance; no brand or product verified",
    mr: "कृषी मार्गदर्शनाने समर्थित सक्रिय घटक; ब्रँड किंवा उत्पादन पडताळलेले नाही",
    hi: "कृषि मार्गदर्शन से समर्थित सक्रिय तत्व; ब्रांड या उत्पाद सत्यापित नहीं",
  },
  treatmentBiologicalType: {
    en: "Source-supported biological control; not a certification claim",
    mr: "स्रोत-समर्थित जैविक नियंत्रण; प्रमाणपत्राचा दावा नाही",
    hi: "स्रोत-समर्थित जैविक नियंत्रण; प्रमाणन का दावा नहीं",
  },
  treatmentGeneralOrganicType: {
    en: "General organic treatment; confirm suitability locally",
    mr: "सामान्य सेंद्रिय उपचार; स्थानिक पातळीवर योग्यतेची खात्री करा",
    hi: "सामान्य जैविक उपचार; स्थानीय उपयुक्तता की पुष्टि करें",
  },
  treatmentNoOptions: {
    en: "No named commercial product was identified for this section. Do not substitute a generic spray; use the non-chemical guidance above and confirm with your local KVK or agriculture officer.",
    mr: "या विभागासाठी नावासह व्यावसायिक उत्पादन ओळखता आले नाही. सामान्य फवारणीचा पर्याय वापरू नका; वरील विना-रासायनिक मार्गदर्शन वापरा आणि स्थानिक KVK किंवा कृषी अधिकाऱ्यांकडून खात्री करा.",
    hi: "इस अनुभाग के लिए किसी नामित व्यावसायिक उत्पाद की पहचान नहीं हुई। सामान्य स्प्रे का विकल्प न लें; ऊपर दिए गैर-रासायनिक सुझाव अपनाएँ और स्थानीय KVK या कृषि अधिकारी से पुष्टि करें।",
  },
  treatmentNoDirections: {
    en: "Formulation, method, dose, water volume, interval, maximum applications, PPE, pre-harvest interval and re-entry interval are unverified. Do not apply based on this suggestion; follow a current official label and consult a local expert.",
    mr: "फॉर्म्युलेशन, पद्धत, मात्रा, पाण्याचे प्रमाण, अंतर, कमाल फवारण्या, PPE, काढणीपूर्व अंतर आणि पुनःप्रवेश अंतर पडताळलेले नाही. या सूचनेवरून फवारणी करू नका; सध्याचे अधिकृत लेबल पाळा आणि स्थानिक तज्ज्ञांचा सल्ला घ्या.",
    hi: "फ़ॉर्मुलेशन, तरीका, मात्रा, पानी की मात्रा, अंतराल, अधिकतम उपयोग, PPE, कटाई-पूर्व अंतर और पुनःप्रवेश अंतर सत्यापित नहीं हैं। इस सुझाव के आधार पर छिड़काव न करें; मौजूदा आधिकारिक लेबल मानें और स्थानीय विशेषज्ञ से सलाह लें।",
  },
  treatmentDetails: {
    en: "Evidence and safety details",
    mr: "पुरावा व सुरक्षा तपशील",
    hi: "साक्ष्य और सुरक्षा विवरण",
  },
  treatmentRetrievedAt: {
    en: "Search completed",
    mr: "शोध पूर्ण",
    hi: "खोज पूरी हुई",
  },
  activeIngredient: { en: "Active ingredient", mr: "सक्रिय घटक", hi: "सक्रिय तत्व" },
  productBrand: { en: "Brand", mr: "ब्रँड", hi: "ब्रांड" },
  productFormulation: {
    en: "Formulation (source-supported)",
    mr: "फॉर्म्युलेशन (स्रोत-समर्थित)",
    hi: "फॉर्मुलेशन (स्रोत-समर्थित)",
  },
  targetLabel: { en: "For", mr: "यासाठी", hi: "के लिए" },
  precautions: { en: "Precautions", mr: "सावधगिरी", hi: "सावधानियाँ" },
  sourceAi: {
    en: "AI-generated interpretation",
    mr: "AI-निर्मित विश्लेषण",
    hi: "AI-निर्मित व्याख्या",
  },
  sourceAiBody: {
    en: "The crop, likely condition, symptoms and confidence are the vision model's reading of your photo. Treatment research is separate; its retrieved sources are listed below when available.",
    mr: "पीक, संभाव्य स्थिती, लक्षणे व विश्वास हे तुमच्या फोटोवरील vision model चे विश्लेषण आहे. उपचार शोध वेगळा आहे; उपलब्ध स्रोत खाली दिले आहेत.",
    hi: "फ़सल, संभावित स्थिति, लक्षण और विश्वास आपकी फ़ोटो पर vision model का विश्लेषण हैं। उपचार शोध अलग है; उपलब्ध स्रोत नीचे दिए गए हैं।",
  },
  sourceVerified: {
    en: "Retrieved source references",
    mr: "मिळालेले स्रोत संदर्भ",
    hi: "प्राप्त स्रोत संदर्भ",
  },
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
    en: "That photo could not be read. Choose a clear JPG, PNG, WebP or AVIF image.",
    mr: "हा फोटो वाचता आला नाही. स्पष्ट JPG, PNG, WebP किंवा AVIF फोटो निवडा.",
    hi: "यह फ़ोटो पढ़ी नहीं जा सकी। साफ़ JPG, PNG, WebP या AVIF इमेज चुनें।",
  },
  networkError: {
    en: "Analysis could not be completed. Please check your connection and try again.",
    mr: "विश्लेषण पूर्ण होऊ शकले नाही. कृपया इंटरनेट तपासून पुन्हा प्रयत्न करा.",
    hi: "विश्लेषण पूरा नहीं हो सका. कृपया कनेक्शन जाँचकर फिर कोशिश करें.",
  },
  failureBusy: {
    en: "Analysis is temporarily busy. Wait a moment, then retry with the same photo.",
    mr: "विश्लेषण सेवा सध्या व्यस्त आहे. थोडा वेळ थांबून त्याच फोटोसह पुन्हा प्रयत्न करा.",
    hi: "विश्लेषण सेवा अभी व्यस्त है। थोड़ी देर बाद उसी फ़ोटो से फिर कोशिश करें।",
  },
  failureCredits: {
    en: "Analysis is temporarily unavailable. Please try again later.",
    mr: "विश्लेषण सध्या उपलब्ध नाही. कृपया नंतर पुन्हा प्रयत्न करा.",
    hi: "विश्लेषण अभी उपलब्ध नहीं है। कृपया बाद में फिर कोशिश करें।",
  },
  failureSetup: {
    en: "Analysis is not configured correctly on the server. Please contact support.",
    mr: "सर्व्हरवर विश्लेषण योग्यरित्या कॉन्फिगर केलेले नाही. कृपया मदत केंद्राशी संपर्क साधा.",
    hi: "सर्वर पर विश्लेषण सही ढंग से कॉन्फ़िगर नहीं है। कृपया सहायता से संपर्क करें।",
  },
  failureAuth: {
    en: "Your sign-in session needs attention. Sign in again before analysing this photo.",
    mr: "तुमच्या साइन-इन सत्राची पुन्हा पुष्टी आवश्यक आहे. फोटो तपासण्यापूर्वी पुन्हा साइन इन करा.",
    hi: "आपके साइन-इन सत्र की पुष्टि ज़रूरी है। इस फ़ोटो का विश्लेषण करने से पहले फिर साइन इन करें।",
  },
  failureTimeout: {
    en: "Analysis took too long. Your photo is still here; please retry.",
    mr: "विश्लेषणाला जास्त वेळ लागला. तुमचा फोटो येथेच आहे; कृपया पुन्हा प्रयत्न करा.",
    hi: "विश्लेषण में अधिक समय लगा। आपकी फ़ोटो यहीं है; कृपया फिर कोशिश करें।",
  },
  failureInvalidResponse: {
    en: "The analysis service returned an unreadable result. Your photo is safe; please retry.",
    mr: "विश्लेषण सेवेकडून वाचता न येणारा निकाल मिळाला. तुमचा फोटो सुरक्षित आहे; पुन्हा प्रयत्न करा.",
    hi: "विश्लेषण सेवा से पढ़ने योग्य नतीजा नहीं मिला। आपकी फ़ोटो सुरक्षित है; फिर कोशिश करें।",
  },
  failureGeneric: {
    en: "Analysis is temporarily unavailable. Your photo is safe; please check your connection and retry.",
    mr: "विश्लेषण सध्या उपलब्ध नाही. तुमचा फोटो सुरक्षित आहे; इंटरनेट तपासून पुन्हा प्रयत्न करा.",
    hi: "विश्लेषण अभी उपलब्ध नहीं है। आपकी फ़ोटो सुरक्षित है; कनेक्शन जाँचकर फिर कोशिश करें।",
  },
  unusableQuality: {
    en: "The photo quality is not clear enough",
    mr: "फोटोची गुणवत्ता पुरेशी स्पष्ट नाही",
    hi: "फ़ोटो की गुणवत्ता पर्याप्त साफ़ नहीं है",
  },
  unusableNotCrop: {
    en: "A crop plant is not clearly visible",
    mr: "पीक स्पष्टपणे दिसत नाही",
    hi: "फ़सल का पौधा स्पष्ट दिखाई नहीं दे रहा",
  },
  unusableInconclusive: {
    en: "The plant is visible, but the cause is uncertain",
    mr: "पीक दिसत आहे, पण कारण निश्चित नाही",
    hi: "पौधा दिखाई दे रहा है, लेकिन कारण स्पष्ट नहीं है",
  },
  saveError: {
    en: "The analysis could not be saved with its private photo. Please try again; no saved diagnosis was created.",
    mr: "विश्लेषणाचा खाजगी फोटोसह साठवण करता आली नाही. कृपया पुन्हा प्रयत्न करा; निदान इतिहासात साठवलेले नाही.",
    hi: "निजी फ़ोटो के साथ विश्लेषण सहेजा नहीं जा सका। कृपया फिर कोशिश करें; कोई निदान इतिहास में सहेजा नहीं गया।",
  },
  historyTitle: {
    en: "Your earlier checks",
    mr: "तुमच्या आधीच्या तपासण्या",
    hi: "आपकी पिछली जाँचें",
  },
  historyLoading: {
    en: "Loading your saved checks…",
    mr: "तुमच्या तपासण्या उघडत आहे…",
    hi: "आपकी जाँचें खुल रही हैं…",
  },
  historyError: {
    en: "Your saved checks could not be loaded. Please try again.",
    mr: "तुमच्या जतन केलेल्या तपासण्या लोड करता आल्या नाहीत. कृपया पुन्हा प्रयत्न करा.",
    hi: "आपकी सहेजी गई जाँचें लोड नहीं हो सकीं। कृपया फिर कोशिश करें।",
  },
  historyEmpty: {
    en: "Your successful crop checks are saved here privately, so you can compare them later.",
    mr: "तुमच्या यशस्वी तपासण्या येथे खासगीरित्या जतन होतात, नंतर तुलना करता येते.",
    hi: "आपकी सफल जाँचें यहाँ निजी रूप से सुरक्षित रहती हैं, बाद में तुलना कर सकते हैं.",
  },
  historyDelete: { en: "Delete this check", mr: "ही तपासणी हटवा", hi: "यह जाँच हटाएँ" },
  historyPhotoUnavailable: {
    en: "This saved photo could not be reopened. Your diagnosis is still available below.",
    mr: "हा जतन केलेला फोटो पुन्हा उघडता आला नाही. तुमचे निदान खाली उपलब्ध आहे.",
    hi: "यह सहेजी गई फ़ोटो फिर नहीं खुल सकी। आपका निदान नीचे उपलब्ध है।",
  },
} as const;

const langLabel = { en: "English", mr: "मराठी", hi: "हिंदी" } as const;

type TabId = "overview" | "treatment" | "prevention" | "sources";

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
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`diagnose-block rounded-2xl border border-border/70 bg-card/40 p-4 lg:p-5 ${className}`}
    >
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
  const scanRequestIdRef = useRef<string | null>(null);
  const analysisGenerationRef = useRef(0);
  const analysisInFlightRef = useRef(false);
  const refreshedPhotoIdsRef = useRef(new Set<string>());

  const [preview, setPreview] = useState<string | null>(null);
  const [cropHint, setCropHint] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(true);
  const [photoRefreshError, setPhotoRefreshError] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");
  const [treatmentCategory, setTreatmentCategory] = useState<"organic" | "inorganic">("organic");
  const [loadStep, setLoadStep] = useState(0);
  const diagnosis: DiagnosisOk | null = result?.ok && result.usable ? result : null;

  // Rotating status copy while the REAL request is in flight; no fake progress.
  useEffect(() => {
    if (!busy) {
      setLoadStep(0);
      return;
    }
    const id = setInterval(() => setLoadStep((n) => (n + 1) % 3), 2200);
    return () => clearInterval(id);
  }, [busy]);

  const pick = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      const generation = ++analysisGenerationRef.current;
      setBusy(false);
      setError(null);
      setCanRetry(true);
      setResult(null);
      setTab("treatment");
      setTreatmentCategory("organic");
      scanRequestIdRef.current = null;
      setPreview(null);
      setPhotoRefreshError(false);
      try {
        const image = await toCompactCropImageDataUrl(file);
        if (generation === analysisGenerationRef.current) setPreview(image);
      } catch (error) {
        if (generation === analysisGenerationRef.current) {
          setError(
            error instanceof Error && error.message === "IMAGE_TOO_LARGE"
              ? L.imageTooLarge[lang]
              : error instanceof Error && error.message === "UNSUPPORTED_IMAGE"
                ? L.unsupportedImage[lang]
                : L.invalidImage[lang],
          );
        }
      }
    },
    [lang],
  );

  /* -------------------------------------------------- saved history */
  const qc = useQueryClient();
  const listFn = useServerFn(listCropDiagnoses);
  const deleteFn = useServerFn(deleteCropDiagnosis);

  const history = useQuery({
    queryKey: ["crop-diagnoses"],
    queryFn: () => listFn(),
    retry: false,
    staleTime: 60_000,
  });

  const treatmentFn = useServerFn(getDiagnosisTreatmentGuidance);
  const treatmentGuidance = useQuery({
    queryKey: ["diagnosis-treatment", diagnosis?.savedId, lang],
    queryFn: () => {
      if (!diagnosis?.savedId) throw new Error("TREATMENT_DIAGNOSIS_NOT_FOUND");
      return treatmentFn({ data: { diagnosisId: diagnosis.savedId, lang } });
    },
    enabled: Boolean(diagnosis?.savedId),
    retry: false,
    staleTime: 60 * 60_000,
    gcTime: 60 * 60_000,
  });
  const retryAfterMatch =
    treatmentGuidance.error instanceof Error
      ? treatmentGuidance.error.message.match(/(?:^|;)retry_after_ms=(\d+)/)
      : null;
  const retryAfterMs = retryAfterMatch ? Number(retryAfterMatch[1]) : 0;
  const [retryWaitSeconds, setRetryWaitSeconds] = useState(0);
  useEffect(() => {
    if (!Number.isSafeInteger(retryAfterMs) || retryAfterMs <= 0) {
      setRetryWaitSeconds(0);
      return;
    }
    const retryAt = Date.now() + retryAfterMs;
    let timer: number | undefined;
    const updateWait = () => {
      const remainingMs = Math.max(0, retryAt - Date.now());
      setRetryWaitSeconds(Math.ceil(remainingMs / 1000));
      if (remainingMs > 0) {
        timer = window.setTimeout(updateWait, remainingMs > 60_000 ? remainingMs - 60_000 : 1000);
      }
    };
    updateWait();
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [retryAfterMs, treatmentGuidance.error]);
  const diagnosisManagementFallback = diagnosis ? buildDiagnosisManagementFallback(diagnosis) : [];

  const treatmentErrorText = () => {
    const message = treatmentGuidance.error instanceof Error ? treatmentGuidance.error.message : "";
    if (/unauthorized|invalid token|no user id/i.test(message)) {
      return s("treatmentAuthorization");
    }
    if (message.includes("TREATMENT_REQUEST_RATE_LIMITED")) return s("treatmentUsageLimit");
    if (message.includes("TREATMENT_PROVIDER_RATE_LIMITED")) return s("treatmentRateLimit");
    if (
      message.includes("TREATMENT_PROVIDER_INVALID_RESPONSE") ||
      message.includes("TREATMENT_PROVIDER_REQUEST_REJECTED")
    ) {
      return s("treatmentInvalidResponse");
    }
    if (message.includes("TREATMENT_PROVIDER_NOT_CONFIGURED")) return s("treatmentNotConfigured");
    if (message.includes("TREATMENT_PROVIDER_AUTH_FAILED")) return s("treatmentNotConfigured");
    if (
      message.includes("TREATMENT_PROVIDER_TIMEOUT") ||
      message.includes("TREATMENT_PROVIDER_UNAVAILABLE")
    ) {
      return s("treatmentUnavailable");
    }
    return s("treatmentError");
  };
  const treatmentCanRetry = () => {
    const message = treatmentGuidance.error instanceof Error ? treatmentGuidance.error.message : "";
    return !(
      message.includes("TREATMENT_PROVIDER_NOT_CONFIGURED") ||
      message.includes("TREATMENT_PROVIDER_AUTH_FAILED") ||
      message.includes("TREATMENT_PROVIDER_REQUEST_REJECTED") ||
      message.includes("TREATMENT_DIAGNOSIS_NOT_FOUND") ||
      /unauthorized|invalid token|no user id/i.test(message)
    );
  };

  const remove = useMutation({
    mutationFn: (vars: { id: string }) => deleteFn({ data: vars }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["crop-diagnoses"] }),
    onError: () => setError(L.historyError[lang]),
  });

  const openSaved = (h: SavedDiagnosis) => {
    analysisGenerationRef.current += 1;
    setBusy(false);
    setError(null);
    setPreview(h.imageUrl);
    setPhotoRefreshError(false);
    setTab("overview");
    setResult({
      ok: true,
      usable: true,
      savedId: h.id,
      crop: h.crop ?? "",
      condition: h.condition ?? "",
      confidence: h.confidence,
      severity: h.severity,
      symptoms: h.symptoms,
      causes: h.causes,
      conditionsFavouring: [],
      sprayRecommendations: h.sprayRecommendations,
      whatItIs: h.whatItIs ?? "",
      whyItHappens: h.whyItHappens ?? "",
      whatToDoNow: h.whatToDoNow,
      prevention: h.prevention,
      monitoring: h.monitoring,
      uncertaintyNote: h.uncertaintyNote,
      analysedAt: h.createdAt,
      model: "saved",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const run = async () => {
    if (analysisInFlightRef.current || !preview || !preview.startsWith("data:")) {
      return;
    }
    analysisInFlightRef.current = true;
    const generation = analysisGenerationRef.current;
    const image = preview;
    const requestedCropHint = cropHint;
    const requestId = (scanRequestIdRef.current ??= crypto.randomUUID());
    setBusy(true);
    setError(null);
    setCanRetry(true);
    setResult(null);
    track("diagnose_started", { label: cropHint || null });
    try {
      const data = await diagnoseCropImage({
        data: {
          requestId,
          image,
          lang,
          ...(requestedCropHint ? { cropHint: requestedCropHint } : {}),
        },
      });
      if (generation !== analysisGenerationRef.current) return;
      setResult(data);
      setTab(data.ok && data.usable ? "treatment" : "overview");
      setTreatmentCategory("organic");
      track(data.ok ? "diagnose_completed" : "diagnose_failed", {
        label: requestedCropHint || null,
      });
      if (!data.ok) {
        setCanRetry(
          data.reason === "busy" ||
            data.reason === "timeout" ||
            data.reason === "unavailable" ||
            data.reason === "invalid_response",
        );
        setError(
          data.reason === "busy"
            ? L.failureBusy[lang]
            : data.reason === "no_credits"
              ? L.failureCredits[lang]
              : data.reason === "not_configured"
                ? L.failureSetup[lang]
                : data.reason === "timeout"
                  ? L.failureTimeout[lang]
                  : data.reason === "invalid_response"
                    ? L.failureInvalidResponse[lang]
                    : L.failureGeneric[lang],
        );
      } else {
        if (data.usable) scanRequestIdRef.current = null;
        void qc.invalidateQueries({ queryKey: ["crop-diagnoses"] });
      }
    } catch (error) {
      track("diagnose_failed");
      if (generation !== analysisGenerationRef.current) return;
      const message = error instanceof Error ? error.message : "";
      const needsAuthentication = /unauthorized|invalid token|no user id/i.test(message);
      const invalidImage = message === "INVALID_CROP_IMAGE";
      setCanRetry(!needsAuthentication && !invalidImage);
      setError(
        needsAuthentication
          ? L.failureAuth[lang]
          : error instanceof Error && error.message === "DIAGNOSIS_SAVE_FAILED"
            ? L.saveError[lang]
            : invalidImage
              ? L.invalidImage[lang]
              : L.networkError[lang],
      );
    } finally {
      analysisInFlightRef.current = false;
      if (generation === analysisGenerationRef.current) setBusy(false);
    }
  };

  const reset = () => {
    analysisGenerationRef.current += 1;
    setBusy(false);
    setPreview(null);
    setResult(null);
    setError(null);
    setPhotoRefreshError(false);
    setCanRetry(true);
    scanRequestIdRef.current = null;
    setTab("overview");
    if (cameraRef.current) cameraRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const tabs = [
    { id: "overview" as const, label: s("diseaseSection"), icon: Stethoscope },
    { id: "treatment" as const, label: s("organicSection"), icon: FlaskConical },
    { id: "prevention" as const, label: s("spraySection"), icon: Leaf },
    { id: "sources" as const, label: s("sourcesTab"), icon: BookOpen },
  ];

  const uploader = (
    <section className="diagnose-uploader card-surface p-4 sm:p-5 lg:p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold">
        <Stethoscope className="size-4 text-primary" />
        {s("aiAnalysis")}
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground lg:text-sm">
        {s("intro")}
      </p>
      {photoRefreshError && (
        <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed text-muted-foreground">
          {s("historyPhotoUnavailable")}
        </p>
      )}

      {preview ? (
        <div className="diagnose-photo animate-scale-in relative mt-4 overflow-hidden rounded-2xl border border-border/70">
          <img
            src={preview}
            alt="Crop photo selected for analysis"
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] max-h-[240px] w-full object-cover sm:max-h-[280px] lg:aspect-[4/3] lg:h-auto lg:max-h-none"
            onError={() => {
              const diagnosisId = diagnosis?.savedId;
              if (!diagnosisId || refreshedPhotoIdsRef.current.has(diagnosisId)) return;
              refreshedPhotoIdsRef.current.add(diagnosisId);
              void listFn()
                .then((saved) => {
                  qc.setQueryData(["crop-diagnoses"], saved);
                  const refreshed = saved.find((item) => item.id === diagnosisId);
                  if (refreshed?.imageUrl) setPreview(refreshed.imageUrl);
                  else {
                    setPreview(null);
                    setPhotoRefreshError(true);
                  }
                })
                .catch(() => {
                  setPreview(null);
                  setPhotoRefreshError(true);
                });
            }}
          />
          <div className="absolute right-2 top-2 flex gap-2">
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="press min-h-10 rounded-full bg-background/90 px-3 text-xs font-bold shadow-sm backdrop-blur transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {s("change")}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label={s("remove")}
              className="press grid size-10 place-items-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
          className={`diagnose-dropzone mt-4 grid min-h-32 cursor-pointer place-items-center rounded-2xl border border-dashed px-4 py-5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-5 lg:min-h-52 lg:py-8 ${
            dragging
              ? "border-primary bg-primary/8"
              : "border-border/80 bg-muted/40 hover:border-primary/60"
          }`}
        >
          <UploadCloud className="size-7 text-primary/80" />
          <p className="mt-3 max-w-md text-sm font-semibold">{s("emptyTitle")}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">{s("dropHint")}</p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="press flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-sm"
        >
          <Camera className="size-4" />
          {s("camera")}
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="press flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2.5 text-xs font-bold text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-sm"
        >
          <ImageIcon className="size-4" />
          {s("gallery")}
        </button>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        capture="environment"
        className="sr-only"
        aria-label={s("camera")}
        onChange={(e) => void pick(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
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
        onChange={(e) => {
          setCropHint(e.target.value);
          scanRequestIdRef.current = null;
          if (busy) {
            analysisGenerationRef.current += 1;
            setBusy(false);
          }
        }}
        className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        disabled={!preview || busy || analysisInFlightRef.current}
        onClick={() => void run()}
        className="press mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {busy ? s("analysing") : preview ? s("analyse") : s("pickFirst")}
      </button>

      {!preview && (
        <details className="mt-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5">
          <summary className="min-h-8 cursor-pointer text-xs font-bold text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {s("tips")}
          </summary>
          <ul className="mt-2 space-y-1.5">
            {[s("tip1"), s("tip2"), s("tip3"), s("tip4")].map((tip) => (
              <li key={tip} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );

  const renderTreatmentOptions = (options: TreatmentRecommendation[]) =>
    options.length === 0 ? (
      <p className="text-sm leading-relaxed text-muted-foreground">{s("treatmentNoOptions")}</p>
    ) : (
      <div className="space-y-3">
        {options.map((recommendation, index) => (
          <article
            key={`${recommendation.sourceUrl}-${index}`}
            className="rounded-2xl border border-border/70 p-4"
          >
            <p className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {recommendation.recommendationType === "commercial_product"
                ? s("treatmentCommercialType")
                : recommendation.recommendationType === "biological_control"
                  ? s("treatmentBiologicalType")
                  : recommendation.recommendationType === "general_organic_treatment"
                    ? s("treatmentGeneralOrganicType")
                    : s("treatmentIngredientType")}
            </p>
            <h3 className="mt-3 text-base font-bold">{recommendation.productName}</h3>
            {recommendation.brand && (
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{s("productBrand")}:</span>{" "}
                {recommendation.brand}
              </p>
            )}
            {recommendation.activeIngredient && (
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{s("activeIngredient")}:</span>{" "}
                {recommendation.activeIngredient}
              </p>
            )}
            {recommendation.formulation && (
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{s("productFormulation")}:</span>{" "}
                {recommendation.formulation}
              </p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{s("targetLabel")}:</span>{" "}
              {recommendation.targetCrop} — {recommendation.targetCondition}
            </p>
            <p className="mt-3 text-sm leading-relaxed">{recommendation.rationale}</p>
            {recommendation.sourceUrl && recommendation.sourceName && (
              <a
                href={recommendation.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-primary underline"
              >
                {recommendation.sourceName}
              </a>
            )}
            <details className="mt-3 rounded-xl border border-border/70 p-3">
              <summary className="cursor-pointer text-sm font-semibold">
                {s("treatmentDetails")}
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {s("treatmentNoDirections")}
              </p>
              {recommendation.precautions.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-bold">{s("precautions")}</p>
                  <Bullets items={recommendation.precautions} empty={s("noInfo")} />
                </div>
              )}
            </details>
          </article>
        ))}
      </div>
    );

  const tabContent = (d: DiagnosisOk) => {
    switch (tab) {
      case "overview":
        return (
          <div className="space-y-3">
            <Block title={s("observed")}>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-muted-foreground">{s("symptoms")}</p>
                  <Bullets items={d.symptoms} empty={s("noInfo")} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">{s("evidence")}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {d.whyItHappens || d.whatItIs || s("noInfo")}
                  </p>
                </div>
                {d.causes.length > 0 && (
                  <details className="rounded-xl border border-border/70 p-3">
                    <summary className="cursor-pointer text-sm font-semibold">
                      {s("otherPossibilities")}
                    </summary>
                    <div className="mt-2">
                      <Bullets items={d.causes} empty={s("noInfo")} />
                    </div>
                  </details>
                )}
              </div>
            </Block>
            <Block title={s("nextSteps")}>
              {d.whatToDoNow.length === 0 ? (
                <p className="text-sm leading-relaxed text-muted-foreground">{s("noInfo")}</p>
              ) : (
                <ol className="space-y-2.5">
                  {d.whatToDoNow.map((step, index) => (
                    <li
                      key={`${index}-${step}`}
                      className="flex items-start gap-3 text-sm leading-relaxed"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Block>
          </div>
        );
      case "treatment":
        return (
          <div className="space-y-3">
            {treatmentGuidance.isFetching && (
              <div
                role="status"
                aria-live="polite"
                className="flex min-h-14 items-center gap-2 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground"
              >
                <Loader2 className="size-4 animate-spin" />
                {s("treatmentLoading")}
              </div>
            )}
            {treatmentGuidance.isError &&
              !treatmentGuidance.isFetching &&
              !treatmentGuidance.data && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 p-3 text-sm">
                  <p role="status" className="min-w-0 flex-1 leading-relaxed text-muted-foreground">
                    {treatmentErrorText()}
                  </p>
                  {diagnosis?.savedId && treatmentCanRetry() && (
                    <button
                      type="button"
                      disabled={treatmentGuidance.isFetching || retryWaitSeconds > 0}
                      onClick={() => void treatmentGuidance.refetch()}
                      className="press inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {treatmentGuidance.isFetching
                        ? s("treatmentLoading")
                        : retryWaitSeconds > 0
                          ? s("treatmentRetryWait").replace("{seconds}", String(retryWaitSeconds))
                          : s("treatmentRetry")}
                    </button>
                  )}
                </div>
              )}
            {!diagnosis?.savedId && (
              <p className="rounded-2xl border border-border/70 p-3 text-sm text-muted-foreground">
                {s("treatmentNeedsSaved")}
              </p>
            )}
            <Block title={s("nonChemicalSteps")} className="diagnose-care">
              {treatmentGuidance.data?.generalCare.length ? (
                <Bullets items={treatmentGuidance.data.generalCare} empty={s("noInfo")} />
              ) : (
                <Bullets items={diagnosisManagementFallback} empty={s("noInfo")} />
              )}
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {s("treatmentNote")}
              </p>
            </Block>
            <div
              role="tablist"
              aria-label={s("organicSection")}
              className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-muted/30 p-1"
            >
              {(
                [
                  ["organic", s("treatmentOrganicTab")],
                  ["inorganic", s("treatmentInorganicTab")],
                ] as const
              ).map(([category, label]) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-controls="treatment-category-panel"
                  aria-selected={treatmentCategory === category}
                  onClick={() => setTreatmentCategory(category)}
                  className={`min-h-11 rounded-lg px-3 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    treatmentCategory === category
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div id="treatment-category-panel" role="tabpanel" className="space-y-3">
              {treatmentCategory === "organic" ? (
                <>
                  {treatmentGuidance.data?.organicBiological.length ? (
                    <Block title={s("treatmentOrganic")} className="diagnose-organic">
                      {renderTreatmentOptions(treatmentGuidance.data.organicBiological)}
                    </Block>
                  ) : null}
                  {treatmentGuidance.data?.organicManagement.length ? (
                    <Block title={s("treatmentOrganicNatural")} className="diagnose-organic">
                      <div className="space-y-3">
                        {treatmentGuidance.data.organicManagement.map((item) => (
                          <article
                            key={`${item.sourceUrl}-${item.name}`}
                            className="rounded-2xl border border-border/70 p-4"
                          >
                            <p className="text-sm font-bold">{item.name}</p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              {item.rationale}
                            </p>
                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                              {item.limitations}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {item.targetCrop} — {item.targetCondition}
                            </p>
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-sm font-semibold text-primary underline"
                            >
                              {item.sourceName}
                            </a>
                          </article>
                        ))}
                      </div>
                    </Block>
                  ) : null}
                  {treatmentGuidance.data &&
                    treatmentGuidance.data.organicBiological.length === 0 &&
                    treatmentGuidance.data.organicManagement.length === 0 && (
                      <p className="rounded-xl border border-border/70 p-3 text-sm leading-relaxed text-muted-foreground">
                        {s("treatmentMissingCategory")}
                      </p>
                    )}
                </>
              ) : treatmentGuidance.data?.chemical.length ? (
                <Block title={s("treatmentChemical")} className="diagnose-chemical">
                  {renderTreatmentOptions(treatmentGuidance.data.chemical)}
                </Block>
              ) : treatmentGuidance.data ? (
                <p className="rounded-xl border border-border/70 p-3 text-sm leading-relaxed text-muted-foreground">
                  {s("treatmentMissingCategory")}
                </p>
              ) : null}
            </div>
            {treatmentGuidance.data?.sourceStatus === "no_authoritative_sources" && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {s("treatmentPartial")}
              </p>
            )}
            {treatmentGuidance.data?.sourceStatus === "sources_found" &&
              (treatmentGuidance.data.organicManagement.length > 0 ||
                treatmentGuidance.data.organicBiological.length > 0 ||
                treatmentGuidance.data.chemical.length > 0) && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {s("treatmentComplete")}
                </p>
              )}
            {treatmentGuidance.data?.sourceStatus === "sources_found" &&
              !treatmentGuidance.data.organicManagement.length &&
              !treatmentGuidance.data.organicBiological.length &&
              !treatmentGuidance.data.chemical.length && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {s("treatmentPartial")}
                </p>
              )}
          </div>
        );
      case "prevention":
        return (
          <div className="space-y-3">
            <Block title={s("prevention")} className="diagnose-care">
              <Bullets items={d.prevention} empty={s("noInfo")} />
            </Block>
            <Block title={s("monitoring")} className="diagnose-care">
              <Bullets items={d.monitoring} empty={s("noInfo")} />
            </Block>
            <p className="rounded-3xl border border-border/70 p-4 text-xs leading-relaxed text-muted-foreground">
              {s("disclaimer")}
            </p>
          </div>
        );
      case "sources":
        return (
          <div className="space-y-3">
            <Block title={s("sourceAi")}>
              <p className="text-sm leading-relaxed text-muted-foreground">{s("sourceAiBody")}</p>
            </Block>
            <Block title={s("sourceVerified")}>
              {treatmentGuidance.isLoading ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s("treatmentLoading")}
                </p>
              ) : !diagnosis?.savedId ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s("treatmentNeedsSaved")}
                </p>
              ) : treatmentGuidance.isError ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {s("treatmentError")}
                  </p>
                  {treatmentCanRetry() && (
                    <button
                      type="button"
                      onClick={() => void treatmentGuidance.refetch()}
                      className="press rounded-lg underline"
                    >
                      {s("treatmentRetry")}
                    </button>
                  )}
                </div>
              ) : treatmentGuidance.data?.sources.length ? (
                <>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {s("treatmentRetrievedAt")}:{" "}
                    {new Intl.DateTimeFormat(
                      lang === "mr" ? "mr-IN" : lang === "hi" ? "hi-IN" : "en-IN",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Kolkata",
                      },
                    ).format(new Date(treatmentGuidance.data.retrievedAt))}
                  </p>
                  <ul className="space-y-2">
                    {treatmentGuidance.data.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary underline"
                        >
                          {source.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s("sourcesUnavailable")}
                </p>
              )}
            </Block>
            <p className="rounded-3xl border border-border/70 p-4 text-sm leading-relaxed text-muted-foreground">
              {s("askExpert")}
            </p>
          </div>
        );
    }
  };

  return (
    <Screen className="sm:max-w-3xl">
      <TopBar
        title={s("title")}
        subtitle={s("subtitle")}
        back="/home"
        className="lg:hidden"
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

      <div className="diagnose-page px-4 pb-8 pt-4 sm:px-5 lg:px-0 lg:pt-7">
        {/* Desktop workspace header */}
        <header className="diagnose-workspace-title mb-6 hidden items-end justify-between gap-6 rounded-2xl border border-border/70 p-5 backdrop-blur-[20px] backdrop-saturate-[180%] lg:flex">
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

        <div className="diagnose-workspace grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(320px,0.86fr)_minmax(0,1.14fr)] lg:items-start lg:gap-6">
          <div className="min-w-0 lg:sticky lg:top-6">{uploader}</div>

          <div className="min-w-0 space-y-4">
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
                  {preview && canRetry && (
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
                  {result.issueType === "not_crop"
                    ? s("unusableNotCrop")
                    : result.issueType === "inconclusive"
                      ? s("unusableInconclusive")
                      : s("unusableQuality")}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {result.imageIssues.map((issue) => (
                    <li
                      key={issue}
                      className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {result.advice}
                </p>
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
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s("emptyTitle")}
                  </p>
                </div>
              </div>
            )}

            {!busy && diagnosis && (
              <div className="diagnose-results animate-fade-in space-y-4">
                <div className="diagnose-summary card-surface p-4 sm:p-5 lg:p-6">
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
                        {(diagnosis.uncertaintyNote || (diagnosis.confidence ?? 100) < 70) && (
                          <span className="mr-1 text-sm font-semibold text-muted-foreground">
                            {s("likely")}
                          </span>
                        )}
                        {diagnosis.condition}
                      </p>
                      {diagnosis.severity && (
                        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold">
                          <Thermometer className="size-3.5 text-primary" />
                          {s("severity")}: {diagnosis.severity}
                        </p>
                      )}
                    </div>
                    {diagnosis.confidence !== null && (
                      <ConfidenceDial
                        value={diagnosis.confidence}
                        label={s("confidence")}
                        note={s("confidenceNote")}
                      />
                    )}
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
                  onKeyDown={(event) => {
                    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
                    if (!keys.includes(event.key)) return;
                    event.preventDefault();
                    const buttons = Array.from(
                      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
                    );
                    const currentIndex = buttons.findIndex(
                      (button) => button === event.currentTarget.ownerDocument.activeElement,
                    );
                    const nextIndex =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? buttons.length - 1
                          : (currentIndex +
                              (event.key === "ArrowRight" ? 1 : -1) +
                              buttons.length) %
                            buttons.length;
                    buttons[nextIndex]?.focus();
                    buttons[nextIndex]?.click();
                  }}
                  className="diagnose-tabs flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible"
                >
                  {tabs.map(({ id, label, icon: Icon }) => {
                    const active = tab === id;
                    return (
                      <button
                        key={id}
                        role="tab"
                        id={`diagnosis-tab-${id}`}
                        aria-controls="diagnosis-panel"
                        type="button"
                        aria-selected={active}
                        tabIndex={active ? 0 : -1}
                        onClick={() => setTab(id)}
                        className={`press flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                          active
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border/70 bg-card text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="size-3.5" />
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div
                  key={tab}
                  id="diagnosis-panel"
                  role="tabpanel"
                  aria-labelledby={`diagnosis-tab-${tab}`}
                  tabIndex={0}
                  className="diagnose-tab-panel animate-fade-in space-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
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

        {/* ---------------------------------------------- saved history */}
        <section className="diagnose-history mt-8 border-t border-border/70 pt-5">
          <div className="flex items-center gap-2">
            <HistoryIcon className="size-4 text-primary" />
            <h2 className="font-display text-base font-bold">{s("historyTitle")}</h2>
          </div>
          {history.isLoading ? (
            <p className="mt-2 text-sm text-muted-foreground">{s("historyLoading")}</p>
          ) : history.isError ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-destructive">
              <span>{s("historyError")}</span>
              <button
                type="button"
                onClick={() => void history.refetch()}
                className="press rounded-lg underline"
              >
                {s("retry")}
              </button>
            </div>
          ) : (history.data?.length ?? 0) === 0 ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {s("historyEmpty")}
            </p>
          ) : (
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {history.data?.map((h) => (
                <li key={h.id} className="group card-surface flex min-w-0 items-center gap-3 p-3">
                  <button
                    type="button"
                    onClick={() => openSaved(h)}
                    className="press flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    {h.imageUrl ? (
                      <img
                        src={h.imageUrl}
                        alt={h.condition ?? s("historyTitle")}
                        loading="lazy"
                        className="size-14 shrink-0 rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-muted">
                        <Leaf className="size-5 text-primary/70" />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{h.condition}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {h.crop} ·{" "}
                        {new Date(h.createdAt).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                        {h.confidence ? ` · ${h.confidence}%` : ""}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={s("historyDelete")}
                    onClick={() => remove.mutate({ id: h.id })}
                    className="press grid size-8 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Screen>
  );
}
