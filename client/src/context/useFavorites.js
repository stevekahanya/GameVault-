import { useContext } from "react";

import { FavoritesContext } from "./favoritesContextValue";

// Shared hook for listing, saving, removing, and checking user favorites.
export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used inside a FavoritesProvider.");
  }

  return context;
}
