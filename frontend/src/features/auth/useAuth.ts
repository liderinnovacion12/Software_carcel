import { useCallback, useState } from "react";
import { clearTokens, getAccessToken, setTokens } from "@/lib/auth/tokenStorage";
import { login as loginRequest } from "@/features/auth/authApi";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(getAccessToken()));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const tokens = await loginRequest(username, password);
      setTokens(tokens.access_token, tokens.refresh_token);
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
    clearTokens();
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, login, logout, error, isSubmitting };
}
