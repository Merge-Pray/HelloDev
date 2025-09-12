import jaroWinkler from "jaro-winkler";

export function normalizeText(text) {
  if (!text) return "";

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s#+.-]/g, "")
    .replace(/\s+/g, "");
}

export function fuzzyMatch(term1, term2) {
  if (!term1 || !term2) return 0;

  const normalized1 = normalizeText(term1);
  const normalized2 = normalizeText(term2);

  if (normalized1 === normalized2) return 100;

  const score = Math.round(jaroWinkler(normalized1, normalized2) * 100);

  return score >= 70 ? score : 0;
}
