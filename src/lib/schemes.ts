/**
 * Central and state agriculture schemes with official government links.
 * Eligibility is shown as published criteria — the app never claims a
 * farmer is approved, it links to the official portal to apply.
 */
export type Scheme = {
  id: string;
  name: string;
  benefit: string;
  dept: string;
  criteria: string[];
  url?: string;
  sourceUrl?: string;
  sourceName?: string;
  lastVerified?: string;
  category:
    | "Income Support"
    | "Crop Insurance"
    | "Agricultural Loans"
    | "Equipment & Machinery Subsidies"
    | "Irrigation & Water Management"
    | "Solar Energy & Renewable Agriculture"
    | "Seeds & Fertilizers"
    | "Organic & Natural Farming"
    | "Horticulture"
    | "Livestock & Dairy"
    | "Agricultural Infrastructure"
    | "Market Access & Farmer Support"
    | "State Government Schemes";
  level: "Central" | "State";
  state?: string;
  verified?: boolean;
  overview?: string;
  documents?: string[];
  applicationSteps?: string[];
  verificationNote?: string;
};

export const schemes: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM Kisan Samman Nidhi",
    benefit: "₹6,000 per year income support in three instalments",
    dept: "Ministry of Agriculture & Farmers Welfare",
    criteria: [
      "Land-holding farmer family with cultivable land records",
      "Aadhaar-linked bank account",
      "e-KYC completed on the PM-KISAN portal",
    ],
    url: "https://pmkisan.gov.in/",
    sourceUrl: "https://pmkisan.gov.in/",
    sourceName: "PM-KISAN",
    lastVerified: "2026-10-31",
    category: "Income Support",
    level: "Central",
    verified: true,
    overview:
      "PM-KISAN provides direct income support to eligible land-holding farmer families in three instalments each year.",
    documents: [
      "Aadhaar card",
      "Land ownership records",
      "Bank account and IFSC details",
      "Completed PM-KISAN e-KYC",
    ],
    applicationSteps: [
      "Complete e-KYC on the official PM-KISAN portal.",
      "Verify Aadhaar, land records and bank details.",
      "Submit through the portal or an authorized Common Service Centre.",
      "Track beneficiary status on PM-KISAN.",
    ],
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana",
    benefit: "Season-based crop insurance against notified risks and crop loss",
    dept: "Department of Agriculture & Farmers Welfare",
    criteria: [
      "Notified crop grown in a notified area",
      "Enrolment before the season cut-off date",
      "Land record or sowing certificate",
    ],
    url: "https://pmfby.gov.in/",
    category: "Crop Insurance",
    level: "Central",
    verified: true,
  },
  {
    id: "namo-shetkari-mahasanman",
    name: "Namo Shetkari Mahasanman Nidhi",
    benefit:
      "Additional income-support assistance to eligible Maharashtra farmer families enrolled under the applicable state process",
    dept: "Government of Maharashtra, Department of Agriculture",
    criteria: [
      "Resident farmer meeting the eligibility criteria published for the current scheme cycle",
      "Registration and verification through Maharashtra's farmer-benefit system",
      "Current eligibility, documents and payment status must be checked on the official portal",
    ],
    url: "https://mahadbt.maharashtra.gov.in/",
    sourceUrl: "https://mahadbt.maharashtra.gov.in/",
    sourceName: "MahaDBT Maharashtra",
    lastVerified: "2026-10-31",
    verificationNote:
      "Programme details and application availability can change; confirm the live MahaDBT scheme notice.",
    category: "Income Support",
    level: "State",
    state: "Maharashtra",
    documents: [
      "Aadhaar card",
      "Farmer registration",
      "Land records where applicable",
      "Aadhaar-linked bank account",
    ],
    applicationSteps: [
      "Create or sign in to MahaDBT using your verified profile.",
      "Search for the live Namo Shetkari Mahasanman Nidhi scheme notice.",
      "Review the current eligibility and required documents.",
      "Submit the application and retain the MahaDBT acknowledgement.",
    ],
  },
  {
    id: "mahadbt-farmer-schemes",
    name: "MahaDBT Farmer Benefit Schemes",
    benefit:
      "Single portal for discovering and applying to eligible Maharashtra agriculture benefits",
    dept: "Government of Maharashtra, MahaDBT",
    criteria: [
      "Resident of Maharashtra for schemes with state residence requirements",
      "Eligibility varies by each individual scheme",
      "Current scheme notice must be checked before applying",
    ],
    url: "https://mahadbt.maharashtra.gov.in/",
    sourceUrl: "https://mahadbt.maharashtra.gov.in/",
    sourceName: "MahaDBT Maharashtra",
    lastVerified: "2026-10-31",
    verificationNote: "This is a common application portal, not an individual subsidy scheme.",
    category: "State Government Schemes",
    level: "State",
    state: "Maharashtra",
  },
  {
    id: "magel-tyala-solar-pump",
    name: "Magel Tyala Saur Krushi Pump",
    benefit: "State support for eligible agricultural solar pump applications",
    dept: "Government of Maharashtra and Maharashtra State Electricity Distribution Company",
    criteria: [
      "Agriculturist eligible under the live scheme advertisement",
      "Application route and technical eligibility are determined by the implementing electricity or agriculture agency",
      "Current availability must be confirmed on the official portal",
    ],
    url: "https://mahadiscom.in/solar/mskvvnl/",
    sourceUrl: "https://mahadiscom.in/solar/mskvvnl/",
    sourceName: "MSEDCL / MSKVY",
    lastVerified: "2026-10-31",
    verificationNote:
      "The exact benefit, eligibility and application window are subject to the current official notification.",
    category: "Solar Energy & Renewable Agriculture",
    level: "State",
    state: "Maharashtra",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card",
    benefit: "Institutional short-term and working capital credit for agricultural needs",
    dept: "NABARD and scheduled banks",
    criteria: [
      "Owner cultivator, tenant farmer or sharecropper",
      "Land records (7/12 extract or equivalent)",
      "KYC documents and no existing default",
    ],
    url: "https://www.nabard.org/content1.aspx?id=523&catid=23&mid=23",
    sourceUrl: "https://www.nabard.org/content1.aspx?id=523&catid=23&mid=23",
    sourceName: "NABARD",
    lastVerified: "2026-10-31",
    category: "Agricultural Loans",
    level: "Central",
    verified: true,
  },
  {
    id: "kusum",
    name: "PM-KUSUM Solar Pump",
    benefit: "Central and state support for eligible solar-powered agricultural pumps",
    dept: "Ministry of New & Renewable Energy",
    criteria: [
      "Own or assured irrigation source",
      "Grid-disconnected or diesel pump replacement",
      "Application through the state nodal agency",
    ],
    url: "https://pmkusum.mnre.gov.in/",
    category: "Solar Energy & Renewable Agriculture",
    level: "Central",
    verified: true,
  },
  {
    id: "aif",
    name: "Agriculture Infrastructure Fund",
    benefit: "Credit support for eligible post-harvest and agricultural infrastructure projects",
    dept: "Department of Agriculture & Farmers Welfare",
    criteria: [
      "Farmer, FPO, SHG, cooperative or agri-entrepreneur",
      "Post-harvest project such as storage, grading or cold chain",
      "Detailed project report submitted with the lending bank",
    ],
    url: "https://agriinfra.dac.gov.in/",
    category: "Agricultural Infrastructure",
    level: "Central",
    verified: true,
  },
  {
    id: "enam",
    name: "e-NAM National Agriculture Market",
    benefit: "Sell produce online across linked mandis with transparent bidding",
    dept: "Small Farmers' Agribusiness Consortium",
    criteria: [
      "Registration at a linked APMC mandi",
      "Bank account for online payment",
      "Aadhaar or other government ID",
    ],
    url: "https://enam.gov.in/web/",
    category: "Market Access & Farmer Support",
    level: "Central",
    verified: true,
  },
  {
    id: "soil-health",
    name: "Soil Health Card Scheme",
    benefit: "Free soil testing with crop-wise nutrient recommendations",
    dept: "Department of Agriculture & Farmers Welfare",
    criteria: [
      "Any farmer with cultivable land",
      "Soil sample collected through the local agriculture office",
    ],
    url: "https://soilhealth.dac.gov.in/",
    category: "Seeds & Fertilizers",
    level: "Central",
    verified: true,
  },
  {
    id: "pmksy",
    name: "Pradhan Mantri Krishi Sinchayee Yojana",
    benefit: "Support for micro-irrigation, watershed development and assured irrigation",
    dept: "Department of Agriculture & Farmers Welfare",
    criteria: [
      "Farmer or farmer group in an eligible project area",
      "Application through the concerned state agriculture or irrigation department",
    ],
    url: "https://pmksy.gov.in/",
    category: "Irrigation & Water Management",
    level: "Central",
    verified: true,
  },
  {
    id: "miss",
    name: "Modified Interest Subvention Scheme",
    benefit: "Interest support on eligible short-term crop loans through lending institutions",
    dept: "Department of Agriculture & Farmers Welfare",
    criteria: [
      "Farmer with an eligible crop loan account",
      "Prompt repayment or other conditions applicable to the lending institution",
    ],
    url: "https://agriwelfare.gov.in/en/MISS",
    category: "Agricultural Loans",
    level: "Central",
    verified: true,
  },
  {
    id: "smam",
    name: "Sub-Mission on Agricultural Mechanization",
    benefit: "Assistance for purchasing or accessing agricultural machinery",
    dept: "Department of Agriculture & Farmers Welfare",
    criteria: [
      "Eligible farmer or farmer institution",
      "Application through the state nodal department under the applicable subsidy program",
    ],
    url: "https://farmech.dac.gov.in/",
    category: "Equipment & Machinery Subsidies",
    level: "Central",
    verified: true,
  },
  {
    id: "midh",
    name: "Mission for Integrated Development of Horticulture",
    benefit:
      "Support for horticulture crops, protected cultivation, post-harvest infrastructure and market development",
    dept: "Department of Agriculture & Farmers Welfare",
    criteria: [
      "Eligible individual or group in a participating state",
      "Application under the relevant MIDH component through the state horticulture department",
    ],
    url: "https://midh.gov.in/",
    category: "Horticulture",
    level: "Central",
    verified: true,
  },
  {
    id: "natural-farming",
    name: "National Mission on Natural Farming",
    benefit: "Support for natural farming training, bio-input resources and demonstration clusters",
    dept: "Department of Agriculture & Farmers Welfare",
    criteria: [
      "Farmer participating through an approved state implementation programme",
      "Availability varies by district cluster",
    ],
    url: "https://naturalfarming.dac.gov.in/",
    category: "Organic & Natural Farming",
    level: "Central",
    verified: true,
  },
  {
    id: "nblm",
    name: "National Beekeeping and Honey Mission",
    benefit: "Support for scientific beekeeping, processing, training and market development",
    dept: "National Bee Board, Ministry of Agriculture & Farmers Welfare",
    criteria: [
      "Eligible beekeeper, farmer, producer group or enterprise",
      "Application through the applicable mission programme and implementing agency",
    ],
    url: "https://nbb.gov.in/",
    category: "Horticulture",
    level: "Central",
    verified: true,
  },
  {
    id: "nlm",
    name: "National Livestock Mission",
    benefit:
      "Support for livestock entrepreneurship, breed development, feed and fodder activities",
    dept: "Department of Animal Husbandry & Dairying",
    criteria: [
      "Eligible livestock farmer, entrepreneur or implementing entity",
      "Application under an announced component through the state or central implementing agency",
    ],
    url: "https://dahd.gov.in/national-livestock-mission",
    category: "Livestock & Dairy",
    level: "Central",
    verified: true,
  },
  {
    id: "pmmsy",
    name: "Pradhan Mantri Matsya Sampada Yojana",
    benefit: "Support for sustainable fisheries infrastructure, production and livelihoods",
    dept: "Department of Fisheries",
    criteria: [
      "Eligible fish farmer, entrepreneur, cooperative, SHG or enterprise",
      "Application through the National Fisheries Digital Platform or the state fisheries department",
    ],
    url: "https://dof.gov.in/pmmsy",
    category: "Livestock & Dairy",
    level: "Central",
    verified: true,
  },
  {
    id: "pmfme",
    name: "PM Formalisation of Micro Food Processing Enterprises",
    benefit: "Credit-linked support and training for micro food processing units",
    dept: "Ministry of Food Processing Industries",
    criteria: [
      "Individual micro enterprise or existing food processing unit",
      "Application through the official PMFME portal with bank and enterprise details",
    ],
    url: "https://pmfme.mofpi.gov.in/",
    category: "Market Access & Farmer Support",
    level: "Central",
    verified: true,
  },
  {
    id: "rkvy",
    name: "Rashtriya Krishi Vikas Yojana",
    benefit: "State-led support for agricultural development projects approved under RKVY",
    dept: "Department of Agriculture & Farmers Welfare",
    criteria: [
      "Eligibility is defined by the approved state project and beneficiary category",
      "Applications are generally routed through state agriculture departments",
    ],
    url: "https://agriwelfare.gov.in/en/RKVY-RAFTAAR",
    category: "Agricultural Infrastructure",
    level: "Central",
    verified: true,
  },
];
