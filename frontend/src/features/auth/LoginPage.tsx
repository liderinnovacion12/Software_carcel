import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input } from "@/design-system";
import { useAuthContext } from "@/app/AuthContext";

export default function LoginPage() {
  const { login, error, isSubmitting } = useAuthContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const success = await login(username, password);
    if (success) navigate("/", { replace: true });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 30% 20%, var(--color-bg-surface) 0%, var(--color-bg) 60%)",
        padding: "var(--space-lg)",
      }}
    >
      <Card style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <p
            style={{
              margin: 0,
              color: "var(--color-accent-strong)",
              fontWeight: 700,
              fontSize: "var(--font-size-xl)",
              letterSpacing: "0.04em",
            }}
          >
            BIALCO
          </p>
          <p style={{ margin: "4px 0 0", color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
            Bienestar Integral, Acompanamiento, Logistica y Coordinacion
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <div>
            <label htmlFor="username" style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
              Usuario
            </label>
            <Input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
              Contrasena
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p role="alert" style={{ color: "var(--color-critical)", fontSize: "var(--font-size-sm)", margin: 0 }}>
              {error}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
