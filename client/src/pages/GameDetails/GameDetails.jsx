import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import { useFavorites } from "../../context/useFavorites";
import { getGameById, getGameScreenshots } from "../../services/gameApi";
import {
  deleteGameReview,
  getGameReviews,
  submitGameReview,
  updateGameReview,
} from "../../services/reviewsApi";
import "./GameDetails.css";

// API descriptions can include HTML; strip it before rendering inside React text nodes.
function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Game details combines public metadata with authenticated favorite and review actions.
function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addFavorite, isFavorite, removeFavorite } = useFavorites();

  const [game, setGame] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [favoriteError, setFavoriteError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchAllData() {
      try {
        setLoading(true);
        const [gameData, screenshotsData, backendReviews] = await Promise.all([
          getGameById(id),
          getGameScreenshots(id),
          getGameReviews(id),
        ]);

        if (!ignore) {
          setGame(gameData);
          setScreenshots(screenshotsData?.results || []);
          setReviews(backendReviews || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchAllData();

    return () => {
      ignore = true;
    };
  }, [id]);

  const description = useMemo(() => {
    if (!game) return "";
    return game.description_raw || stripHtml(game.description);
  }, [game]);

  // Favorites are protected server-side; the UI redirects guests before attempting a save.
  async function handleFavoriteToggle() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/games/${id}` } } });
      return;
    }

    setFavoriteError("");

    try {
      if (isFavorite(game.id)) {
        await removeFavorite(game.id);
      } else {
        await addFavorite(game);
      }
    } catch (err) {
      setFavoriteError(err.message);
    }
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const newReview = await submitGameReview(id, {
        rating: Number(userRating),
        comment: reviewText,
      });

      setReviews((currentReviews) => [newReview, ...currentReviews]);
      setReviewText("");
      setUserRating(5);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(review) {
    setEditingReviewId(review.id);
    setEditText(review.comment);
    setEditRating(review.rating);
  }

  async function handleReviewUpdate(event) {
    event.preventDefault();

    try {
      const updatedReview = await updateGameReview(editingReviewId, {
        rating: Number(editRating),
        comment: editText,
      });

      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          review.id === updatedReview.id ? updatedReview : review
        )
      );
      setEditingReviewId(null);
      setEditText("");
      setEditRating(5);
    } catch (err) {
      setSubmitError(err.message);
    }
  }

  async function handleReviewDelete(reviewId) {
    const shouldDelete = window.confirm("Delete this review?");

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteGameReview(reviewId);
      setReviews((currentReviews) =>
        currentReviews.filter((review) => review.id !== reviewId)
      );
    } catch (err) {
      setSubmitError(err.message);
    }
  }

  if (loading) return <main className="route-state">Loading game details...</main>;
  if (error) return <main className="route-state">Error: {error}</main>;
  if (!game) return <main className="route-state">Game not found.</main>;

  return (
    <main className="game-details-container">
      <button onClick={() => navigate(-1)} className="back-button" type="button">
        Back
      </button>

      <header className="game-header">
        <div>
          <h1>{game.name}</h1>
          <p>
            {game.released
              ? `Released ${new Date(game.released).toLocaleDateString()}`
              : "Release date unavailable"}
          </p>
        </div>

        <button
          type="button"
          className={`favorite-toggle ${isFavorite(game.id) ? "favorite-toggle--saved" : ""}`}
          onClick={handleFavoriteToggle}
          aria-pressed={isFavorite(game.id)}
        >
          {isFavorite(game.id) ? "Saved" : "Save"}
        </button>
      </header>

      {favoriteError && <p className="error-text">{favoriteError}</p>}

      {game.background_image && (
        <img src={game.background_image} alt={game.name} className="hero-image" />
      )}

      <div className="game-content">
        <section className="game-info-main">
          <h2>About</h2>
          <p className="description">
            {description || "No description is available for this game yet."}
          </p>
        </section>

        <aside className="game-meta">
          <div className="meta-item">
            <h3>Rating</h3>
            <p>{game.rating ? `${game.rating} / 5` : "Not rated"}</p>
          </div>
          <div className="meta-item">
            <h3>Reviews</h3>
            <p>{reviews.length}</p>
          </div>
        </aside>
      </div>

      {screenshots.length > 0 && (
        <section className="game-gallery">
          <h2>Screenshots</h2>
          <div className="gallery-grid">
            {screenshots.map((shot) => (
              <img
                key={shot.id}
                src={shot.image}
                alt={`${game.name} screenshot`}
                className="screenshot-image"
                loading="lazy"
              />
            ))}
          </div>
        </section>
      )}

      <section className="reviews-section">
        <div className="reviews-heading">
          <h2>Player Reviews</h2>
          <span>{reviews.length} total</span>
        </div>

        {isAuthenticated ? (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <h3>Leave a Review</h3>
            {submitError && <p className="error-text">{submitError}</p>}

            <label htmlFor="review-rating">Rating</label>
            <select
              id="review-rating"
              value={userRating}
              onChange={(event) => setUserRating(event.target.value)}
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>

            <label htmlFor="review-comment">Review</label>
            <textarea
              id="review-comment"
              placeholder="What did you think?"
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              required
              rows="4"
            />

            <button type="submit" disabled={isSubmitting || !reviewText.trim()}>
              {isSubmitting ? "Posting" : "Submit Review"}
            </button>
          </form>
        ) : (
          <div className="review-login">
            <p>Log in to save favourites and leave a review.</p>
            <Link to="/login" state={{ from: { pathname: `/games/${id}` } }}>
              Log in
            </Link>
          </div>
        )}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet.</p>
          ) : (
            reviews.map((review) => {
              const canEdit = user?.id === review.user_id;

              return (
                <article key={review.id} className="review-card">
                  <div className="review-header">
                    <strong>{review.username || review.user}</strong>
                    <span>{review.rating} / 5</span>
                  </div>

                  {editingReviewId === review.id ? (
                    <form className="review-edit-form" onSubmit={handleReviewUpdate}>
                      <select
                        value={editRating}
                        onChange={(event) => setEditRating(event.target.value)}
                      >
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating}
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                        rows="3"
                        required
                      />
                      <div className="review-actions">
                        <button type="submit">Save</button>
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => setEditingReviewId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p>{review.comment}</p>
                      <small>
                        {review.date
                          ? new Date(review.date).toLocaleDateString()
                          : "Date unavailable"}
                      </small>

                      {canEdit && (
                        <div className="review-actions">
                          <button type="button" onClick={() => startEditing(review)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="button-danger"
                            onClick={() => handleReviewDelete(review.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

export default GameDetails;
