import { useState, useEffect } from "react";
import api from "../services/api";
import { AuthContext, User } from "./AuthContext";

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000; // 1 second between retries
const INIT_TIMEOUT_MS = 10000; // 10 seconds max for initialization

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Helper function to delay execution
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Try to auto-login on mount
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const initAuth = async () => {
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (isMounted && isLoading) {
          console.error("Auth initialization timed out");
          setIsLoading(false);
        }
      }, INIT_TIMEOUT_MS);

      try {
        // Check if we have a refresh token by calling /auth/me
        const response = await api.get("/auth/me");
        const { accessToken: token, user: userData } = response.data;

        if (!isMounted) return;

        localStorage.setItem("accessToken", token);
        setAccessToken(token);
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        if (!isMounted) return;

        // No valid session, automatically create a new user
        console.log("No valid session found, creating new user...");
        localStorage.removeItem("accessToken");

        // Retry logic for user creation
        let attempt = 0;
        let success = false;

        while (attempt < MAX_RETRY_ATTEMPTS && !success && isMounted) {
          try {
            attempt++;
            console.log(
              `Attempting to create user (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})...`
            );

            await login();
            success = true;
            console.log("User created successfully");
          } catch (loginError) {
            console.error(
              `Failed to create user (attempt ${attempt}/${MAX_RETRY_ATTEMPTS}):`,
              loginError
            );

            if (attempt < MAX_RETRY_ATTEMPTS) {
              console.log(`Retrying in ${RETRY_DELAY_MS}ms...`);
              await delay(RETRY_DELAY_MS);
            } else {
              console.error(
                "Max retry attempts reached. User will need to refresh the page."
              );
            }
          }
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
