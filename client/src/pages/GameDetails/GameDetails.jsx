import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ScreenshotGallery from "../../components/ScreenshotGallery/ScreenShotGallery";
import { getStoredUser } from "../../services/authApi";
import { getGameDetails } from "../../services/gameApi";
import {
  deleteGameReview,
  getGameReviews,
  submitGameReview,
} from "../../services/reviewsApi";
import "./GameDetails.css";

const ratingOptions = [1, 2, 3, 4, 5];

function formatDate(dateValue) {
  if (!dateValue) return "TBA";

  return new Date(dateValue).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getNames(items = []) {
  return items.map((item) => item.name).filter(Boolean);
}

function getPlatformNames(platforms = []) {
  return platforms
    .map((item) => item.platform?.name || item.name)
    .filter(Boolean);
}

function renderStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Read the logged-in user once so the review form mirrors the current session.
  const [currentUser] = useState(() => getStoredUser());

  const [game, setGame] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitMessage, setSubmitMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [gameData, backendReviews] = await Promise.all([
          getGameDetails(id),
          getGameReviews(id),
        ]);

        if (!isMounted) return;

        const reviewList = backendReviews || [];
        // If the user already reviewed this game, prefill the form for editing.
        const existingReview = currentUser
          ? reviewList.find((review) => review.user_id === currentUser.id)
          : null;

        setGame(gameData.game);
        setScreenshots(gameData.screenshots || []);
        setReviews(reviewList);
        setReviewText(existingReview?.comment || "");
        setUserRating(existingReview?.rating || 5);
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
    };
  }, [id, currentUser]);

  // This controls the edit/delete state for the logged-in player's own review.
  const userReview = currentUser
    ? reviews.find((review) => review.user_id === currentUser.id)
    : null;

  const reviewCount = reviews.length;
  const averageReviewRating = reviewCount
    ? reviews.reduce((total, review) => total + Number(review.rating), 0) / reviewCount
    : 0;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setSubmitError("Please log in to leave a review.");
      return;
    }

    if (!reviewText.trim()) {
      setSubmitError("Share a few thoughts before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitMessage(null);

    try {
      const wasUpdating = Boolean(userReview);
      const newReview = await submitGameReview(id, {
        rating: Number(userRating),
        comment: reviewText.trim(),
      });

      // Replace this user's previous review locally while keeping newest first.
      setReviews((prev) => [
        newReview,
        ...prev.filter((review) => (
          review.id !== newReview.id && review.user_id !== newReview.user_id
        )),
      ]);
      setReviewText(newReview.comment);
      setUserRating(newReview.rating);
      setSubmitMessage(wasUpdating ? "Review updated." : "Review posted.");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    setDeletingReviewId(userReview.id);
    setSubmitError(null);
    setSubmitMessage(null);

    try {
      await deleteGameReview(id, userReview.id);
      setReviews((prev) => prev.filter((review) => review.id !== userReview.id));
      setReviewText("");
      setUserRating(5);
      setSubmitMessage("Review deleted.");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) {
    return (
      <main className="game-details-container">
        <p className="details-state">Loading game details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="game-details-container">
        <button onClick={() => navigate(-1)} className="back-button">
          &larr; Back
        </button>
        <p className="details-state error-state">Error: {error}</p>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="game-details-container">
        <p className="details-state">Game not found.</p>
      </main>
    );
  }

  const genres = getNames(game.genres).slice(0, 4);
  const developers = getNames(game.developers).slice(0, 2);
  const platforms = getPlatformNames(game.platforms).slice(0, 6);
  const description = game.description_raw || "No description available yet.";

  return (
    <main className="game-details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back
      </button>

      <header className="game-hero">
        {game.background_image && (
          <img
            src={game.background_image}
            alt={game.name}
            className="hero-image"
          />
        )}

        <div className="game-hero-copy">
          <p className="eyebrow">Game Details</p>
          <h1>{game.name}</h1>
          <div className="hero-rating-row">
            <span>{renderStars(Math.round(game.rating || 0))}</span>
            <strong>{game.rating || "New"} / 5</strong>
          </div>
        </div>
      </header>

      <div className="game-content">
        <section className="game-info-main">
          <h2>About</h2>
          <p className="description">{description}</p>

          {genres.length > 0 && (
            <div className="tag-list" aria-label="Genres">
              {genres.map((genre) => (
                <span key={genre} className="tag">{genre}</span>
              ))}
            </div>
          )}
        </section>

        <aside className="game-meta">
          <div className="meta-item">
            <h3>Release Date</h3>
            <p>{formatDate(game.released)}</p>
          </div>
          <div className="meta-item">
            <h3>RAWG Rating</h3>
            <p>{game.rating || "Unrated"} / 5</p>
          </div>
          <div className="meta-item">
            <h3>Metacritic</h3>
            <p>{game.metacritic || "N/A"}</p>
          </div>
          <div className="meta-item">
            <h3>Developers</h3>
            <p>{developers.length ? developers.join(", ") : "Unknown"}</p>
          </div>
        </aside>
      </div>

      {platforms.length > 0 && (
        <section className="platform-section">
          <h2>Playable On</h2>
          <div className="platform-list">
            {platforms.map((platform) => (
              <span key={platform}>{platform}</span>
            ))}
          </div>
        </section>
      )}

      <ScreenshotGallery screenshots={screenshots} gameName={game.name} />

      <section className="reviews-section">
        <div className="section-heading reviews-heading">
          <div>
            <h2>Player Reviews</h2>
            <p>
              {reviewCount
                ? `${reviewCount} review${reviewCount === 1 ? "" : "s"} from QuestLog players`
                : "No player reviews yet"}
            </p>
          </div>

          <div className="review-average">
            <span>{averageReviewRating ? averageReviewRating.toFixed(1) : "N/A"}</span>
            <small>{renderStars(Math.round(averageReviewRating))}</small>
          </div>
        </div>

        {currentUser ? (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <div className="review-form-heading">
              <div>
                <h3>{userReview ? "Update your review" : "Leave a review"}</h3>
                <p>Signed in as {currentUser.username}</p>
              </div>
            </div>

            {submitError && <p className="error-text">{submitError}</p>}
            {submitMessage && <p className="success-text">{submitMessage}</p>}

            <div className="form-group">
              <label>Your rating</label>
              <div className="rating-picker" role="radiogroup" aria-label="Your rating">
                {ratingOptions.map((rating) => (
                  <button
                    type="button"
                    key={rating}
                    className={
                      Number(userRating) >= rating
                        ? "star-choice is-selected"
                        : "star-choice"
                    }
                    onClick={() => setUserRating(rating)}
                    role="radio"
                    aria-checked={Number(userRating) === rating}
                    aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="review-comment">Your review</label>
              <textarea
                id="review-comment"
                placeholder="What should other players know?"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                required
                rows="4"
              />
            </div>

            <div className="review-actions">
              <button type="submit" disabled={isSubmitting || !reviewText.trim()}>
                {isSubmitting
                  ? "Saving..."
                  : userReview ? "Update Review" : "Post Review"}
              </button>

              {userReview && (
                <button
                  type="button"
                  className="delete-review-button"
                  onClick={handleDeleteReview}
                  disabled={deletingReviewId === userReview.id}
                >
                  {deletingReviewId === userReview.id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="review-login-callout">
            <h3>Sign in to rate this game</h3>
            <p>Your review will be saved to your QuestLog account.</p>
            <div>
              <Link to="/login">Log In</Link>
              <Link to="/register">Create Account</Link>
            </div>
          </div>
        )}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to rate it.</p>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="review-card">
                <div className="review-header">
                  <strong>{review.user}</strong>
                  <span>{renderStars(review.rating)}</span>
                </div>
                <p>{review.comment}</p>
                <time dateTime={review.date}>{formatDate(review.date)}</time>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default GameDetails;
