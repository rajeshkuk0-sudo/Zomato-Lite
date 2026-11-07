"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STAR_VALUES = [1, 2, 3, 4, 5];

export function ReviewForm({ restaurantId }: { restaurantId: number }) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    rating !== null && comment.trim().length > 0 && !submitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not submit the review.");
        setSubmitting(false);
        return;
      }

      router.push(`/restaurant/${restaurantId}`);
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10">
      <fieldset>
        <legend className="text-sm font-medium">Your rating</legend>
        <div className="mt-3 flex gap-2">
          {STAR_VALUES.map((value) => {
            const selected = rating === value;
            const filled = rating !== null && value <= rating;

            return (
              <button
                key={value}
                type="button"
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                aria-pressed={selected}
                onClick={() => setRating(value)}
                className={`flex h-12 w-12 items-center justify-center rounded-lg border text-xl transition-colors ${
                  filled
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-white text-muted hover:border-accent hover:text-accent"
                }`}
              >
                ★
              </button>
            );
          })}
        </div>
      </fieldset>

      <label htmlFor="comment" className="mt-8 block text-sm font-medium">
        Your comment
      </label>
      <textarea
        id="comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={5}
        placeholder="What stood out?"
        className="mt-3 w-full resize-none rounded-lg border border-line bg-white p-4 text-base outline-none focus:border-accent"
      />

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-accent"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-6 w-full rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {submitting ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
