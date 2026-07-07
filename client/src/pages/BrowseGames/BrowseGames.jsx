import { useEffect, useState } from "react";
import "./BrowseGames.css";

import SearchBar from "../../components/SearchBar/SearchBar";
import Filters from "../../components/Filters/Filters";
import GameCard from "../../components/GameCard/GameCard";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

import {
  getGames,
  searchGames,
  getFilteredGames,
} from "../../services/gameApi";

// Browse Games coordinates search, filters, and the public game grid.
function BrowseGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [genre, setGenre] = useState("");
  const [platform, setPlatform] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Initial load uses the Flask game proxy, which falls back when RAWG is not configured.
  useEffect(() => {
    let ignore = false;

    getGames()
      .then((data) => {
        if (!ignore) {
          setGames(data.results || []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError("Failed to load games.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSearch(query) {
    try {
      setLoading(true);
      setError("");

      const data = await searchGames(query);
      setGames(data.results || []);
    } catch {
      setError("Failed to search games.");
    } finally {
      setLoading(false);
    }
  }

  async function applyFilters(nextFilters) {
    try {
      setLoading(true);
      setError("");

      const data = await getFilteredGames(nextFilters);

      setGames(data.results || []);
    } catch {
      setError("Failed to filter games.");
    } finally {
      setLoading(false);
    }
  }

  function handleGenreChange(value) {
    setGenre(value);
    applyFilters({ genre: value, platform, sortBy });
  }

  function handlePlatformChange(value) {
    setPlatform(value);
    applyFilters({ genre, platform: value, sortBy });
  }

  function handleSortChange(value) {
    setSortBy(value);
    applyFilters({ genre, platform, sortBy: value });
  }

  return (
    <main className="browse-games">
      <div className="browse-games-header">
        <h1>Browse Games</h1>
        <p>Discover your next gaming adventure.</p>
      </div>

      <div className="search-filter-container">
        <SearchBar onSearch={handleSearch} isSearching={loading} />

        <Filters
          genre={genre}
          platform={platform}
          sortBy={sortBy}
          onGenreChange={handleGenreChange}
          onPlatformChange={handlePlatformChange}
          onSortChange={handleSortChange}
        />
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="error-message">{error}</p>}

      {!loading && games.length === 0 && (
        <div className="no-games">
          <p>No games found.</p>
        </div>
      )}

      {!loading && games.length > 0 && (
        <div className="games-grid">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </main>
  );
}

export default BrowseGames;
