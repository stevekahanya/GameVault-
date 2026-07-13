import { useState } from "react";
import "./ScreenShotGallery.css";

function ScreenshotGallery({ screenshots = [], gameName = "Game" }) {
  // Store the selected id instead of an index so refreshed screenshot lists stay safe.
  const [selectedScreenshotId, setSelectedScreenshotId] = useState(null);

  if (screenshots.length === 0) {
    return (
      <div className="gallery-empty">
        <p>No screenshots available.</p>
      </div>
    );
  }

  const selectedIndex = Math.max(
    screenshots.findIndex((screenshot) => screenshot.id === selectedScreenshotId),
    0
  );
  const selectedScreenshot = screenshots[selectedIndex] || screenshots[0];
  const activeIndex = screenshots[selectedIndex] ? selectedIndex : 0;
  const selectedAlt = `${gameName} screenshot ${activeIndex + 1}`;

  function showPrevious() {
    const previousIndex = activeIndex === 0
      ? screenshots.length - 1
      : activeIndex - 1;

    setSelectedScreenshotId(screenshots[previousIndex].id);
  }

  function showNext() {
    const nextIndex = activeIndex === screenshots.length - 1
      ? 0
      : activeIndex + 1;

    setSelectedScreenshotId(screenshots[nextIndex].id);
  }

  return (
    <section className="screenshot-gallery">
      <div className="gallery-heading">
        <div>
          <h2>Screenshot Gallery</h2>
          <p>{screenshots.length} images from this game</p>
        </div>

        <span className="gallery-count">
          {activeIndex + 1} / {screenshots.length}
        </span>
      </div>

      <div className="gallery-viewer">
        <button
          type="button"
          className="gallery-nav gallery-nav-previous"
          onClick={showPrevious}
          aria-label="Show previous screenshot"
          title="Previous screenshot"
        >
          &#8249;
        </button>

        <img
          src={selectedScreenshot.image}
          alt={selectedAlt}
          className="gallery-featured-image"
        />

        <button
          type="button"
          className="gallery-nav gallery-nav-next"
          onClick={showNext}
          aria-label="Show next screenshot"
          title="Next screenshot"
        >
          &#8250;
        </button>
      </div>

      <div className="screenshot-thumbnails" aria-label="Choose screenshot">
        {screenshots.map((screenshot, index) => (
          <button
            type="button"
            key={screenshot.id}
            className={
              screenshot.id === selectedScreenshot.id
                ? "thumbnail-button is-active"
                : "thumbnail-button"
            }
            onClick={() => setSelectedScreenshotId(screenshot.id)}
            aria-label={`Show ${gameName} screenshot ${index + 1}`}
          >
            <img
              src={screenshot.image}
              alt=""
              className="thumbnail-image"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </section>
  );
}

export default ScreenshotGallery;
