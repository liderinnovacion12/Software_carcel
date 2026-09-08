import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "@/lib/auth/tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export class ApiError extends Error {
  code: string;
  status: number;
  requestId: string;
  details: unknown[];

  constructor(status: number, code: string, message: string, requestId: string, details: unknown[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) return false;
        const body = await response.json();
        setAccessToken(body.access_token);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

async function parseErrorEnvelope(response: Response): Promise<ApiError> {
  try {
    const body = await response.json();
    const error = body.error ?? {};
    return new ApiError(
      response.status,
      error.code ?? "UNKNOWN_ERROR",
      error.message ?? "Ocurrio un error inesperado.",
      error.request_id ?? "-",
      error.details ?? []
    );
  } catch {
    return new ApiError(response.status, "UNKNOWN_ERROR", "Ocurrio un error inesperado.", "-", []);
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const doFetch = async (): Promise<Response> => {
    const accessToken = getAccessToken();
    return fetch(url.toString(), {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  };

  let response = await doFetch();

  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      response = await doFetch();
    } else {
      clearTokens();
    }
  }

  if (!response.ok) {
    throw await parseErrorEnvelope(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
