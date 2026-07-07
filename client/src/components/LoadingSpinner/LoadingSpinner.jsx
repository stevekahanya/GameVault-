import "./LoadingSpinner.css";

// Small reusable loading state for API-backed pages and lists.
function LoadingSpinner() {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

export default LoadingSpinner;
