import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "./crops";
export type { Lang };

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
  settings: { en: "Settings", mr: "सेटिंग्ज", hi: "सेटिंग्स" },
  home: { en: "Home", mr: "होम", hi: "होम" },
  markets: { en: "Markets", mr: "बाजार", hi: "मंडी" },
  weather: { en: "Weather", mr: "हवामान", hi: "मौसम" },
  schemes: { en: "Schemes", mr: "योजना", hi: "योजनाएँ" },
  farmerBenefits: { en: "Farmer benefits", mr: "शेतकरी लाभ", hi: "किसान लाभ" },
  schemesTitle: {
    en: "Government schemes & subsidies",
    mr: "सरकारी योजना आणि अनुदाने",
    hi: "सरकारी योजनाएँ और सब्सिडी",
  },
  schemesSearch: {
    en: "Search schemes or benefits",
    mr: "योजना किंवा लाभ शोधा",
    hi: "योजना या लाभ खोजें",
  },
  allSchemes: { en: "All schemes", mr: "सर्व योजना", hi: "सभी योजनाएँ" },
  filters: { en: "Filters", mr: "फिल्टर", hi: "फ़िल्टर" },
  governmentLevel: { en: "Government", mr: "सरकार", hi: "सरकार" },
  sort: { en: "Sort", mr: "क्रमवारी", hi: "क्रमबद्ध करें" },
  relevance: { en: "Relevance", mr: "महत्त्व", hi: "प्रासंगिकता" },
  schemeName: { en: "Scheme name", mr: "योजनेचे नाव", hi: "योजना का नाम" },
  viewDetails: { en: "View details", mr: "तपशील पहा", hi: "विवरण देखें" },
  noSchemes: {
    en: "No schemes match these filters.",
    mr: "या फिल्टरशी जुळणारी योजना नाही.",
    hi: "इन फ़िल्टर से कोई योजना नहीं मिलती.",
  },
  clearFilters: { en: "Clear filters", mr: "फिल्टर साफ करा", hi: "फ़िल्टर हटाएँ" },
  verifiedScheme: { en: "Official information", mr: "अधिकृत माहिती", hi: "आधिकारिक जानकारी" },
  allStates: { en: "All states", mr: "सर्व राज्ये", hi: "सभी राज्य" },
  stateSchemes: { en: "State schemes", mr: "राज्य योजना", hi: "राज्य योजनाएँ" },
  centralSchemes: { en: "Central schemes", mr: "केंद्र योजना", hi: "केंद्र योजनाएँ" },
  aboutScheme: { en: "About this scheme", mr: "या योजनेची माहिती", hi: "इस योजना के बारे में" },
  benefits: { en: "Benefits", mr: "फायदे", hi: "लाभ" },
  eligibility: { en: "Eligibility", mr: "पात्रता", hi: "पात्रता" },
  documentsReady: {
    en: "Documents to keep ready",
    mr: "तयार ठेवायची कागदपत्रे",
    hi: "तैयार रखने वाले दस्तावेज़",
  },
  howToApply: { en: "How to apply", mr: "अर्ज कसा करावा", hi: "आवेदन कैसे करें" },
  whereToApply: { en: "Where to apply", mr: "अर्ज कुठे करावा", hi: "कहाँ आवेदन करें" },
  officialResources: { en: "Official resources", mr: "अधिकृत संसाधने", hi: "आधिकारिक संसाधन" },
  importantDates: {
    en: "Important dates",
    mr: "महत्त्वाच्या तारखा",
    hi: "महत्वपूर्ण तारीखें",
  },
  datesConfirmationNote: {
    en: "Application dates and deadlines can change by year and state. Confirm the current official notice before applying.",
    mr: "अर्जाची तारीख आणि अंतिम मुदत वर्ष व राज्यानुसार बदलू शकतात. अर्ज करण्यापूर्वी सध्याची अधिकृत सूचना तपासा.",
    hi: "आवेदन तिथियां और अंतिम तिथि वर्ष तथा राज्य के अनुसार बदल सकती हैं। आवेदन से पहले वर्तमान आधिकारिक सूचना जांचें।",
  },
  frequentlyAskedQuestions: {
    en: "Frequently asked questions",
    mr: "वारंवार विचारले जाणारे प्रश्न",
    hi: "अक्सर पूछे जाने वाले प्रश्न",
  },
  faqEligibilityQuestion: {
    en: "Who can apply?",
    mr: "कोण अर्ज करू शकते?",
    hi: "कौन आवेदन कर सकता है?",
  },
  faqEligibilityAnswer: {
    en: "Eligibility depends on the latest official notice. Use the eligibility criteria listed on this page as a starting point, then verify the live scheme terms.",
    mr: "पात्रता सध्याच्या अधिकृत सूचनेवर अवलंबून असते. या पृष्ठावरील पात्रता निकष प्राथमिक मार्गदर्शक म्हणून वापरा आणि सध्याच्या योजनेच्या अटी तपासा.",
    hi: "पात्रता नवीनतम आधिकारिक सूचना पर निर्भर करती है। इस पृष्ठ पर दी गई पात्रता को प्रारंभिक मार्गदर्शन मानकर वर्तमान योजना की शर्तें जांचें।",
  },
  faqDocumentsQuestion: {
    en: "Which documents should I keep ready?",
    mr: "मी कोणती कागदपत्रे तयार ठेवावी?",
    hi: "मुझे कौन से दस्तावेज तैयार रखने चाहिए?",
  },
  faqDocumentsAnswer: {
    en: "Keep the documents listed above ready where applicable. The receiving office or official portal may request additional documents.",
    mr: "वर सूचीबद्ध असलेली कागदपत्रे लागू असल्यास तयार ठेवा. संबंधित कार्यालय किंवा अधिकृत पोर्टल अतिरिक्त कागदपत्रांची मागणी करू शकते.",
    hi: "उपर्युक्त दस्तावेज जहां लागू हों वहां तैयार रखें। संबंधित कार्यालय या आधिकारिक पोर्टल अतिरिक्त दस्तावेज मांग सकता है।",
  },
  faqDeadlineQuestion: {
    en: "How do I confirm the application deadline?",
    mr: "अर्जाची अंतिम मुदत मी कशी तपासू?",
    hi: "मैं आवेदन की अंतिम तिथि कैसे पुष्टि करूं?",
  },
  faqDeadlineAnswer: {
    en: "Check the official website or notice linked under Official resources. Confirm the current application window directly with the implementing authority.",
    mr: "अधिकृत संसाधनांत दिलेल्या वेबसाइटवर किंवा सूचनेत अंतिम मुदत तपासा. अंमलबजावणी करणाऱ्या प्राधिकरणाशी सध्याची अर्ज विंडो निश्चित करा.",
    hi: "आधिकारिक संसाधनों में दी गई वेबसाइट या सूचना पर अंतिम तिथि जांचें। कार्यान्वयन प्राधिकरण से वर्तमान आवेदन अवधि की पुष्टि करें।",
  },
  mainBenefit: { en: "Main benefit", mr: "मुख्य फायदा", hi: "मुख्य लाभ" },
  visitOfficialPortal: {
    en: "Visit official portal",
    mr: "अधिकृत पोर्टलला भेट द्या",
    hi: "आधिकारिक पोर्टल पर जाएँ",
  },
  officialWebsite: { en: "Official website", mr: "अधिकृत वेबसाइट", hi: "आधिकारिक वेबसाइट" },
  verificationStatus: { en: "Verification status", mr: "पडताळणी स्थिती", hi: "सत्यापन स्थिति" },
  source: { en: "Source", mr: "स्रोत", hi: "स्रोत" },
  lastVerified: { en: "Last verified", mr: "शेवटची पडताळणी", hi: "अंतिम सत्यापन" },
  schemeNotFound: {
    en: "This scheme could not be found.",
    mr: "ही योजना सापडली नाही.",
    hi: "यह योजना नहीं मिली.",
  },
  profile: { en: "Profile", mr: "प्रोफाइल", hi: "प्रोफ़ाइल" },
  diagnose: { en: "Diagnose", mr: "रोग ओळख", hi: "रोग पहचान" },
  mitraLink: { en: "Mitra Link", mr: "मित्र लिंक", hi: "मित्र लिंक" },

  todayPrices: { en: "Today's crop prices", mr: "आजचे पीक दर", hi: "आज के फसल भाव" },
  quickActions: { en: "Quick actions", mr: "झटपट क्रिया", hi: "क्विक एक्शन" },
  aiRecommendation: {
    en: "Top market today",
    mr: "आजचा सर्वोत्तम बाजार",
    hi: "आज का सर्वोत्तम मंडी",
  },
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
  verifyNumber: { en: "Verify your email", mr: "ईमेल पडताळा", hi: "ईमेल सत्यापित करें" },
  otpSentTo: {
    en: "We sent a 6-digit code to",
    mr: "६ अंकी कोड पाठवला",
    hi: "6 अंकों का कोड भेजा",
  },
  enterOtp: { en: "Enter the 6-digit code", mr: "६ अंकी कोड टाका", hi: "6 अंकों का कोड डालें" },
  verifyOtp: { en: "Verify & Continue", mr: "पडताळा आणि पुढे", hi: "सत्यापित करें" },
  resendOtp: { en: "Resend code", mr: "कोड पुन्हा पाठवा", hi: "कोड फिर भेजें" },
  changeNumber: { en: "Change email", mr: "ईमेल बदला", hi: "ईमेल बदलें" },
  codeExpires: { en: "Code expires in", mr: "कोड संपेल", hi: "कोड समाप्त होगा" },
  codeExpired: {
    en: "Code expired. Request a new one.",
    mr: "कोड संपला. नवीन मागवा.",
    hi: "कोड समाप्त. नया लें.",
  },
  checkInbox: {
    en: "Check your inbox, and the spam folder if you don't see it.",
    mr: "तुमचा इनबॉक्स तपासा; न दिसल्यास स्पॅम फोल्डर पहा.",
    hi: "अपना इनबॉक्स देखें; न मिले तो स्पैम फ़ोल्डर जाँचें.",
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
  chooseDistrict: {
    en: "Choose state & district",
    mr: "राज्य व जिल्हा निवडा",
    hi: "राज्य व ज़िला चुनें",
  },
  state: { en: "State", mr: "राज्य", hi: "राज्य" },
  district: { en: "District", mr: "जिल्हा", hi: "ज़िला" },
  city: { en: "City / village", mr: "शहर / गाव", hi: "शहर / गाँव" },
  cancel: { en: "Cancel", mr: "रद्द करा", hi: "रद्द करें" },
  autoLocation: { en: "Auto", mr: "स्वयं", hi: "स्वतः" },
  manualLocation: { en: "Manual", mr: "मॅन्युअल", hi: "मैनुअल" },
  enterLocation: {
    en: "Enter city, district & state",
    mr: "शहर, जिल्हा व राज्य भरा",
    hi: "शहर, ज़िला व राज्य भरें",
  },
  manualHint: {
    en: "Works without GPS. Saved for next time.",
    mr: "GPS शिवाय चालते. पुढील वेळेसाठी जतन होते.",
    hi: "GPS के बिना काम करता है. अगली बार के लिए सहेजा जाता है.",
  },
  save: { en: "Save", mr: "जतन करा", hi: "सहेजें" },

  noPrices: {
    en: "No mandi prices reported for this crop and district yet.",
    mr: "या पिकासाठी व जिल्ह्यासाठी बाजारभाव उपलब्ध नाहीत.",
    hi: "इस फसल और ज़िले के लिए मंडी भाव उपलब्ध नहीं हैं.",
  },
  searchMarket: {
    en: "Search market or district",
    mr: "बाजार किंवा जिल्हा शोधा",
    hi: "मंडी या ज़िला खोजें",
  },
  minPrice: { en: "Min", mr: "किमान", hi: "न्यूनतम" },
  maxPrice: { en: "Max", mr: "कमाल", hi: "अधिकतम" },
  modalPrice: { en: "Modal", mr: "सरासरी", hi: "मॉडल" },
  transportRate: {
    en: "Transport cost per quintal",
    mr: "प्रति क्विंटल वाहतूक खर्च",
    hi: "प्रति क्विंटल परिवहन लागत",
  },
  commissionRate: { en: "Mandi commission", mr: "बाजार कमिशन", hi: "मंडी कमीशन" },
  forecastUnavailable: {
    en: "Forecast not available yet",
    mr: "अंदाज अजून उपलब्ध नाही",
    hi: "अनुमान अभी उपलब्ध नहीं",
  },
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

  // Keep the document language in sync for screen readers and browser tooling.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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
