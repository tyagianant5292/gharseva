"use client";

import { useState } from "react";
import { BadgeCheck, ShieldAlert, Clock, Upload, ShieldCheck, FileText, Camera } from "lucide-react";
import { fileToUploadData, type UploadKind } from "@/lib/image";

type Status = "PENDING" | "VERIFIED" | "REJECTED";
type Pick = { dataUrl: string; kind: UploadKind } | null;

const ID_TYPES = ["Aadhaar Card", "PAN Card", "Driving License", "Voter ID", "Passport"];
// IDs that typically have two sides — show the back-side uploader for these.
const TWO_SIDED = new Set(["Aadhaar Card", "Driving License", "Voter ID"]);

function Preview({ pick, label }: { pick: Pick; label: string }) {
  if (!pick) return null;
  if (pick.kind === "pdf")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
        <FileText size={14} /> {label} (PDF) ✓
      </span>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={pick.dataUrl} alt={label} className="h-16 w-24 rounded object-cover ring-1 ring-slate-200" />;
}

export default function VerificationSection({
  initialStatus,
  note,
  hasIdDoc,
}: {
  initialStatus: Status;
  note?: string | null;
  hasIdDoc: boolean;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [idType, setIdType] = useState(ID_TYPES[0]);
  const [front, setFront] = useState<Pick>(null);
  const [back, setBack] = useState<Pick>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hasDoc, setHasDoc] = useState(hasIdDoc);
  const [open, setOpen] = useState(initialStatus !== "VERIFIED" && !hasIdDoc);

  async function pick(file: File | undefined, set: (p: Pick) => void, kind: "id" | "photo") {
    if (!file) return;
    setError("");
    try {
      const r = await fileToUploadData(file, kind === "id" ? 1500 : 700, kind === "id" ? 0.82 : 0.72);
      if (kind === "photo" && r.kind === "pdf") {
        setError("Profile photo must be an image, not a PDF.");
        return;
      }
      set(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read file");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!front) {
      setError("Please upload your ID (front side, or a PDF of the full document).");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/provider/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idDocType: idType,
          idDocUrl: front.dataUrl,
          idDocBackUrl: back?.dataUrl,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not submit");
      setStatus("PENDING");
      setHasDoc(true);
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
      title: hasDoc ? "Documents submitted — under review" : "Document verification",
      text: hasDoc
        ? "We've received your documents. An admin will review them and you'll be notified."
        : "Upload an ID document — an admin approves it and you get the Verified badge.",
    },
    REJECTED: {
      cls: "bg-red-50 text-red-800 ring-red-200",
      icon: <ShieldAlert size={18} />,
      title: "Verification was not approved",
      text: note || "Please re-upload a clear ID document.",
    },
  }[status];

  const fileInputCls =
    "input file:mr-3 file:rounded file:border-0 file:bg-brand-100 file:px-3 file:py-1 file:text-brand-700";
  const showBack = TWO_SIDED.has(idType) && front?.kind !== "pdf";

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
            {open ? "Hide" : hasDoc ? "Re-upload" : "Upload"}
          </button>
        )}
      </div>

      {open && status !== "VERIFIED" && (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className="label">ID document type</label>
            <select value={idType} onChange={(e) => setIdType(e.target.value)} className="input sm:max-w-xs">
              {ID_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              {TWO_SIDED.has(idType)
                ? "Upload front and back as photos, or a single PDF of the full document."
                : "Upload a clear photo or a PDF of the document."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">ID — front {front?.kind === "pdf" ? "(PDF)" : ""}</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={(e) => pick(e.target.files?.[0], setFront, "id")}
                className={fileInputCls}
              />
            </div>
            {showBack && (
              <div>
                <label className="label">ID — back (optional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  capture="environment"
                  onChange={(e) => pick(e.target.files?.[0], setBack, "id")}
                  className={fileInputCls}
                />
              </div>
            )}
          </div>

          {(front || back) && (
            <div className="flex flex-wrap items-center gap-3">
              <Preview pick={front} label="Front" />
              <Preview pick={back} label="Back" />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} /> Your ID is shared only with the admin team.
            </span>
            <span className="flex items-center gap-1">
              <Camera size={13} /> On phones you can click a photo directly.
            </span>
          </p>

          <button type="submit" disabled={busy} className="btn-primary justify-center">
            <Upload size={16} /> {busy ? "Submitting…" : "Submit for verification"}
          </button>
        </form>
      )}
    </div>
  );
}
