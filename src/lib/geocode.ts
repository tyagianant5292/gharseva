// Best-effort geocoding via OpenStreetMap Nominatim (free, no API key).
// Used to derive a provider's map location from their stated city/pincode so that
// "near me" distance search reflects where they actually work — not wherever a
// phone happened to be when they tapped "use my location".

export type LatLng = { lat: number; lng: number };

// Ordered list of queries to try, most precise first, with safe fallbacks so a
// typo'd locality/city doesn't sink the whole lookup.
export function locationQueries(country: string, pincode: string, city: string, locality: string): string[] {
  const qs: string[] = [];
  if (country === "AE") {
    if (locality && city) qs.push(`${locality}, ${city}, United Arab Emirates`);
    if (city) qs.push(`${city}, United Arab Emirates`);
  } else {
    // India: a 6-digit pincode is the most reliable signal — try it first.
    if (/^[0-9]{6}$/.test(pincode)) qs.push(`${pincode}, India`);
    if (locality && city) qs.push(`${locality}, ${city}, India`);
    if (city) qs.push(`${city}, India`);
  }
  return [...new Set(qs.filter(Boolean))];
}

export async function geocode(query: string): Promise<LatLng | null> {
  if (!query.trim()) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "GharSeva/1.0 (https://gharseva-rho.vercel.app)" },
      // Cache for a day — the same area resolves to the same point.
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat?: string; lon?: string }>;
    const hit = data?.[0];
    if (hit?.lat && hit?.lon) {
      const lat = parseFloat(hit.lat);
      const lng = parseFloat(hit.lon);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
    return null;
  } catch {
    return null;
  }
}

// Convenience: geocode a provider's stated location, trying precise → looser queries.
export async function geocodeProvider(
  country: string,
  pincode: string,
  city: string,
  locality: string,
): Promise<LatLng | null> {
  for (const q of locationQueries(country, pincode, city, locality)) {
    const hit = await geocode(q);
    if (hit) return hit;
  }
  return null;
}
