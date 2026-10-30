import { z } from "zod";

const recommendationSchema = z.object({
  productName: z.string().trim().min(1).max(120).nullable(),
  brand: z.string().trim().min(1).max(80).nullable(),
  activeIngredient: z.string().trim().min(1).max(100).nullable(),
  recommendationType: z.enum([
    "commercial_product",
    "biological_control",
    "active_ingredient",
    "general_organic_treatment",
  ]),
  formulation: z.string().trim().min(1).max(100).nullable(),
  targetCrop: z.string().trim().min(1).max(80),
  targetCondition: z.string().trim().min(1).max(160),
  rationale: z.string().trim().min(1).max(300),
  applicationMethod: z.string().trim().min(1).max(160).nullable(),
  dose: z.null(),
  waterVolume: z.null(),
  applicationInterval: z.null(),
  maximumApplications: z.null(),
  requiredPpe: z.array(z.string().trim().min(1).max(120)).max(4),
  preHarvestInterval: z.null(),
  reEntryInterval: z.null(),
  precautions: z.array(z.string().trim().min(1).max(160)).max(4),
  sourceUrl: z.string().url().nullable(),
});

const organicManagementSchema = z.object({
  category: z.enum([
    "cultural",
    "sanitation",
    "water",
    "spacing",
    "rotation",
    "resistant_variety",
    "biological_control",
    "organic_input",
  ]),
  name: z.string().trim().min(1).max(100),
  targetCrop: z.string().trim().min(1).max(80),
  targetCondition: z.string().trim().min(1).max(160),
  rationale: z.string().trim().min(1).max(240),
  limitations: z.string().trim().min(1).max(240),
  sourceUrl: z.string().url(),
});

const syntheticPesticidePattern =
  /\b(?:thiram|mancozeb|dithane(?:\s+m-?45)?|carbendazim|captan|chlorothalonil|zineb|propineb|metalaxyl|azoxystrobin|tebuconazole|difenoconazole|hexaconazole|propiconazole|tricyclazole|kasugamycin|streptomycin|validamycin|copper oxychloride|copper hydroxide)\b/i;

export const treatmentModelResponseSchema = z.object({
  causeCategory: z.enum([
    "fungal",
    "bacterial",
    "viral",
    "pest",
    "nutrient",
    "environmental",
    "mixed",
    "uncertain",
    "unspecified",
  ]),
  generalCare: z.array(z.string().trim().min(1).max(240)).max(5),
  organicManagement: z.array(organicManagementSchema).max(5),
  organicBiological: z.array(recommendationSchema).max(3),
  chemical: z.array(recommendationSchema).max(3),
});

export type TreatmentSource = {
  name: string;
  url: string;
};

type RetrievedTreatmentSource = TreatmentSource & {
  evidenceText: string;
};

export type TreatmentRecommendation = Omit<
  z.infer<typeof recommendationSchema>,
  "productName" | "sourceUrl"
> & {
  productName: string;
  sourceName: string;
  sourceUrl: string;
  verificationStatus: "source_supported_needs_label_check";
};

export type OrganicManagementRecommendation = z.infer<typeof organicManagementSchema> & {
  sourceName: string;
  verificationStatus: "source_supported";
};

export type TreatmentGuidance = {
  generalCare: string[];
  organicManagement: OrganicManagementRecommendation[];
  organicBiological: TreatmentRecommendation[];
  chemical: TreatmentRecommendation[];
  sources: TreatmentSource[];
  retrievedAt: string;
  sourceStatus: "sources_found" | "no_authoritative_sources";
};

function isNamedCommercialProduct(name: string): boolean {
  return !/^(?:(?:a|an)\s+)?(?:(?:chemical|organic|biological)\s+)*(?:fungicides?|insecticides?|bactericides?|acaricides?|pesticides?|biopesticides?|sprays?|crop protection products?)\b.*$/i.test(
    name.trim(),
  );
}

type ModelRecord = Record<string, unknown>;

function record(value: unknown): ModelRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as ModelRecord)
    : null;
}

function field(recordValue: ModelRecord, aliases: string[]): unknown {
  const normalized = new Map(
    Object.entries(recordValue).map(([key, value]) => [
      key.replace(/[^a-z0-9]/gi, "").toLowerCase(),
      value,
    ]),
  );
  for (const alias of aliases) {
    const value = normalized.get(alias.replace(/[^a-z0-9]/gi, "").toLowerCase());
    if (value !== undefined) return value;
  }
  return undefined;
}

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return !trimmed || /^(?:null|n\/?a|not provided|not available)$/i.test(trimmed) ? null : trimmed;
}

function textList(value: unknown, max: number): string[] {
  const values = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return values
    .flatMap((item) => (typeof item === "string" && item.trim() ? [item.trim()] : []))
    .slice(0, max);
}

function sourceUrl(value: unknown): string | null {
  if (typeof value === "string") return text(value);
  const valueRecord = record(value);
  return valueRecord ? text(field(valueRecord, ["url", "href"])) : null;
}

function normalizeRecommendation(value: unknown, organicCategory: boolean) {
  const item = record(value);
  if (!item) return null;
  const type = text(field(item, ["recommendationType", "treatmentType", "kind", "type"]))
    ?.toLowerCase()
    .replace(/[\s-]+/g, "_");
  const productName = text(field(item, ["productName", "product", "name", "treatment"]));
  const brand = text(field(item, ["brand", "tradeName"]));
  const activeIngredient = text(
    field(item, ["activeIngredient", "activeSubstance", "biologicalAgent", "ingredient"]),
  );
  const recommendationType =
    type === "commercial_product" ||
    type === "biological_control" ||
    type === "active_ingredient" ||
    type === "general_organic_treatment"
      ? type
      : organicCategory && activeIngredient && !brand
        ? "biological_control"
        : productName && (brand || !organicCategory)
          ? "commercial_product"
          : activeIngredient
            ? "active_ingredient"
            : "general_organic_treatment";

  const parsed = recommendationSchema.safeParse({
    productName,
    brand,
    activeIngredient,
    recommendationType,
    formulation: text(field(item, ["formulation", "formulationType"])),
    targetCrop: text(field(item, ["targetCrop", "crop"])),
    targetCondition: text(
      field(item, ["targetCondition", "targetProblem", "disease", "condition"]),
    ),
    rationale: text(field(item, ["rationale", "whyRelevant", "purpose", "reason"])),
    applicationMethod: text(field(item, ["applicationMethod", "application", "instructions"])),
    dose: null,
    waterVolume: null,
    applicationInterval: null,
    maximumApplications: null,
    requiredPpe: textList(field(item, ["requiredPpe", "ppe"]), 4),
    preHarvestInterval: null,
    reEntryInterval: null,
    precautions: textList(field(item, ["precautions", "safetyPrecautions"]), 4),
    sourceUrl: sourceUrl(field(item, ["sourceUrl", "evidenceUrl", "citationUrl", "source"])),
  });
  return parsed.success ? parsed.data : null;
}

function normalizeOrganicManagement(value: unknown) {
  const item = record(value);
  if (!item) return null;
  const category = text(field(item, ["category", "type"]))
    ?.toLowerCase()
    .replace(/[\s-]+/g, "_");
  const parsed = organicManagementSchema.safeParse({
    category,
    name: text(field(item, ["name", "practice", "treatment"])),
    targetCrop: text(field(item, ["targetCrop", "crop"])),
    targetCondition: text(
      field(item, ["targetCondition", "targetProblem", "disease", "condition"]),
    ),
    rationale: text(field(item, ["rationale", "whyRelevant", "purpose", "reason"])),
    limitations:
      text(field(item, ["limitations", "caveat", "notes"])) ??
      "Confirm local suitability before use.",
    sourceUrl: sourceUrl(field(item, ["sourceUrl", "evidenceUrl", "citationUrl", "source"])),
  });
  return parsed.success ? parsed.data : null;
}

function responseArray(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return [value];
  throw new Error("Treatment category must contain an object or array.");
}

export function normalizeTreatmentModelResponse(value: unknown) {
  const root = record(value);
  if (!root) throw new Error("Treatment response must be a JSON object.");
  const recommendationsValue = field(root, ["recommendations"]);
  const nested = record(field(root, ["treatments", "recommendations", "result", "data"]));
  const model = nested ?? root;
  const organicRaw = field(model, [
    "organicBiological",
    "organicSprays",
    "biologicalControls",
    "biological",
    "organicProducts",
    "organicTreatments",
    "organicRecommendations",
    "organic",
  ]);
  const chemicalRaw = field(model, [
    "chemical",
    "inorganic",
    "inorganicSprays",
    "chemicalTreatments",
    "inorganicRecommendations",
  ]);
  const managementRaw = field(model, ["organicManagement", "nonChemicalPractices"]);
  const generalCareRaw = field(model, ["generalCare", "generalManagement", "care"]);
  const causeCategory = text(field(model, ["causeCategory", "cause", "problemType"]))
    ?.toLowerCase()
    .replace(/[\s-]+/g, "_");

  const allRecommendations = responseArray(
    field(model, ["options"]) ?? (Array.isArray(recommendationsValue) ? recommendationsValue : []),
  ).flatMap((item) => {
    const itemRecord = record(item);
    const category = text(itemRecord ? field(itemRecord, ["category", "group"]) : undefined)
      ?.toLowerCase()
      .replace(/[\s-]+/g, "_");
    if (/organic|biological/.test(category ?? "")) return [{ target: "organic", item }];
    if (/chemical|inorganic/.test(category ?? "")) return [{ target: "chemical", item }];
    return [];
  });
  const organicItems = [
    ...responseArray(organicRaw),
    ...allRecommendations.filter((item) => item.target === "organic").map((item) => item.item),
  ];
  const chemicalItems = [
    ...responseArray(chemicalRaw),
    ...allRecommendations.filter((item) => item.target === "chemical").map((item) => item.item),
  ];
  const managementItems = responseArray(managementRaw);
  const generalCare = textList(generalCareRaw, 5).filter((item) => item.length <= 240);
  const hasRecognizedContent =
    organicRaw !== undefined ||
    chemicalRaw !== undefined ||
    managementRaw !== undefined ||
    generalCareRaw !== undefined ||
    field(model, ["options"]) !== undefined ||
    Array.isArray(recommendationsValue);
  if (!hasRecognizedContent) throw new Error("Treatment response has no recognized fields.");

  const categoryOptions = [
    "fungal",
    "bacterial",
    "viral",
    "pest",
    "nutrient",
    "environmental",
    "mixed",
    "uncertain",
    "unspecified",
  ];
  return treatmentModelResponseSchema.parse({
    causeCategory: categoryOptions.includes(causeCategory ?? "") ? causeCategory : "unspecified",
    generalCare,
    organicManagement: managementItems
      .map(normalizeOrganicManagement)
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, 5),
    organicBiological: organicItems
      .map((item) => normalizeRecommendation(item, true))
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, 3),
    chemical: chemicalItems
      .map((item) => normalizeRecommendation(item, false))
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, 3),
  });
}

function cropMatches(candidateCrop: string, crop: string): boolean {
  const tokens = (value: string) =>
    value
      .trim()
      .toLocaleLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean);
  const candidate = tokens(candidateCrop);
  const expected = tokens(crop);
  return (
    candidate.length > 0 &&
    expected.length > 0 &&
    (expected.every((term) => candidate.includes(term)) ||
      candidate.every((term) => expected.includes(term)))
  );
}

function isOfficialAgricultureSource(source: TreatmentSource): boolean {
  try {
    const url = new URL(source.url);
    if (url.protocol !== "https:") return false;
    if (url.username || url.password || url.port) return false;
    const host = url.hostname.toLowerCase();
    return (
      host === "gov.in" ||
      host.endsWith(".gov.in") ||
      host === "icar.org.in" ||
      host.endsWith(".icar.org.in") ||
      host === "icar.gov.in" ||
      host.endsWith(".icar.gov.in") ||
      host.endsWith(".ac.in")
    );
  } catch {
    return false;
  }
}

function supportsRecommendation(
  source: RetrievedTreatmentSource,
  cropTerms: string[],
  conditionTerms: string[],
  targetCondition: string,
  productName: string | null,
  brand: string | null,
  activeIngredient: string | null,
  formulation: string | null,
): boolean {
  const lines = source.evidenceText
    .split(/\r?\n/)
    .map((line) => line.replace(/^L\d+:\s*/, "").toLocaleLowerCase());
  const targetTerms = targetCondition
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(
      (term) =>
        term.length > 3 &&
        !["possible", "probable", "suspected", "likely", "condition", "disease"].includes(term),
    );
  const product = productName?.toLocaleLowerCase() ?? null;
  const brandName = brand?.toLocaleLowerCase() ?? null;
  const ingredient = activeIngredient?.toLocaleLowerCase() ?? null;
  const productFormulation = formulation?.toLocaleLowerCase() ?? null;

  if (cropTerms.length === 0 || conditionTerms.length === 0 || targetTerms.length === 0) {
    return false;
  }
  if (!targetTerms.every((term) => cropTerms.includes(term) || conditionTerms.includes(term))) {
    return false;
  }
  if (!conditionTerms.some((term) => targetTerms.includes(term))) return false;

  return lines.some((_, index) => {
    const excerpt = lines.slice(index, index + 6).join(" ");
    return (
      cropTerms.every((term) => excerpt.includes(term)) &&
      conditionTerms.every((term) => excerpt.includes(term)) &&
      targetTerms.every((term) => excerpt.includes(term)) &&
      (product
        ? excerpt.includes(product) || Boolean(brandName && excerpt.includes(brandName))
        : Boolean(ingredient && excerpt.includes(ingredient))) &&
      (!ingredient || excerpt.includes(ingredient)) &&
      (!brandName || excerpt.includes(brandName)) &&
      (!productFormulation || excerpt.includes(productFormulation))
    );
  });
}

function supportsOrganicManagement(
  source: RetrievedTreatmentSource,
  cropTerms: string[],
  conditionTerms: string[],
  recommendation: z.infer<typeof organicManagementSchema>,
  crop: string,
): boolean {
  const lines = source.evidenceText
    .split(/\r?\n/)
    .map((line) => line.replace(/^L\d+:\s*/, "").toLocaleLowerCase());
  const practiceTerms = recommendation.name
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 3);
  const targetTerms = recommendation.targetCondition
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 3);

  if (
    cropTerms.length === 0 ||
    conditionTerms.length === 0 ||
    targetTerms.length === 0 ||
    practiceTerms.length === 0 ||
    syntheticPesticidePattern.test(
      `${recommendation.name} ${recommendation.rationale} ${recommendation.limitations}`,
    ) ||
    !cropMatches(recommendation.targetCrop, crop) ||
    !targetTerms.every((term) => cropTerms.includes(term) || conditionTerms.includes(term)) ||
    !conditionTerms.some((term) => targetTerms.includes(term))
  ) {
    return false;
  }

  return lines.some((_, index) => {
    const excerpt = lines.slice(index, index + 6).join(" ");
    return (
      cropTerms.every((term) => excerpt.includes(term)) &&
      conditionTerms.some((term) => excerpt.includes(term)) &&
      targetTerms.some((term) => excerpt.includes(term)) &&
      practiceTerms.some((term) => excerpt.includes(term))
    );
  });
}

export function extractTreatmentSources(value: unknown): RetrievedTreatmentSource[] {
  const entries = Array.isArray(value)
    ? value
    : value !== null && typeof value === "object"
      ? Object.values(value)
      : [];

  const sources = entries.flatMap((item): RetrievedTreatmentSource[] => {
    const entry = record(item);
    if (!entry) return [];
    const toolName = text(field(entry, ["name", "tool", "type"]));
    if (
      !toolName ||
      !/^(?:browser[._-]open|browser_open|open_url|browser\.open)$/i.test(toolName)
    ) {
      return [];
    }
    const output = text(field(entry, ["output", "content", "result"]));
    if (!output) return [];
    const page = z.string().safeParse(output);
    if (!page.success) return [];
    const pageOutput = page.data;

    const urlLine = pageOutput.match(/^(?:L\d+:\s*)?(?:URL:\s*)?(https:\/\/\S+)$/m)?.[1];
    if (!urlLine) return [];

    const titleLine = pageOutput.split(/\r?\n/).find((line) => {
      if (!/^L\d+:\s*\S/.test(line) || /URL:/.test(line)) return false;
      return !/^L\d+:\s*`{3,}\s*$/.test(line);
    });
    let fallbackName = urlLine;
    try {
      fallbackName = new URL(urlLine).hostname;
    } catch {
      return [];
    }
    let name = titleLine?.replace(/^L\d+:\s*/, "").trim() || fallbackName;
    name = name.replace(/\\\|/g, "|").slice(0, 120);

    return [{ name, url: urlLine, evidenceText: pageOutput }];
  });

  const unique = new Map(sources.map((source) => [source.url, source]));
  return [...unique.values()].filter(isOfficialAgricultureSource);
}

export function buildTreatmentGuidance(
  response: unknown,
  retrievedSources: RetrievedTreatmentSource[],
  retrievedAt: string,
  crop: string,
  condition: string,
): TreatmentGuidance {
  const parsed = normalizeTreatmentModelResponse(response);
  const sources = retrievedSources.filter(isOfficialAgricultureSource);
  const sourceByUrl = new Map(sources.map((source) => [source.url, source]));
  const category = parsed.causeCategory;
  const cropTerms = crop
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 2);
  const conditionTerms = condition
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(
      (term) =>
        term.length > 3 &&
        !["possible", "probable", "suspected", "likely", "condition", "disease"].includes(term),
    );

  const organicManagement = parsed.organicManagement.flatMap((recommendation) => {
    const source = sourceByUrl.get(recommendation.sourceUrl);
    if (
      !source ||
      !cropMatches(recommendation.targetCrop, crop) ||
      !supportsOrganicManagement(source, cropTerms, conditionTerms, recommendation, crop)
    ) {
      return [];
    }
    return [
      {
        ...recommendation,
        targetCrop: crop,
        sourceName: source.name,
        verificationStatus: "source_supported" as const,
      },
    ];
  });

  const keepSourceSupportedOptions = (
    options: z.infer<typeof recommendationSchema>[],
  ): TreatmentRecommendation[] =>
    options.flatMap((option) => {
      const displayName = option.productName ?? option.activeIngredient;
      if (
        !displayName ||
        !cropMatches(option.targetCrop, crop) ||
        (option.productName !== null && !isNamedCommercialProduct(option.productName))
      ) {
        return [];
      }
      const source = option.sourceUrl ? sourceByUrl.get(option.sourceUrl) : undefined;
      const sourceSupportsOption =
        source !== undefined &&
        supportsRecommendation(
          source,
          cropTerms,
          conditionTerms,
          option.targetCondition,
          option.productName,
          option.brand,
          option.activeIngredient,
          option.formulation,
        );
      if (!sourceSupportsOption || !source) return [];
      return {
        ...option,
        productName: displayName,
        formulation: option.formulation,
        targetCrop: crop,
        applicationMethod: null,
        dose: null,
        waterVolume: null,
        applicationInterval: null,
        maximumApplications: null,
        requiredPpe: [],
        preHarvestInterval: null,
        reEntryInterval: null,
        precautions: [],
        sourceName: source.name,
        sourceUrl: source.url,
        verificationStatus: "source_supported_needs_label_check" as const,
      };
    });

  const organicBiological =
    category === "uncertain"
      ? []
      : keepSourceSupportedOptions(parsed.organicBiological).slice(0, 3);
  const chemical =
    category === "viral" ||
    category === "uncertain" ||
    (category === "unspecified" && /\b(?:viral|virus)\b/i.test(condition))
      ? []
      : keepSourceSupportedOptions(parsed.chemical).slice(
          0,
          Math.max(0, 3 - organicBiological.length),
        );

  return {
    generalCare: parsed.generalCare,
    organicManagement,
    organicBiological,
    chemical,
    sources: sources.map(({ name, url }) => ({ name, url })),
    retrievedAt,
    sourceStatus: sources.length > 0 ? "sources_found" : "no_authoritative_sources",
  };
}
