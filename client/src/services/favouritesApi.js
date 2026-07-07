import { apiRequest } from "./authApi";

// Favorite routes are user-owned, so every request goes through the auth helper.
export function getFavourites() {
  return apiRequest("/favourites/");
}

export function saveFavourite(game) {
  return apiRequest("/favourites/", {
    method: "POST",
    body: {
      game_id: game.id,
      game,
    },
  });
}

export function deleteFavourite(gameId) {
  return apiRequest(`/favourites/${gameId}`, {
    method: "DELETE",
  });
}
