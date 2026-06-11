"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import Stars from "./Stars";

export type Review = { id: string; authorName: string; rating: number; comment: string | null; createdAt: string };

export default function ReviewsSection({
  providerId,
  ratingAvg,
  ratingCount,
  reviews,
  canReview,
  myReview,
  loggedIn,
  onChange,
}: {
  providerId: string;
  ratingAvg: number;
  ratingCount: number;
  reviews: Review[];
  canReview: boolean;
  myReview: { rating: number; comment: string | null } | null;
  loggedIn: boolean;
  onChange: () => void;
}) {
  const [rating, setRating] = useState(myReview?.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(myReview?.comment || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) {
      setError("Please pick a star rating.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/providers/${providerId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not submit review");
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Reviews</h2>
        {ratingCount > 0 && <Stars avg={ratingAvg} count={ratingCount} size={16} />}
      </div>

      {/* Write / edit review */}
      {canReview ? (
        <form onSubmit={submit} className="card mt-3 p-4">
          <p className="text-sm font-medium text-slate-700">
            {myReview ? "Update your review" : "Rate this helper"}
          </p>
          <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHover(i)}
                onClick={() => setRating(i)}
                className="text-amber-400"
                aria-label={`${i} star`}
              >
                <Star size={26} className={(hover || rating) >= i ? "fill-amber-400" : "text-amber-200"} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            maxLength={600}
            placeholder="Share your experience (optional)…"
            className="input mt-3"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary mt-3">
            {busy ? "Saving…" : myReview ? "Update review" : "Submit review"}
          </button>
        </form>
      ) : !loggedIn ? (
        <p className="mt-2 text-sm text-slate-500">
          <Link href={`/login?next=/providers/${providerId}`} className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>{" "}
          to leave a review.
        </p>
      ) : null}

      {/* List */}
      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">No reviews yet. Be the first to review.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{r.authorName}</span>
                <Stars avg={r.rating} size={13} />
              </div>
              {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
              <p className="mt-1 text-xs text-slate-400">
                {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
