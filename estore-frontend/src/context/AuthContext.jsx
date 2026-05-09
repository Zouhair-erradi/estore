import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('estore_user');
    return stored ? JSON.parse(stored) : null;
  });

  const loginUser = (userData) => {
    localStorage.setItem('estore_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('estore_user');
    setUser(null);
  };

  const updateUser = (userData) => {
    const merged = { ...user, ...userData };
    localStorage.setItem('estore_user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
