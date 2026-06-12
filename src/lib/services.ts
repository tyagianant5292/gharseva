// Domestic service categories offered on GharSeva.

export type ServiceDef = { key: string; label: string; icon: string };

export const SERVICES: ServiceDef[] = [
  { key: "MAID", label: "Maid / Housekeeping", icon: "🧹" },
  { key: "COOK", label: "Cook", icon: "🍳" },
  { key: "NANNY", label: "Nanny / Babysitter", icon: "👶" },
  { key: "ELDER_CARE", label: "Elderly Care", icon: "🧓" },
  { key: "PATIENT_CARE", label: "Patient Care", icon: "🏥" },
  { key: "DRIVER", label: "Driver", icon: "🚗" },
  { key: "GARDENER", label: "Gardener", icon: "🌿" },
  { key: "OTHER", label: "Other", icon: "✨" },
];

const SERVICE_MAP = new Map(SERVICES.map((s) => [s.key, s]));

export function serviceLabel(key: string): string {
  return SERVICE_MAP.get(key)?.label ?? key;
}

export function serviceIcon(key: string): string {
  return SERVICE_MAP.get(key)?.icon ?? "•";
}

// Label to show for a provider's service — uses the custom name for "OTHER".
export function displayService(key: string, otherName?: string | null): string {
  if (key === "OTHER" && otherName?.trim()) return otherName.trim();
  return serviceLabel(key);
}

export const SERVICE_KEYS = SERVICES.map((s) => s.key);
