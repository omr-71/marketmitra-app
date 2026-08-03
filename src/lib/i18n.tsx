import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "./crops";

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
  email: { en: "Email address", mr: "ईमेल पत्ता", hi: "ईमेल पता" },
  fullName: { en: "Full name", mr: "पूर्ण नाव", hi: "पूरा नाम" },
  language: { en: "Language", mr: "भाषा", hi: "भाषा" },
  sendOtp: { en: "Send OTP", mr: "OTP पाठवा", hi: "OTP भेजें" },
  otpHint: {
    en: "We'll email you a 6-digit code to verify your account.",
    mr: "पडताळणीसाठी ६ अंकी कोड तुमच्या ईमेलवर पाठवला जाईल.",
    hi: "सत्यापन के लिए 6 अंकों का कोड आपके ईमेल पर भेजा जाएगा.",
  },
  welcome: { en: "Welcome back", mr: "पुन्हा स्वागत", hi: "पुनः स्वागत" },
  home: { en: "Home", mr: "होम", hi: "होम" },
  markets: { en: "Markets", mr: "बाजार", hi: "मंडी" },
  weather: { en: "Weather", mr: "हवामान", hi: "मौसम" },
  schemes: { en: "Schemes", mr: "योजना", hi: "योजनाएँ" },
  profile: { en: "Profile", mr: "प्रोफाइल", hi: "प्रोफ़ाइल" },
  todayPrices: { en: "Today's crop prices", mr: "आजचे पीक दर", hi: "आज के फसल भाव" },
  quickActions: { en: "Quick actions", mr: "झटपट क्रिया", hi: "क्विक एक्शन" },
  aiRecommendation: { en: "Top market today", mr: "आजचा सर्वोत्तम बाजार", hi: "आज का सर्वोत्तम मंडी" },
  selectCrop: { en: "Select crop", mr: "पीक निवडा", hi: "फसल चुनें" },
  quantity: { en: "Quantity", mr: "प्रमाण", hi: "मात्रा" },
  compareMarkets: { en: "Compare markets", mr: "बाजार तुलना", hi: "मंडी तुलना" },
  bestChoice: { en: "Best Choice", mr: "सर्वोत्तम पर्याय", hi: "सर्वोत्तम विकल्प" },
  price: { en: "Price", mr: "दर", hi: "भाव" },
  distance: { en: "Distance", mr: "अंतर", hi: "दूरी" },
  transport: { en: "Transport", mr: "वाहतूक", hi: "परिवहन" },
  netProfit: { en: "Net profit", mr: "निव्वळ नफा", hi: "शुद्ध लाभ" },
  pricePrediction: { en: "Price Prediction", mr: "दर अंदाज", hi: "भाव अनुमान" },
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
  village: { en: "Village", mr: "गाव", hi: "गाँव" },
  verifyNumber: { en: "Verify your number", mr: "नंबर पडताळा", hi: "नंबर सत्यापित करें" },
  otpSentTo: { en: "We sent a 6-digit code to", mr: "६ अंकी कोड पाठवला", hi: "6 अंकों का कोड भेजा" },
  enterOtp: { en: "Enter the 6-digit code", mr: "६ अंकी कोड टाका", hi: "6 अंकों का कोड डालें" },
  verifyOtp: { en: "Verify & Continue", mr: "पडताळा आणि पुढे", hi: "सत्यापित करें" },
  resendOtp: { en: "Resend code", mr: "कोड पुन्हा पाठवा", hi: "कोड फिर भेजें" },
  changeNumber: { en: "Change number", mr: "नंबर बदला", hi: "नंबर बदलें" },
  codeExpires: { en: "Code expires in", mr: "कोड संपेल", hi: "कोड समाप्त होगा" },
  codeExpired: { en: "Code expired. Request a new one.", mr: "कोड संपला. नवीन मागवा.", hi: "कोड समाप्त. नया लें." },
  demoCode: { en: "Your verification code", mr: "तुमचा पडताळणी कोड", hi: "आपका सत्यापन कोड" },
  smsPending: {
    en: "SMS delivery activates once an SMS gateway is connected.",
    mr: "SMS गेटवे जोडल्यावर संदेश पाठवला जाईल.",
    hi: "SMS गेटवे जुड़ने पर संदेश भेजा जाएगा.",
  },
  privacyNote: {
    en: "Your data stays private and encrypted",
    mr: "तुमची माहिती सुरक्षित आणि एनक्रिप्टेड राहते",
    hi: "आपका डेटा निजी और एन्क्रिप्टेड रहता है",
  },
  logout: { en: "Log out", mr: "बाहेर पडा", hi: "लॉग आउट" },
  lastUpdated: { en: "Last updated", mr: "शेवटचे अद्यतन", hi: "अंतिम अपडेट" },
  loading: { en: "Loading…", mr: "लोड होत आहे…", hi: "लोड हो रहा है…" },
  retry: { en: "Try again", mr: "पुन्हा प्रयत्न", hi: "फिर कोशिश करें" },
  yourLocation: { en: "Your location", mr: "तुमचे स्थान", hi: "आपका स्थान" },
  useMyLocation: { en: "Use my location", mr: "माझे स्थान वापरा", hi: "मेरा स्थान उपयोग करें" },
  chooseDistrict: { en: "Choose state & district", mr: "राज्य व जिल्हा निवडा", hi: "राज्य व ज़िला चुनें" },
  state: { en: "State", mr: "राज्य", hi: "राज्य" },
  district: { en: "District", mr: "जिल्हा", hi: "ज़िला" },
  save: { en: "Save", mr: "जतन करा", hi: "सहेजें" },
  noPrices: {
    en: "No mandi prices reported for this crop and district yet.",
    mr: "या पिकासाठी व जिल्ह्यासाठी बाजारभाव उपलब्ध नाहीत.",
    hi: "इस फसल और ज़िले के लिए मंडी भाव उपलब्ध नहीं हैं.",
  },
  searchMarket: { en: "Search market or district", mr: "बाजार किंवा जिल्हा शोधा", hi: "मंडी या ज़िला खोजें" },
  minPrice: { en: "Min", mr: "किमान", hi: "न्यूनतम" },
  maxPrice: { en: "Max", mr: "कमाल", hi: "अधिकतम" },
  modalPrice: { en: "Modal", mr: "सरासरी", hi: "मॉडल" },
  transportRate: { en: "Transport cost per quintal", mr: "प्रति क्विंटल वाहतूक खर्च", hi: "प्रति क्विंटल परिवहन लागत" },
  commissionRate: { en: "Mandi commission", mr: "बाजार कमिशन", hi: "मंडी कमीशन" },
  forecastUnavailable: { en: "Forecast not available yet", mr: "अंदाज अजून उपलब्ध नाही", hi: "अनुमान अभी उपलब्ध नहीं" },
  confidence: { en: "Confidence", mr: "विश्वास", hi: "विश्वास" },
  explanation: { en: "Why", mr: "कारण", hi: "कारण" },
  sellNow: { en: "Sell now", mr: "आता विका", hi: "अभी बेचें" },
  hold: { en: "Hold stock", mr: "साठा ठेवा", hi: "स्टॉक रोकें" },
  sunrise: { en: "Sunrise", mr: "सूर्योदय", hi: "सूर्योदय" },
  sunset: { en: "Sunset", mr: "सूर्यास्त", hi: "सूर्यास्त" },
  humidity: { en: "Humidity", mr: "आर्द्रता", hi: "नमी" },
  wind: { en: "Wind", mr: "वारा", hi: "हवा" },
  rainChance: { en: "Rain chance", mr: "पावसाची शक्यता", hi: "बारिश की संभावना" },
  sevenDay: { en: "7-day forecast", mr: "७ दिवसांचा अंदाज", hi: "7-दिन का पूर्वानुमान" },
  locationNeeded: {
    en: "Share your location or pick your district to see live data.",
    mr: "थेट माहितीसाठी स्थान द्या किंवा जिल्हा निवडा.",
    hi: "लाइव जानकारी के लिए स्थान दें या ज़िला चुनें.",
  },
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
