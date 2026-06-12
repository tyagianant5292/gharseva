"use client";

import { useState } from "react";

// Dial codes the user can scroll/select. India & UAE first, then nearby GCC + common ones.
export const DIAL_CODES = [
  { code: "+91", flag: "🇮🇳", country: "India" },
  { code: "+971", flag: "🇦🇪", country: "United Arab Emirates" },
  { code: "+966", flag: "🇸🇦", country: "Saudi Arabia" },
  { code: "+974", flag: "🇶🇦", country: "Qatar" },
  { code: "+965", flag: "🇰🇼", country: "Kuwait" },
  { code: "+968", flag: "🇴🇲", country: "Oman" },
  { code: "+973", flag: "🇧🇭", country: "Bahrain" },
  { code: "+1", flag: "🇺🇸", country: "USA / Canada" },
  { code: "+44", flag: "🇬🇧", country: "United Kingdom" },
  { code: "+92", flag: "🇵🇰", country: "Pakistan" },
  { code: "+880", flag: "🇧🇩", country: "Bangladesh" },
  { code: "+977", flag: "🇳🇵", country: "Nepal" },
  { code: "+94", flag: "🇱🇰", country: "Sri Lanka" },
  { code: "+63", flag: "🇵🇭", country: "Philippines" },
];

// Splits a stored value like "+971501234567" into its dial code + local number.
function parsePhone(full: string | undefined, fallback: string) {
  const trimmed = (full || "").replace(/[\s-]/g, "");
  const codes = DIAL_CODES.map((d) => d.code).sort((a, b) => b.length - a.length);
  for (const c of codes) {
    if (trimmed.startsWith(c)) return { code: c, number: trimmed.slice(c.length) };
  }
  return { code: fallback, number: trimmed.replace(/^\+/, "") };
}

export default function PhoneInput({
  name = "mobile",
  defaultValue,
  defaultCode = "+91",
  required,
  onChange,
}: {
  name?: string;
  defaultValue?: string;
  defaultCode?: string;
  required?: boolean;
  onChange?: (full: string) => void;
}) {
  const init = parsePhone(defaultValue, defaultCode);
  const [code, setCode] = useState(init.code);
  const [number, setNumber] = useState(init.number);

  const full = number ? `${code}${number}` : "";

  function emit(c: string, n: string) {
    onChange?.(n ? `${c}${n}` : "");
  }

  return (
    <div className="flex">
      <select
        aria-label="Country code"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          emit(e.target.value, number);
        }}
        className="input w-[6.5rem] flex-shrink-0 rounded-r-none border-r-0 pl-3 pr-1 font-medium"
      >
        {DIAL_CODES.map((d) => (
          <option key={d.code} value={d.code} title={d.country}>
            {d.flag} {d.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="numeric"
        required={required}
        value={number}
        onChange={(e) => {
          // keep digits only (people may paste spaces/dashes)
          const n = e.target.value.replace(/[^0-9]/g, "");
          setNumber(n);
          emit(code, n);
        }}
        placeholder="98765 43210"
        className="input flex-1 rounded-l-none"
      />
      {/* Combined value for FormData-based forms */}
      <input type="hidden" name={name} value={full} />
    </div>
  );
}
