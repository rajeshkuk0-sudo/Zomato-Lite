import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export async function POST(request: Request) {
  let body: Record<string, unknown> | null = null;

  try {
    const parsed = await request.json();

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const rating = body?.rating;
  const comment = body?.comment;
  const restaurantId = body?.restaurantId;

  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "Rating must be a whole number from 1 to 5." },
      { status: 400 }
    );
  }

  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "Comment must not be empty." },
      { status: 400 }
    );
  }

  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 400 }
    );
  }

  try {
    const sql = getSql();

    const restaurants = await sql.query(
      "SELECT id FROM restaurants WHERE id = $1",
      [restaurantId]
    );

    if (restaurants.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 400 }
      );
    }

    const inserted = await sql.query(
      "INSERT INTO reviews (restaurant_id, rating, comment) VALUES ($1, $2, $3) RETURNING id",
      [restaurantId, rating, comment.trim()]
    );

    return NextResponse.json(
      { success: true, reviewId: inserted[0].id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Could not save the review. Please try again." },
      { status: 500 }
    );
  }
}
