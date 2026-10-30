export type Lang = "en" | "mr" | "hi";

/**
 * Crop catalogue. `commodity` matches the commodity name used by the
 * Government of India Agmarknet dataset, so it can be sent straight to the API.
 */
export type Crop = {
  id: string;
  commodity: string;
  commodityAliases?: string[];
  name: Record<Lang, string>;
  unit: string;
  emoji: string;
};

export const crops: Crop[] = [
  {
    id: "onion",
    commodity: "Onion",
    name: { en: "Onion", mr: "कांदा", hi: "प्याज" },
    unit: "quintal",
    emoji: "🧅",
  },
  {
    id: "tomato",
    commodity: "Tomato",
    name: { en: "Tomato", mr: "टोमॅटो", hi: "टमाटर" },
    unit: "quintal",
    emoji: "🍅",
  },
  {
    id: "potato",
    commodity: "Potato",
    name: { en: "Potato", mr: "बटाटा", hi: "आलू" },
    unit: "quintal",
    emoji: "🥔",
  },
  {
    id: "wheat",
    commodity: "Wheat",
    name: { en: "Wheat", mr: "गहू", hi: "गेहूं" },
    unit: "quintal",
    emoji: "🌾",
  },
  {
    id: "paddy",
    commodity: "Paddy(Dhan)(Common)",
    commodityAliases: ["Paddy", "Dhan", "Paddy Dhan Common"],
    name: { en: "Paddy", mr: "भात", hi: "धान" },
    unit: "quintal",
    emoji: "🌾",
  },
  {
    id: "cotton",
    commodity: "Cotton",
    name: { en: "Cotton", mr: "कापूस", hi: "कपास" },
    unit: "quintal",
    emoji: "☁️",
  },
  {
    id: "soyabean",
    commodity: "Soyabean",
    commodityAliases: ["Soybean", "Soya Bean"],
    name: { en: "Soybean", mr: "सोयाबीन", hi: "सोयाबीन" },
    unit: "quintal",
    emoji: "🫘",
  },
  {
    id: "maize",
    commodity: "Maize",
    name: { en: "Maize", mr: "मका", hi: "मक्का" },
    unit: "quintal",
    emoji: "🌽",
  },
  {
    id: "bajra",
    commodity: "Bajra(Pearl Millet/Cumbu)",
    commodityAliases: ["Bajra", "Pearl Millet", "Cumbu"],
    name: { en: "Bajra", mr: "बाजरी", hi: "बाजरा" },
    unit: "quintal",
    emoji: "🌾",
  },
  {
    id: "jowar",
    commodity: "Jowar(Sorghum)",
    commodityAliases: ["Jowar", "Sorghum"],
    name: { en: "Jowar", mr: "ज्वारी", hi: "ज्वार" },
    unit: "quintal",
    emoji: "🌾",
  },
  {
    id: "tur",
    commodity: "Arhar (Tur/Red Gram)(Whole)",
    commodityAliases: ["Arhar", "Tur", "Red Gram", "Pigeon Pea"],
    name: { en: "Tur / Arhar", mr: "तूर", hi: "अरहर" },
    unit: "quintal",
    emoji: "🫛",
  },
  {
    id: "gram",
    commodity: "Bengal Gram(Gram)(Whole)",
    commodityAliases: ["Bengal Gram", "Gram", "Chickpea", "Chana"],
    name: { en: "Gram", mr: "हरभरा", hi: "चना" },
    unit: "quintal",
    emoji: "🫘",
  },
  {
    id: "groundnut",
    commodity: "Groundnut",
    name: { en: "Groundnut", mr: "भुईमूग", hi: "मूंगफली" },
    unit: "quintal",
    emoji: "🥜",
  },
  {
    id: "sugarcane",
    commodity: "Sugarcane",
    name: { en: "Sugarcane", mr: "ऊस", hi: "गन्ना" },
    unit: "quintal",
    emoji: "🎍",
  },
  {
    id: "grapes",
    commodity: "Grapes",
    name: { en: "Grapes", mr: "द्राक्षे", hi: "अंगूर" },
    unit: "quintal",
    emoji: "🍇",
  },
  {
    id: "banana",
    commodity: "Banana",
    name: { en: "Banana", mr: "केळी", hi: "केला" },
    unit: "quintal",
    emoji: "🍌",
  },
  {
    id: "chilli",
    commodity: "Green Chilli",
    commodityAliases: ["Green Chilly", "Chilli Green", "Chili Green"],
    name: { en: "Green Chilli", mr: "हिरवी मिरची", hi: "हरी मिर्च" },
    unit: "quintal",
    emoji: "🌶️",
  },
  {
    id: "turmeric",
    commodity: "Turmeric",
    name: { en: "Turmeric", mr: "हळद", hi: "हल्दी" },
    unit: "quintal",
    emoji: "🟡",
  },
];

export const findCrop = (id: string) => crops.find((c) => c.id === id);

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "NCT of Delhi",
  "Odisha",
  "Pondicherry",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttrakhand",
  "West Bengal",
] as const;
