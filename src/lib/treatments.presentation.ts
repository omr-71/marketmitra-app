export function buildDiagnosisManagementFallback(diagnosis: {
  whatToDoNow: string[];
  prevention: string[];
}): string[] {
  return [...diagnosis.whatToDoNow, ...diagnosis.prevention]
    .map((step) => step.trim())
    .filter((step, index, steps) => step.length > 0 && steps.indexOf(step) === index)
    .slice(0, 5);
}
