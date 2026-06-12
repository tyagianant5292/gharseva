// Helpers for per-service daily ("instant") rates, stored as { serviceKey: ratePerDay }.

// Keep only services the provider actually offers, with a positive integer rate.
export function cleanInstantRates(
  rates: Record<string, unknown> | undefined | null,
  services: string[],
): Record<string, number> {
  const out: Record<string, number> = {};
  if (!rates) return out;
  for (const s of services) {
    const r = Number(rates[s as keyof typeof rates]);
    if (Number.isFinite(r) && r > 0) out[s] = Math.round(r);
  }
  return out;
}

// The "from" price = cheapest service rate (used for cards / sorting).
export function minRate(rates: Record<string, number>): number | null {
  const vals = Object.values(rates);
  return vals.length ? Math.min(...vals) : null;
}

// Safely read a stored Json rates value into a typed map.
export function asRates(value: unknown): Record<string, number> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, number>;
  }
  return {};
}
