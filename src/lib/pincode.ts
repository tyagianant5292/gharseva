"use client";

export type PincodeInfo = { city: string; state: string; areas: string[] };

// Look up an Indian pincode (via our server proxy). Returns null if not found.
export async function lookupPincode(code: string): Promise<PincodeInfo | null> {
  if (!/^[0-9]{6}$/.test(code)) return null;
  try {
    const res = await fetch(`/api/pincode/${code}`);
    if (!res.ok) return null;
    const d = await res.json();
    return d.found ? { city: d.city, state: d.state, areas: d.areas } : null;
  } catch {
    return null;
  }
}
