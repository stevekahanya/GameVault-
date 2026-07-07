import { useEffect, useState } from "react";

import {
  deleteFavourite,
  getFavourites,
  saveFavourite,
} from "../services/favouritesApi";
import { FavoritesContext } from "./favoritesContextValue";
import { useAuth } from "./useAuth";

// Loads and mutates favorites for the authenticated user only.
export function FavoritesProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [favoritesError, setFavoritesError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let ignore = false;

    // Favorites are loaded after login and hidden from consumers when logged out.
    async function loadFavorites() {
      setIsLoadingFavorites(true);
      setFavoritesError("");

      try {
        const data = await getFavourites();

        if (!ignore) {
          setFavorites(data.map((item) => item.game));
        }
      } catch (error) {
        if (!ignore) {
          setFavoritesError(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoadingFavorites(false);
        }
      }
    }

    loadFavorites();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, user?.id]);

  const addFavorite = async (game) => {
    if (!isAuthenticated) {
      throw new Error("Log in to save favourites.");
    }

    if (favorites.find((favorite) => favorite.id === game.id)) {
      return;
    }

    await saveFavourite(game);
    setFavorites((currentFavorites) => [...currentFavorites, game]);
  };

  const removeFavorite = async (gameId) => {
    await deleteFavourite(gameId);
    setFavorites((currentFavorites) =>
      currentFavorites.filter((game) => game.id !== gameId)
    );
  };

  const isFavorite = (gameId) => {
    return favorites.some((game) => game.id === gameId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites: isAuthenticated ? favorites : [],
        favoritesError: isAuthenticated ? favoritesError : "",
        isLoadingFavorites,
        addFavorite,
        removeFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
