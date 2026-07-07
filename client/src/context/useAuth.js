import { useContext } from "react";

import { AuthContext } from "./authContextValue";

// Central hook for reading login state and auth actions across components.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}
