export type Lang = "en" | "mr" | "hi";

export type Crop = {
  id: string;
  name: Record<Lang, string>;
  unit: string;
  price: number;
  change: number;
  emoji: string;
};

export const crops: Crop[] = [
  {
    id: "onion",
    name: { en: "Onion", mr: "कांदा", hi: "प्याज" },
    unit: "quintal",
    price: 2450,
    change: 4.2,
    emoji: "🧅",
  },
  {
    id: "tomato",
    name: { en: "Tomato", mr: "टोमॅटो", hi: "टमाटर" },
    unit: "quintal",
    price: 1780,
    change: -2.6,
    emoji: "🍅",
  },
  {
    id: "wheat",
    name: { en: "Wheat", mr: "गहू", hi: "गेहूं" },
    unit: "quintal",
    price: 2640,
    change: 1.4,
    emoji: "🌾",
  },
  {
    id: "cotton",
    name: { en: "Cotton", mr: "कापूस", hi: "कपास" },
    unit: "quintal",
    price: 7320,
    change: 3.1,
    emoji: "☁️",
  },
  {
    id: "soybean",
    name: { en: "Soybean", mr: "सोयाबीन", hi: "सोयाबीन" },
    unit: "quintal",
    price: 4610,
    change: 0.8,
    emoji: "🫘",
  },
  {
    id: "sugarcane",
    name: { en: "Sugarcane", mr: "ऊस", hi: "गन्ना" },
    unit: "tonne",
    price: 3150,
    change: -0.5,
    emoji: "🎍",
  },
  {
    id: "maize",
    name: { en: "Maize", mr: "मका", hi: "मक्का" },
    unit: "quintal",
    price: 2130,
    change: 2.2,
    emoji: "🌽",
  },
  {
    id: "grapes",
    name: { en: "Grapes", mr: "द्राक्षे", hi: "अंगूर" },
    unit: "quintal",
    price: 5480,
    change: 5.6,
    emoji: "🍇",
  },
];

export type Market = {
  id: string;
  name: string;
  district: string;
  price: number;
  distanceKm: number;
  transportPerQuintal: number;
  demand: "High" | "Medium" | "Low";
  travelMins: number;
  arrivals: string;
  history: { label: string; price: number }[];
};

export const markets: Market[] = [
  {
    id: "lasalgaon",
    name: "Lasalgaon APMC",
    district: "Nashik",
    price: 2620,
    distanceKm: 42,
    transportPerQuintal: 95,
    demand: "High",
    travelMins: 65,
    arrivals: "18,400 quintal",
    history: [
      { label: "Mon", price: 2410 },
      { label: "Tue", price: 2455 },
      { label: "Wed", price: 2500 },
      { label: "Thu", price: 2540 },
      { label: "Fri", price: 2585 },
      { label: "Sat", price: 2600 },
      { label: "Today", price: 2620 },
    ],
  },
  {
    id: "pune",
    name: "Pune Market Yard",
    district: "Pune",
    price: 2710,
    distanceKm: 168,
    transportPerQuintal: 320,
    demand: "High",
    travelMins: 205,
    arrivals: "12,150 quintal",
    history: [
      { label: "Mon", price: 2530 },
      { label: "Tue", price: 2560 },
      { label: "Wed", price: 2600 },
      { label: "Thu", price: 2640 },
      { label: "Fri", price: 2665 },
      { label: "Sat", price: 2690 },
      { label: "Today", price: 2710 },
    ],
  },
  {
    id: "ahmednagar",
    name: "Ahmednagar APMC",
    district: "Ahmednagar",
    price: 2480,
    distanceKm: 61,
    transportPerQuintal: 130,
    demand: "Medium",
    travelMins: 88,
    arrivals: "7,900 quintal",
    history: [
      { label: "Mon", price: 2380 },
      { label: "Tue", price: 2400 },
      { label: "Wed", price: 2420 },
      { label: "Thu", price: 2450 },
      { label: "Fri", price: 2460 },
      { label: "Sat", price: 2470 },
      { label: "Today", price: 2480 },
    ],
  },
  {
    id: "solapur",
    name: "Solapur APMC",
    district: "Solapur",
    price: 2560,
    distanceKm: 214,
    transportPerQuintal: 410,
    demand: "Medium",
    travelMins: 260,
    arrivals: "6,300 quintal",
    history: [
      { label: "Mon", price: 2440 },
      { label: "Tue", price: 2470 },
      { label: "Wed", price: 2490 },
      { label: "Thu", price: 2505 },
      { label: "Fri", price: 2530 },
      { label: "Sat", price: 2545 },
      { label: "Today", price: 2560 },
    ],
  },
  {
    id: "sangamner",
    name: "Sangamner Mandi",
    district: "Ahmednagar",
    price: 2395,
    distanceKm: 24,
    transportPerQuintal: 60,
    demand: "Low",
    travelMins: 38,
    arrivals: "3,100 quintal",
    history: [
      { label: "Mon", price: 2320 },
      { label: "Tue", price: 2335 },
      { label: "Wed", price: 2350 },
      { label: "Thu", price: 2360 },
      { label: "Fri", price: 2375 },
      { label: "Sat", price: 2385 },
      { label: "Today", price: 2395 },
    ],
  },
];

export function netProfit(market: Market, quantity: number) {
  const gross = market.price * quantity;
  const transport = market.transportPerQuintal * quantity;
  const commission = gross * 0.02;
  return { gross, transport, commission, net: gross - transport - commission };
}

export function rankedMarkets(quantity: number) {
  return [...markets]
    .map((m) => ({ market: m, ...netProfit(m, quantity) }))
    .sort((a, b) => b.net - a.net);
}

export const forecast = [
  { day: "Today", price: 2620 },
  { day: "Tue", price: 2680 },
  { day: "Wed", price: 2745 },
  { day: "Thu", price: 2830 },
  { day: "Fri", price: 2795 },
  { day: "Sat", price: 2760 },
  { day: "Sun", price: 2810 },
];

export const weather = {
  temp: 29,
  condition: { en: "Partly cloudy", mr: "अंशतः ढगाळ", hi: "आंशिक बादल" },
  humidity: 68,
  wind: 12,
  rainChance: 65,
  district: "Sangamner, Ahmednagar",
  week: [
    { day: "Mon", temp: 29, rain: 20, icon: "sun" },
    { day: "Tue", temp: 28, rain: 65, icon: "rain" },
    { day: "Wed", temp: 27, rain: 80, icon: "rain" },
    { day: "Thu", temp: 30, rain: 15, icon: "sun" },
    { day: "Fri", temp: 31, rain: 10, icon: "sun" },
    { day: "Sat", temp: 30, rain: 25, icon: "cloud" },
    { day: "Sun", temp: 29, rain: 35, icon: "cloud" },
  ],
};

export const schemes = [
  {
    id: "pmkisan",
    name: "PM Kisan Samman Nidhi",
    benefit: "₹6,000 / year direct income support",
    dept: "Ministry of Agriculture",
    eligible: true,
    criteria: ["Landholding under 2 hectares", "Aadhaar linked bank account", "Active farmer record"],
    deadline: "Open — rolling",
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana",
    benefit: "Crop insurance at 2% premium",
    dept: "Dept. of Agriculture & Farmers Welfare",
    eligible: true,
    criteria: ["Notified crop in notified area", "Sowing certificate", "Premium paid before cut-off"],
    deadline: "31 July 2026",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card",
    benefit: "Up to ₹3 lakh at 4% effective interest",
    dept: "NABARD / Banks",
    eligible: true,
    criteria: ["Land records (7/12 extract)", "No existing default", "KYC documents"],
    deadline: "Open — rolling",
  },
  {
    id: "solar",
    name: "PM-KUSUM Solar Pump",
    benefit: "60% subsidy on solar pump sets",
    dept: "Ministry of New & Renewable Energy",
    eligible: false,
    criteria: ["Own irrigation source", "Grid-disconnected pump", "Minimum 1 acre irrigated land"],
    deadline: "15 Sep 2026",
  },
  {
    id: "warehouse",
    name: "Agri Infrastructure Fund",
    benefit: "3% interest subvention on storage projects",
    dept: "NABARD",
    eligible: false,
    criteria: ["FPO / SHG membership", "Project report submission", "Land ownership proof"],
    deadline: "31 Dec 2026",
  },
];

export const farmer = {
  name: "Ramesh Patil",
  phone: "+91 98765 43210",
  village: "Sangamner, Ahmednagar",
  landAcres: 4.5,
  savedCrops: ["onion", "tomato", "soybean"],
  history: [
    { id: "s1", crop: "Onion", qty: 32, market: "Lasalgaon APMC", date: "12 Jul 2026", amount: 78400 },
    { id: "s2", crop: "Soybean", qty: 18, market: "Pune Market Yard", date: "28 Jun 2026", amount: 81200 },
    { id: "s3", crop: "Tomato", qty: 24, market: "Ahmednagar APMC", date: "14 Jun 2026", amount: 41300 },
    { id: "s4", crop: "Onion", qty: 40, market: "Lasalgaon APMC", date: "02 Jun 2026", amount: 92600 },
  ],
};

export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
