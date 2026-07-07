import "./Filters.css";

// Controlled filter inputs keep Browse Games as the single source of query state.
function Filters({
  genre,
  platform,
  sortBy,
  onGenreChange,
  onPlatformChange,
  onSortChange,
}) {
  return (
    <div className="filters">
      <select value={genre} onChange={(e) => onGenreChange(e.target.value)}>
        <option value="">All Genres</option>
        <option value="action">Action</option>
        <option value="adventure">Adventure</option>
        <option value="role-playing-games-rpg">RPG</option>
        <option value="shooter">Shooter</option>
        <option value="sports">Sports</option>
        <option value="racing">Racing</option>
      </select>

      <select value={platform} onChange={(e) => onPlatformChange(e.target.value)}>
        <option value="">All Platforms</option>
        <option value="4">PC</option>
        <option value="187">PlayStation 5</option>
        <option value="18">PlayStation 4</option>
        <option value="1">Xbox One</option>
        <option value="186">Xbox Series S/X</option>
        <option value="7">Nintendo Switch</option>
      </select>

      <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        <option value="">Default Sorting</option>
        <option value="-rating">Highest Rated</option>
        <option value="rating">Lowest Rated</option>
        <option value="-released">Newest First</option>
        <option value="released">Oldest First</option>
      </select>
    </div>
  );
}

export default Filters;
