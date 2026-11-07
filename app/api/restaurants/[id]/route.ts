import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  created_at: string | Date;
};

function toReview(row: ReviewRow) {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId) || restaurantId < 1) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 404 }
    );
  }

  try {
    const sql = getSql();

    const restaurants = await sql.query(
      "SELECT id, name, cuisine, area FROM restaurants WHERE id = $1",
      [restaurantId]
    );

    if (restaurants.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 404 }
      );
    }

    const restaurant = restaurants[0];

    const stats = await sql.query(
      "SELECT ROUND(AVG(rating)::numeric, 1)::float AS average_rating, COUNT(*)::int AS total_reviews FROM reviews WHERE restaurant_id = $1",
      [restaurantId]
    );

    const rows = (await sql.query(
      "SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC, id DESC",
      [restaurantId]
    )) as ReviewRow[];

    const averageRating =
      stats[0].average_rating === null
        ? null
        : Number(stats[0].average_rating);

    return NextResponse.json({
      id: restaurant.id,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      averageRating,
      totalReviews: stats[0].total_reviews,
      latestReview: rows.length > 0 ? toReview(rows[0]) : null,
      reviews: rows.slice(1).map(toReview),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load the restaurant. Please try again." },
      { status: 500 }
    );
  }
}
