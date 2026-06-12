// Weekday availability for short-term / instant helpers.

export const WEEKDAYS: { key: string; label: string; full: string }[] = [
  { key: "MON", label: "Mon", full: "Monday" },
  { key: "TUE", label: "Tue", full: "Tuesday" },
  { key: "WED", label: "Wed", full: "Wednesday" },
  { key: "THU", label: "Thu", full: "Thursday" },
  { key: "FRI", label: "Fri", full: "Friday" },
  { key: "SAT", label: "Sat", full: "Saturday" },
  { key: "SUN", label: "Sun", full: "Sunday" },
];

const ORDER = WEEKDAYS.map((w) => w.key);
const LABEL = new Map(WEEKDAYS.map((w) => [w.key, w.label]));

// "Any day" if empty or all 7; otherwise an ordered short list like "Mon, Wed, Sat".
export function formatDays(days: string[] | null | undefined): string {
  if (!days || days.length === 0 || days.length >= 7) return "Any day";
  return ORDER.filter((d) => days.includes(d))
    .map((d) => LABEL.get(d))
    .join(", ");
}

// Maps a JS Date.getDay() (0=Sun..6=Sat) to our weekday key.
const JS_DAY = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export function weekdayKey(date: Date): string {
  return JS_DAY[date.getDay()];
}
