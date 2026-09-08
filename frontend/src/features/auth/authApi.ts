import { apiRequest } from "@/lib/apiClient";

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export function login(username: string, password: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export interface CurrentUserResponse {
  id: string;
  username: string;
  full_name: string;
  permissions: string[];
}

export function fetchCurrentUser(): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>("/users/me");
}
