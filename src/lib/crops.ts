export type Lang = "en" | "mr" | "hi";

export type DefaultCropPrice = {
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
};

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
  defaultPrice: DefaultCropPrice;
};

export const crops: Crop[] = [
  {
    id: "onion",
    commodity: "Onion",
    commodityAliases: ["Onion", "Pyaj", "Kanda"],
    name: { en: "Onion", mr: "कांदा", hi: "प्याज" },
    unit: "quintal",
    emoji: "🧅",
    defaultPrice: { minPrice: 1500, modalPrice: 2400, maxPrice: 3200 },
  },
  {
    id: "tomato",
    commodity: "Tomato",
    commodityAliases: ["Tomato", "Tamatar"],
    name: { en: "Tomato", mr: "टोमॅटो", hi: "टमाटर" },
    unit: "quintal",
    emoji: "🍅",
    defaultPrice: { minPrice: 1200, modalPrice: 1900, maxPrice: 2600 },
  },
  {
    id: "potato",
    commodity: "Potato",
    commodityAliases: ["Potato", "Aloo", "Batata"],
    name: { en: "Potato", mr: "बटाटा", hi: "आलू" },
    unit: "quintal",
    emoji: "🥔",
    defaultPrice: { minPrice: 1000, modalPrice: 1450, maxPrice: 1950 },
  },
  {
    id: "wheat",
    commodity: "Wheat",
    commodityAliases: ["Wheat", "Gehun", "Gehu"],
    name: { en: "Wheat", mr: "गहू", hi: "गेहूं" },
    unit: "quintal",
    emoji: "🌾",
    defaultPrice: { minPrice: 2275, modalPrice: 2425, maxPrice: 2600 },
  },
  {
    id: "paddy",
    commodity: "Paddy(Dhan)(Common)",
    commodityAliases: ["Paddy", "Dhan", "Paddy Dhan Common", "Rice", "Paddy(Dhan)"],
    name: { en: "Paddy", mr: "भात", hi: "धान" },
    unit: "quintal",
    emoji: "🌾",
    defaultPrice: { minPrice: 2183, modalPrice: 2320, maxPrice: 2550 },
  },
  {
    id: "cotton",
    commodity: "Cotton",
    commodityAliases: ["Cotton", "Kapas", "Cotton (Unhulled)"],
    name: { en: "Cotton", mr: "कापूस", hi: "कपास" },
    unit: "quintal",
    emoji: "☁️",
    defaultPrice: { minPrice: 6900, modalPrice: 7521, maxPrice: 8100 },
  },
  {
    id: "soyabean",
    commodity: "Soyabean",
    commodityAliases: ["Soybean", "Soya Bean", "Soyabean"],
    name: { en: "Soybean", mr: "सोयाबीन", hi: "सोयाबीन" },
    unit: "quintal",
    emoji: "🫘",
    defaultPrice: { minPrice: 4300, modalPrice: 4892, maxPrice: 5350 },
  },
  {
    id: "maize",
    commodity: "Maize",
    commodityAliases: ["Maize", "Makka", "Corn"],
    name: { en: "Maize", mr: "मका", hi: "मक्का" },
    unit: "quintal",
    emoji: "🌽",
    defaultPrice: { minPrice: 1950, modalPrice: 2225, maxPrice: 2500 },
  },
  {
    id: "bajra",
    commodity: "Bajra(Pearl Millet/Cumbu)",
    commodityAliases: ["Bajra", "Pearl Millet", "Cumbu", "Bajri"],
    name: { en: "Bajra", mr: "बाजरी", hi: "बाजरा" },
    unit: "quintal",
    emoji: "🌾",
    defaultPrice: { minPrice: 2250, modalPrice: 2625, maxPrice: 2900 },
  },
  {
    id: "jowar",
    commodity: "Jowar(Sorghum)",
    commodityAliases: ["Jowar", "Sorghum", "Jowari"],
    name: { en: "Jowar", mr: "ज्वारी", hi: "ज्वार" },
    unit: "quintal",
    emoji: "🌾",
    defaultPrice: { minPrice: 2950, modalPrice: 3371, maxPrice: 3650 },
  },
  {
    id: "tur",
    commodity: "Arhar (Tur/Red Gram)(Whole)",
    commodityAliases: ["Arhar", "Tur", "Red Gram", "Pigeon Pea", "Arhar (Tur)"],
    name: { en: "Tur / Arhar", mr: "तूर", hi: "अरहर" },
    unit: "quintal",
    emoji: "🫛",
    defaultPrice: { minPrice: 6800, modalPrice: 7550, maxPrice: 8400 },
  },
  {
    id: "gram",
    commodity: "Bengal Gram(Gram)(Whole)",
    commodityAliases: ["Bengal Gram", "Gram", "Chickpea", "Chana", "Gram Raw(Whole)"],
    name: { en: "Gram", mr: "हरभरा", hi: "चना" },
    unit: "quintal",
    emoji: "🫘",
    defaultPrice: { minPrice: 5150, modalPrice: 5650, maxPrice: 6150 },
  },
  {
    id: "groundnut",
    commodity: "Groundnut",
    commodityAliases: ["Groundnut", "Peanut", "Ground Nut", "Moongfali"],
    name: { en: "Groundnut", mr: "भुईमूग", hi: "मूंगफली" },
    unit: "quintal",
    emoji: "🥜",
    defaultPrice: { minPrice: 6100, modalPrice: 6783, maxPrice: 7400 },
  },
  {
    id: "sugarcane",
    commodity: "Sugarcane",
    commodityAliases: ["Sugarcane", "Sugar Cane", "Ganna"],
    name: { en: "Sugarcane", mr: "ऊस", hi: "गन्ना" },
    unit: "quintal",
    emoji: "🎍",
    defaultPrice: { minPrice: 315, modalPrice: 350, maxPrice: 385 },
  },
  {
    id: "grapes",
    commodity: "Grapes",
    commodityAliases: ["Grapes", "Grape", "Angoor"],
    name: { en: "Grapes", mr: "द्राक्षे", hi: "अंगूर" },
    unit: "quintal",
    emoji: "🍇",
    defaultPrice: { minPrice: 4200, modalPrice: 5800, maxPrice: 7800 },
  },
  {
    id: "banana",
    commodity: "Banana",
    commodityAliases: ["Banana", "Kela", "Banana - Ripe", "Banana - Green"],
    name: { en: "Banana", mr: "केळी", hi: "केला" },
    unit: "quintal",
    emoji: "🍌",
    defaultPrice: { minPrice: 1250, modalPrice: 1750, maxPrice: 2350 },
  },
  {
    id: "chilli",
    commodity: "Green Chilli",
    commodityAliases: ["Green Chilly", "Chilli Green", "Chili Green", "Chillies(Green)", "Chilli"],
    name: { en: "Green Chilli", mr: "हिरवी मिरची", hi: "हरी मिर्च" },
    unit: "quintal",
    emoji: "🌶️",
    defaultPrice: { minPrice: 2800, modalPrice: 3800, maxPrice: 5200 },
  },
  {
    id: "turmeric",
    commodity: "Turmeric",
    commodityAliases: ["Turmeric", "Haldi", "Turmeric (raw)"],
    name: { en: "Turmeric", mr: "हळद", hi: "हल्दी" },
    unit: "quintal",
    emoji: "🟡",
    defaultPrice: { minPrice: 11500, modalPrice: 13500, maxPrice: 16000 },
  },
];

export const findCrop = (idOrCommodity: string) => {
  if (!idOrCommodity) return undefined;
  const target = idOrCommodity.trim().toLowerCase();
  return (
    crops.find((c) => c.id.toLowerCase() === target) ??
    crops.find((c) => c.commodity.toLowerCase() === target) ??
    crops.find((c) => c.commodityAliases?.some((a) => a.toLowerCase() === target)) ??
    crops.find((c) => c.name.en.toLowerCase() === target) ??
    crops.find((c) => c.name.mr === idOrCommodity.trim()) ??
    crops.find((c) => c.name.hi === idOrCommodity.trim())
  );
};

export const UNLISTED_CROP_DEFAULT_PRICE: DefaultCropPrice = {
  minPrice: 2000,
  modalPrice: 2500,
  maxPrice: 3200,
};

export function getDefaultCropPrice(idOrCommodity: string): DefaultCropPrice {
  const crop = findCrop(idOrCommodity);
  return crop?.defaultPrice ?? UNLISTED_CROP_DEFAULT_PRICE;
}

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
