import { createContext, useCallback, useEffect, useState } from 'react';
import * as authApi from '../api/authApi';

// eslint-disable-next-line react-refresh/only-export-components -- context object must live alongside its Provider
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(res.data.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
