// UserProvider.jsx — Global auth state with login/logout and token management

import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";

export function UserProvider({ children }) {
  const initialUser = {
    isLoggedIn: false,
    name: "",
    email: "",
    role: "",
    token: "",
  };

  const API_URL = import.meta.env.VITE_API_URL;

  // Initialize user state from localStorage if available
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isLoggedIn) return parsed;
      }
    } catch (e) {}
    return initialUser;
  });

  // Login — POST to /api/user/login, store JWT token in localStorage
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) return false;

      const data = await response.json();

      const newUser = {
        isLoggedIn: true,
        name: data.user.username,
        email: data.user.email,
        role: data.user.role,
        token: data.token,
      };

      setUser(newUser);
      localStorage.setItem("session", JSON.stringify(newUser));
      return true;
    } catch (error) {
      return false;
    }
  };

  // Logout — POST to /api/user/logout, clear localStorage
  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
    } catch (e) {}
    const newUser = {
      isLoggedIn: false,
      name: "",
      email: "",
      role: "",
      token: "",
    };
    setUser(newUser);
    localStorage.removeItem("session");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
