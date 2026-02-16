"use client";

import { useMemo, useState } from "react";
import type { ProductReview } from "@/lib/shop-store";

type ProductReviewsProps = {
  productId: string;
  initialReviews: ProductReview[];
};

function ratingLabel(value: number): string {
  return "★".repeat(Math.max(1, Math.min(5, Math.round(value))));
}

export function ProductReviews({ productId, initialReviews }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    if (reviews.length === 0) return { average: 0, count: 0 };
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      average: Number((total / reviews.length).toFixed(1)),
      count: reviews.length,
    };
  }, [reviews]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!author.trim() || !comment.trim()) {
      setError("Ploteso emrin dhe komentin.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          author: author.trim(),
          rating,
          comment: comment.trim(),
        }),
      });

      const data = (await response.json()) as { error?: string; review?: ProductReview };
      if (!response.ok || !data.review) {
        setError(data.error ?? "Nuk u ruajt review.");
        return;
      }

      setReviews((previous) => [data.review!, ...previous]);
      setAuthor("");
      setRating(5);
      setComment("");
    } catch {
      setError("Ka ndodhur nje gabim ne server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reviews</h2>
          <p className="mt-1 text-sm text-slate-600">
            {summary.count > 0
              ? `${summary.average} / 5 nga ${summary.count} review`
              : "Ende nuk ka review per kete produkt."}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Shto review</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_120px]">
          <input
            type="text"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="Emri juaj"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            required
          />
          <select
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value={5}>5 yje</option>
            <option value={4}>4 yje</option>
            <option value={3}>3 yje</option>
            <option value={2}>2 yje</option>
            <option value={1}>1 yll</option>
          </select>
        </div>
        <textarea
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Shkruaj mendimin tend..."
          className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          required
        />
        {error ? (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {isSubmitting ? "Duke ruajtur..." : "Posto Review"}
        </button>
      </form>

      <div className="mt-5 space-y-3">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">{review.author}</p>
              <p className="text-sm font-semibold text-amber-600">{ratingLabel(review.rating)}</p>
            </div>
            <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
            <p className="mt-2 text-xs text-slate-500">{review.createdAt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
