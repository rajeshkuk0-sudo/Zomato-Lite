import Link from "next/link";
import { notFound } from "next/navigation";
import { getRestaurant } from "@/lib/fetch-restaurant";

export const dynamic = "force-dynamic";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantData = {
  id: number;
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getRestaurant(id);

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Could not load the restaurant.");
  }

  const restaurant = (await response.json()) as RestaurantData;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] px-6 py-14 sm:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          {restaurant.name}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {restaurant.cuisine} · {restaurant.area}
        </p>
      </header>

      <section className="mt-10">
        <p className="text-xs uppercase tracking-widest text-muted">
          Average rating
        </p>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="text-6xl font-semibold tracking-tighter">
            {restaurant.averageRating ?? "—"}
          </span>
          <span className="text-sm text-muted">
            {restaurant.totalReviews}{" "}
            {restaurant.totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>
      </section>

      {restaurant.latestReview && (
        <section className="mt-10 rounded-xl border border-line bg-[#f4efe4] p-5">
          <p className="text-xs uppercase tracking-widest text-muted">
            Latest review
          </p>
          <p className="mt-2 text-sm font-medium text-accent">
            {restaurant.latestReview.rating} / 5
          </p>
          <p className="mt-1 text-lg leading-relaxed">
            {restaurant.latestReview.comment}
          </p>
        </section>
      )}

      {restaurant.latestReview && restaurant.reviews.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs uppercase tracking-widest text-muted">
            Earlier reviews
          </h2>
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {restaurant.reviews.map((review) => (
              <li key={review.id} className="py-5">
                <p className="text-sm font-medium text-accent">
                  {review.rating} / 5
                </p>
                <p className="mt-1 leading-relaxed">{review.comment}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href={`/review/${restaurant.id}`}
        className="mt-10 inline-block rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Write a review
      </Link>

      {restaurant.totalReviews === 0 && (
        <section className="mt-6 rounded-xl border border-dashed border-line p-6 text-center">
          <p className="text-muted">
            No reviews yet. Be the first to share what you thought.
          </p>
        </section>
      )}
    </main>
  );
}
