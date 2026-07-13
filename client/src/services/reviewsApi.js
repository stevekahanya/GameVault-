import { getAuthToken } from "./authApi";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000/api";

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || fallbackMessage);
  }

  return data;
}

export async function getGameReviews(gameId) {
  try {
    const response = await fetch(`${BASE_URL}/games/${gameId}/reviews`);
    return await parseResponse(response, "Failed to fetch reviews.");
  } catch (error) {
    console.warn(error.message);
    return [];
  }
}

export async function submitGameReview(gameId, reviewData) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Please log in to leave a review.");
  }

  const response = await fetch(`${BASE_URL}/games/${gameId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });

  return parseResponse(response, "Failed to submit review.");
}

export async function deleteGameReview(gameId, reviewId) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Please log in to delete a review.");
  }

  const response = await fetch(
    `${BASE_URL}/games/${gameId}/reviews/${reviewId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseResponse(response, "Failed to delete review.");
}
