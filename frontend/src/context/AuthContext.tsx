import { createContext, useState, useEffect } from "react";
import api from "../services/api";

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to auto-login on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a refresh token by calling /auth/me
        const response = await api.get("/auth/me");
        const { accessToken: token, user: userData } = response.data;

        localStorage.setItem("accessToken", token);
        setAccessToken(token);
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        // No valid session, user needs to login
        console.log("No valid session found");
        localStorage.removeItem("accessToken");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Listen for auth logout events (from API interceptor)
  useEffect(() => {
    const handleLogout = () => {
      setIsAuthenticated(false);
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("accessToken");
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const login = async () => {
    try {
      // Get existing userId from localStorage, or let backend create new one
      const existingUserId = localStorage.getItem("userId");

      const response = await api.post("/auth/login", {
        userId: existingUserId,
      });

      const { accessToken: token, user: userData } = response.data;

      // Store tokens and user info
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userId", userData.id);

      setAccessToken(token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("accessToken");
      // Keep userId so user can re-login as same user
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        accessToken,
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
