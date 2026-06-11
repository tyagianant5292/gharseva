import { Star } from "lucide-react";

export default function Stars({ avg, count, size = 14 }: { avg: number; count?: number; size?: number }) {
  const rounded = Math.round(avg * 2) / 2; // nearest half
  return (
    <span className="inline-flex items-center gap-0.5" title={`${avg.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? "full" : rounded >= i - 0.5 ? "half" : "empty";
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-amber-300" />
            {fill !== "empty" && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: fill === "half" ? size / 2 : size }}
              >
                <Star size={size} className="fill-amber-400 text-amber-400" />
              </span>
            )}
          </span>
        );
      })}
      {typeof count === "number" && (
        <span className="ml-1 text-xs text-slate-500">
          {count > 0 ? `${avg.toFixed(1)} (${count})` : "No reviews"}
        </span>
      )}
    </span>
  );
}
