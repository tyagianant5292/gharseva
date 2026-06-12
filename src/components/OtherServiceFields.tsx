"use client";

// Shown when a provider offers the "Other" service — lets them name it + describe it.
export default function OtherServiceFields({
  name,
  setName,
  desc,
  setDesc,
}: {
  name: string;
  setName: (v: string) => void;
  desc: string;
  setDesc: (v: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
      <p className="text-sm font-semibold text-violet-900">✨ Your “Other” service</p>
      <div>
        <label className="label">Service name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={60}
          className="input"
          placeholder="e.g. Pet grooming, Pest control, Tutor"
        />
      </div>
      <div>
        <label className="label">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          maxLength={300}
          className="input"
          placeholder="What exactly do you offer? Families searching “Other” will see this."
        />
      </div>
    </div>
  );
}
