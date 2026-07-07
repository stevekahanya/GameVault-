import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import { useFavorites } from "../../context/useFavorites";
import "./GameCard.css";

// Reusable game summary card with authenticated save/remove behavior.
const GameCard = ({ game }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addFavorite, isFavorite, removeFavorite } = useFavorites();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const {
    id,
    name,
    background_image,
    rating,
    released,
  } = game;
  const saved = isFavorite(id);

  // Guests are routed to login; authenticated users persist favorites through the API.
  async function handleFavoriteClick() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/favorites" } } });
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      if (saved) {
        await removeFavorite(id);
      } else {
        await addFavorite(game);
      }
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="game-card">
      <div className="card-image-container">
        {background_image ? (
          <img
            src={background_image}
            alt={name}
            className="card-image"
            loading="lazy"
          />
        ) : (
          <div className="card-image card-image--empty">{name.charAt(0)}</div>
        )}

        {rating && (
          <span className="game-rating">
            {rating.toFixed ? rating.toFixed(1) : rating}
          </span>
        )}
      </div>

      <div className="card-info-box">
        <h3 className="game-title">{name}</h3>

        <div className="card-content">
          <p className="game-release-date">
            Released: {released || "Unknown"}
          </p>
        </div>

        {saveError && <p className="game-card__error">{saveError}</p>}

        <button
          type="button"
          className={`favorite-button ${saved ? "favorite-button--saved" : ""}`}
          onClick={handleFavoriteClick}
          disabled={isSaving}
          aria-pressed={saved}
        >
          {isSaving ? "Saving" : saved ? "Saved" : "Save"}
        </button>

        <Link
          to={`/games/${id}`}
          className="details-button"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default GameCard;
