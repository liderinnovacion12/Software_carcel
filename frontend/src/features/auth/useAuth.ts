import { useCallback, useState } from "react";
import { hasActiveSession, login as loginRequest, logout as logoutRequest } from "@/features/auth/authApi";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => hasActiveSession());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await loginRequest(username, password);
      setIsAuthenticated(true);
      return true;
    } catch {
      setError("Usuario o contrasena incorrectos.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, login, logout, error, isSubmitting };
}
