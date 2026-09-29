import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("lms_user")) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const saveAuth = (auth) => {
    localStorage.setItem("lms_token", auth.token);
    localStorage.setItem(
      "lms_user",
      JSON.stringify({
        username: auth.username,
        role: auth.role
      })
    );
    setUser({ username: auth.username, role: auth.role });
  };

  const logout = () => {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token: localStorage.getItem("lms_token"),
      isAuthenticated: Boolean(localStorage.getItem("lms_token")),
      saveAuth,
      logout
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}