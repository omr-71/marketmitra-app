import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "./data";

const dict = {
  tagline: {
    en: "Sell Smarter. Earn Better.",
    mr: "हुशारीने विका. जास्त कमवा.",
    hi: "समझदारी से बेचें. ज़्यादा कमाएँ.",
  },
  continue: { en: "Continue", mr: "पुढे", hi: "आगे बढ़ें" },
  getStarted: { en: "Get Started", mr: "सुरू करा", hi: "शुरू करें" },
  login: { en: "Login", mr: "लॉगिन", hi: "लॉगिन" },
  signup: { en: "Sign Up", mr: "नोंदणी", hi: "साइन अप" },
  phone: { en: "Phone number", mr: "मोबाइल नंबर", hi: "मोबाइल नंबर" },
  fullName: { en: "Full name", mr: "पूर्ण नाव", hi: "पूरा नाम" },
  language: { en: "Language", mr: "भाषा", hi: "भाषा" },
  sendOtp: { en: "Send OTP", mr: "OTP पाठवा", hi: "OTP भेजें" },
  otpHint: {
    en: "We'll send a 6-digit code to verify your number.",
    mr: "तुमचा नंबर पडताळण्यासाठी ६ अंकी कोड पाठवला जाईल.",
    hi: "आपका नंबर सत्यापित करने के लिए 6 अंकों का कोड भेजा जाएगा.",
  },
  welcome: { en: "Welcome back", mr: "पुन्हा स्वागत", hi: "पुनः स्वागत" },
  home: { en: "Home", mr: "होम", hi: "होम" },
  markets: { en: "Markets", mr: "बाजार", hi: "मंडी" },
  weather: { en: "Weather", mr: "हवामान", hi: "मौसम" },
  schemes: { en: "Schemes", mr: "योजना", hi: "योजनाएँ" },
  profile: { en: "Profile", mr: "प्रोफाइल", hi: "प्रोफ़ाइल" },
  todayPrices: { en: "Today's crop prices", mr: "आजचे पीक दर", hi: "आज के फसल भाव" },
  quickActions: { en: "Quick actions", mr: "झटपट क्रिया", hi: "क्विक एक्शन" },
  aiRecommendation: { en: "AI Recommendation", mr: "AI शिफारस", hi: "AI सिफ़ारिश" },
  selectCrop: { en: "Select crop", mr: "पीक निवडा", hi: "फसल चुनें" },
  quantity: { en: "Quantity", mr: "प्रमाण", hi: "मात्रा" },
  compareMarkets: { en: "Compare markets", mr: "बाजार तुलना", hi: "मंडी तुलना" },
  bestChoice: { en: "Best Choice", mr: "सर्वोत्तम पर्याय", hi: "सर्वोत्तम विकल्प" },
  price: { en: "Price", mr: "दर", hi: "भाव" },
  distance: { en: "Distance", mr: "अंतर", hi: "दूरी" },
  transport: { en: "Transport", mr: "वाहतूक", hi: "परिवहन" },
  netProfit: { en: "Net profit", mr: "निव्वळ नफा", hi: "शुद्ध लाभ" },
  pricePrediction: { en: "AI Price Prediction", mr: "AI दर अंदाज", hi: "AI भाव अनुमान" },
  demand: { en: "Demand", mr: "मागणी", hi: "मांग" },
  travelTime: { en: "Travel time", mr: "प्रवास वेळ", hi: "यात्रा समय" },
  priceHistory: { en: "Price history", mr: "दर इतिहास", hi: "भाव इतिहास" },
  rainAlert: { en: "Rain alert", mr: "पावसाचा इशारा", hi: "बारिश की चेतावनी" },
  harvestAdvice: { en: "Harvest advice", mr: "कापणी सल्ला", hi: "कटाई सलाह" },
  eligible: { en: "Eligible", mr: "पात्र", hi: "पात्र" },
  notEligible: { en: "Check eligibility", mr: "पात्रता तपासा", hi: "पात्रता देखें" },
  savedCrops: { en: "Saved crops", mr: "जतन केलेली पिके", hi: "सहेजी फसलें" },
  sellingHistory: { en: "Selling history", mr: "विक्री इतिहास", hi: "बिक्री इतिहास" },
  viewAll: { en: "View all", mr: "सर्व पहा", hi: "सभी देखें" },
  perQuintal: { en: "per quintal", mr: "प्रति क्विंटल", hi: "प्रति क्विंटल" },
} as const;

export type DictKey = keyof typeof dict;

const langNames: Record<Lang, string> = { en: "English", mr: "मराठी", hi: "हिंदी" };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: DictKey) => string };
const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => dict[k].en });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("mm-lang") as Lang | null;
    if (stored === "en" || stored === "mr" || stored === "hi") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("mm-lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: (k) => dict[k][lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
export { langNames };
