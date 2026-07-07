import { useState } from "react";
import "./SearchBar.css";

// Local search form delegates the actual game lookup to the Browse Games page.
function SearchBar({ onSearch, isSearching = false }) {
  const [query, setQuery] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSearch(query);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <label className="search-bar__label" htmlFor="game-search">
        Search games
      </label>

      <div className="search-bar__controls">
        <input
          className="search-bar__input"
          id="game-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try Minecraft, FIFA..."
          autoComplete="off"
        />

        <button
          className="search-bar__button"
          type="submit"
          disabled={isSearching || !query.trim()}
        >
          {isSearching ? "Searching" : "Search"}
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
