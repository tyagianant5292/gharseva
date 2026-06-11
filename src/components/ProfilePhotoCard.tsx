"use client";

import { useState } from "react";
import { Camera, Trash2, User } from "lucide-react";
import { fileToResizedDataUrl } from "@/lib/image";

export default function ProfilePhotoCard({
  initialPhoto,
  name,
}: {
  initialPhoto: string | null;
  name: string;
}) {
  const [photo, setPhoto] = useState<string | null>(initialPhoto);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function onPick(file: File | undefined) {
    if (!file) return;
    if (file.type === "application/pdf" || !file.type.startsWith("image/")) {
      setError("Please choose an image.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const [full, thumb] = await Promise.all([
        fileToResizedDataUrl(file, 700, 0.72),
        fileToResizedDataUrl(file, 96, 0.6),
      ]);
      const res = await fetch("/api/provider/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: full, photoThumbUrl: thumb }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Upload failed");
      }
      setPhoto(full);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await fetch("/api/provider/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remove: true }),
      });
      setPhoto(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} className="h-16 w-16 rounded-full object-cover ring-1 ring-slate-200" />
      ) : (
        <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
          {initials || <User size={22} />}
        </div>
      )}
      <div className="mr-auto">
        <p className="text-sm font-semibold text-slate-800">Profile photo</p>
        <p className="text-xs text-slate-500">
          {photo ? "Shown on your card and profile." : "Add a friendly photo so families trust you more (optional)."}
        </p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <div className="flex items-center gap-2">
        <label className="btn-outline cursor-pointer">
          <Camera size={15} /> {busy ? "…" : photo ? "Change" : "Upload"}
          <input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} disabled={busy} />
        </label>
        {photo && (
          <button onClick={remove} disabled={busy} className="btn px-2.5 py-2 text-red-600 hover:bg-red-50" title="Remove photo">
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
