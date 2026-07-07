import { createContext } from "react";

// Context object lives separately so Fast Refresh can reload provider and hook files safely.
export const AuthContext = createContext(null);
