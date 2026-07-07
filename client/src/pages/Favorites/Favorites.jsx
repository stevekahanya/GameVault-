import { useFavorites } from "../../context/useFavorites";
import GameCard from "../../components/GameCard/GameCard";
import "./Favorites.css";

// Protected page for the current user's saved games.
function Favorites() {
  const { favorites, favoritesError, isLoadingFavorites } = useFavorites();

  return (
    <main className="favorites-page">
      <div className="favorites-header">
        <h1>My Favorites</h1>
        <p>Your saved games collection</p>
      </div>

      {isLoadingFavorites && (
        <div className="empty-favorites">
          <h2>Loading saved games</h2>
          <p>Fetching your collection.</p>
        </div>
      )}

      {favoritesError && (
        <div className="empty-favorites">
          <h2>Could not load favorites</h2>
          <p>{favoritesError}</p>
        </div>
      )}

      {!isLoadingFavorites && !favoritesError && favorites.length === 0 ? (
        <div className="empty-favorites">
          <h2>No Favorites Yet</h2>
          <p>Browse games and add some to your favorites collection.</p>
        </div>
      ) : null}

      {!isLoadingFavorites && !favoritesError && favorites.length > 0 && (
        <div className="favorites-grid">
          {favorites.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </main>
  );
}

export default Favorites;
