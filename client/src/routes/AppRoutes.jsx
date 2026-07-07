import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import BrowseGames from "../pages/BrowseGames/BrowseGames";
import GameDetails from "../pages/GameDetails/GameDetails";
import About from "../pages/About/About";
import Favorites from "../pages/Favorites/Favorites";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import { useAuth } from "../context/useAuth";

// Prevents unauthenticated users from opening user-owned resource pages directly.
function ProtectedRoute({ children }) {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const location = useLocation();

  if (isCheckingAuth) {
    return <main className="route-state">Checking your session...</main>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

// Keeps logged-in users away from auth forms and returns them to their saved games.
function GuestRoute({ children }) {
  const { isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return <main className="route-state">Checking your session...</main>;
  }

  if (isAuthenticated) {
    return <Navigate to="/favorites" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<BrowseGames />} />
      <Route path="/games" element={<BrowseGames />} />
      <Route path="/games/:id" element={<GameDetails />} />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />
      <Route path="/about" element={<About />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
