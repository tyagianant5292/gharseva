// Currency helpers. GharSeva operates in India (₹) and the UAE (AED).
export type Country = "IN" | "AE";

export function countryName(country?: string | null): string {
  return country === "AE" ? "United Arab Emirates" : "India";
}

export function currencySymbol(country?: string | null): string {
  return country === "AE" ? "AED" : "₹";
}

// Formats a monthly salary like "₹8,000" or "AED 1,500".
export function formatMoney(amount: number, country?: string | null): string {
  if (country === "AE") return `AED ${amount.toLocaleString("en-AE")}`;
  return `₹${amount.toLocaleString("en-IN")}`;
}
