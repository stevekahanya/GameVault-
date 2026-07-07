const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// All game browsing goes through Flask so the RAWG key stays server-side.
async function requestGames(params = {}) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/games?${queryParams}`);

  if (!response.ok) {
    throw new Error("Failed to fetch games.");
  }

  const data = await response.json();

  return {
    results: data.games || [],
    count: data.count || 0,
  };
}

export function getGames() {
  return requestGames();
}

export function searchGames(query) {
  return requestGames({ search: query });
}

export function getFilteredGames({ genre, platform, sortBy }) {
  return requestGames({
    genre,
    platform,
    sort_by: sortBy,
  });
}

export async function getGameById(id) {
  const response = await fetch(`${API_BASE_URL}/games/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch game details.");
  }

  return response.json();
}

export async function getGameScreenshots(id) {
  const response = await fetch(`${API_BASE_URL}/games/${id}/screenshots`);

  if (!response.ok) {
    throw new Error("Failed to fetch screenshots.");
  }

  return response.json();
}
