import { useEffect, useMemo, useState } from "react";

import {
  fetchCurrentUser,
  getAuthToken,
  getStoredUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/authApi";
import { AuthContext } from "./authContextValue";

// Owns JWT persistence, current-user verification, and login/register/logout actions.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getAuthToken);
  const [isCheckingAuth, setIsCheckingAuth] = useState(Boolean(getAuthToken()));

  useEffect(() => {
    if (!token) {
      return;
    }

    let ignore = false;

    // Revalidate stored tokens on reload so stale localStorage data cannot fake a session.
    async function verifyUser() {
      try {
        const currentUser = await fetchCurrentUser();
        if (!ignore) {
          setUser(currentUser);
        }
      } catch {
        if (!ignore) {
          logoutUser();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!ignore) {
          setIsCheckingAuth(false);
        }
      }
    }

    verifyUser();

    return () => {
      ignore = true;
    };
  }, [token]);

  async function login(credentials) {
    const data = await loginUser(credentials);
    setUser(data.user);
    setToken(data.access_token);
    setIsCheckingAuth(false);
    return data.user;
  }

  async function register(credentials) {
    const data = await registerUser(credentials);
    setUser(data.user);
    setToken(data.access_token);
    setIsCheckingAuth(false);
    return data.user;
  }

  function logout() {
    logoutUser();
    setUser(null);
    setToken(null);
    setIsCheckingAuth(false);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isCheckingAuth,
      login,
      logout,
      register,
    }),
    [user, token, isCheckingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
