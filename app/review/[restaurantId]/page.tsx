import { notFound } from "next/navigation";
import { getRestaurant } from "@/lib/fetch-restaurant";
import { ReviewForm } from "./review-form";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const response = await getRestaurant(restaurantId);

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Could not load the restaurant.");
  }

  const restaurant = (await response.json()) as {
    id: number;
    name: string;
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] px-6 py-14 sm:py-20">
      <p className="text-xs uppercase tracking-widest text-muted">Review</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {restaurant.name}
      </h1>

      <ReviewForm restaurantId={restaurant.id} />
    </main>
  );
}
