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
  { key: "ALL_ROUNDER", label: "All-rounder", icon: "⭐" },
];

const SERVICE_MAP = new Map(SERVICES.map((s) => [s.key, s]));

export function serviceLabel(key: string): string {
  return SERVICE_MAP.get(key)?.label ?? key;
}

export function serviceIcon(key: string): string {
  return SERVICE_MAP.get(key)?.icon ?? "•";
}

export const SERVICE_KEYS = SERVICES.map((s) => s.key);
