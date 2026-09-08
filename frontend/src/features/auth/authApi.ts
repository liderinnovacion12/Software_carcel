// This is a fully static public demo (no backend) - authentication here is a
// local, client-side check against the single demo persona described in the
// product brief ("Administrador BIALCO"). It does not protect any real data
// and must never be presented as a security mechanism.
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "Bialco2026*";
const SESSION_KEY = "bialco.demo_session";

export interface DemoUser {
  username: string;
  full_name: string;
}

const DEMO_USER: DemoUser = { username: DEMO_USERNAME, full_name: "Administrador BIALCO" };

export function login(username: string, password: string): Promise<DemoUser> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, "1");
        resolve(DEMO_USER);
      } else {
        reject(new Error("Usuario o contrasena incorrectos."));
      }
    }, 250); // small delay so the login screen feels real, not instantaneous
  });
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function hasActiveSession(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function fetchCurrentUser(): Promise<DemoUser> {
  return hasActiveSession() ? Promise.resolve(DEMO_USER) : Promise.reject(new Error("No autenticado."));
}
