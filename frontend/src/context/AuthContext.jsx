import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken } from "../api/client";
import { me as meApi, logout as logoutApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Na refresh: ako postoji token, pozovi /me i vrati usera
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    meApi()
      .then((u) => setUser(u))
      .catch(() => {
        logoutApi(); // obriši loš token
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
  await logoutApi();
  setUser(null);
};


  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
