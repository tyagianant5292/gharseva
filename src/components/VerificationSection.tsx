"use client";

import { useState } from "react";
import { BadgeCheck, ShieldAlert, Clock, Upload, ShieldCheck } from "lucide-react";
import { fileToResizedDataUrl } from "@/lib/image";

type Status = "PENDING" | "VERIFIED" | "REJECTED";

const ID_TYPES = ["Aadhaar Card", "PAN Card", "Driving License", "Voter ID", "Passport"];

export default function VerificationSection({
  initialStatus,
  note,
  hasIdDoc,
  photoUrl,
}: {
  initialStatus: Status;
  note?: string | null;
  hasIdDoc: boolean;
  photoUrl?: string | null;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [idType, setIdType] = useState(ID_TYPES[0]);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(photoUrl || null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(initialStatus !== "VERIFIED");

  async function onPick(file: File | undefined, kind: "id" | "photo") {
    if (!file) return;
    const max = kind === "id" ? 1200 : 600;
    const dataUrl = await fileToResizedDataUrl(file, max, kind === "id" ? 0.78 : 0.7);
    if (kind === "id") setIdPreview(dataUrl);
    else setPhotoPreview(dataUrl);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!idPreview) {
      setError("Please upload a photo of your ID document.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/provider/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idDocType: idType,
          idDocUrl: idPreview,
          photoUrl: photoPreview && photoPreview.startsWith("data:") ? photoPreview : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not submit");
      setStatus("PENDING");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  const banner = {
    VERIFIED: {
      cls: "bg-teal-50 text-teal-800 ring-teal-200",
      icon: <BadgeCheck size={18} />,
      title: "You're verified",
      text: "Your profile shows a Verified badge to customers.",
    },
    PENDING: {
      cls: "bg-amber-50 text-amber-800 ring-amber-200",
      icon: <Clock size={18} />,
      title: hasIdDoc ? "Verification under review" : "Get verified",
      text: hasIdDoc
        ? "We've received your documents. An admin will review them shortly."
        : "Upload an ID document to get a Verified badge and win more trust.",
    },
    REJECTED: {
      cls: "bg-red-50 text-red-800 ring-red-200",
      icon: <ShieldAlert size={18} />,
      title: "Verification was not approved",
      text: note || "Please re-upload a clear ID document.",
    },
  }[status];

  return (
    <div className="card mt-5 p-5">
      <div className={`flex items-start gap-3 rounded-lg px-4 py-3 ring-1 ${banner.cls}`}>
        {banner.icon}
        <div>
          <p className="text-sm font-semibold">{banner.title}</p>
          <p className="text-sm opacity-90">{banner.text}</p>
        </div>
        {status !== "VERIFIED" && (
          <button onClick={() => setOpen((o) => !o)} className="ml-auto text-sm font-medium underline">
            {open ? "Hide" : hasIdDoc ? "Re-upload" : "Upload"}
          </button>
        )}
      </div>

      {open && status !== "VERIFIED" && (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">ID document type</label>
              <select value={idType} onChange={(e) => setIdType(e.target.value)} className="input">
                {ID_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Upload ID (photo/scan)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onPick(e.target.files?.[0], "id")}
                className="input file:mr-3 file:rounded file:border-0 file:bg-brand-100 file:px-3 file:py-1 file:text-brand-700"
              />
            </div>
          </div>

          <div>
            <label className="label">Profile photo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPick(e.target.files?.[0], "photo")}
              className="input file:mr-3 file:rounded file:border-0 file:bg-brand-100 file:px-3 file:py-1 file:text-brand-700"
            />
          </div>

          <div className="flex items-center gap-4">
            {photoPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="photo preview" className="h-16 w-16 rounded-full object-cover ring-1 ring-slate-200" />
            )}
            {idPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={idPreview} alt="ID preview" className="h-16 w-24 rounded object-cover ring-1 ring-slate-200" />
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={13} /> Your ID is shared only with the admin team for verification.
          </p>

          <button type="submit" disabled={busy} className="btn-primary justify-center">
            <Upload size={16} /> {busy ? "Submitting…" : "Submit for verification"}
          </button>
        </form>
      )}
    </div>
  );
}
