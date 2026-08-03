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
  url: string;
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
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana",
    benefit: "Crop insurance at 2% premium for kharif, 1.5% for rabi",
    dept: "Department of Agriculture & Farmers Welfare",
    criteria: [
      "Notified crop grown in a notified area",
      "Enrolment before the season cut-off date",
      "Land record or sowing certificate",
    ],
    url: "https://pmfby.gov.in/",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card",
    benefit: "Short-term crop loans with 4% effective interest on prompt repayment",
    dept: "NABARD and scheduled banks",
    criteria: [
      "Owner cultivator, tenant farmer or sharecropper",
      "Land records (7/12 extract or equivalent)",
      "KYC documents and no existing default",
    ],
    url: "https://www.nabard.org/content1.aspx?id=518&catid=23&mid=23",
  },
  {
    id: "kusum",
    name: "PM-KUSUM Solar Pump",
    benefit: "Central and state subsidy on standalone solar agriculture pumps",
    dept: "Ministry of New & Renewable Energy",
    criteria: [
      "Own or assured irrigation source",
      "Grid-disconnected or diesel pump replacement",
      "Application through the state nodal agency",
    ],
    url: "https://pmkusum.mnre.gov.in/",
  },
  {
    id: "aif",
    name: "Agriculture Infrastructure Fund",
    benefit: "3% interest subvention and credit guarantee for post-harvest projects",
    dept: "Department of Agriculture & Farmers Welfare",
    criteria: [
      "Farmer, FPO, SHG, cooperative or agri-entrepreneur",
      "Post-harvest project such as storage, grading or cold chain",
      "Detailed project report submitted with the lending bank",
    ],
    url: "https://agriinfra.dac.gov.in/",
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
  },
];
