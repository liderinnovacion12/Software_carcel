import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/design-system";
import { useGlobalSearch } from "./useGlobalSearch";
import { addRecentSearch, getRecentSearches } from "./RecentSearches";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [rawQuery, setRawQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), 250);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  useEffect(() => {
    if (open) {
      setRawQuery("");
      setDebouncedQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const { data, isFetching } = useGlobalSearch(debouncedQuery);
  const recentSearches = getRecentSearches();

  if (!open) return null;

  function goToPerson(personId: string, fullName: string, internalCode: string) {
    addRecentSearch({ personId, fullName, internalCode });
    navigate(`/personas/${personId}`);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Busqueda global de BIALCO"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(4, 8, 14, 0.65)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        zIndex: 100,
      }}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-md)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Input
          ref={inputRef}
          placeholder="Buscar por nombre, identificacion, codigo interno o radicado..."
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value)}
          aria-label="Buscar personas"
        />

        <div style={{ marginTop: "var(--space-md)", maxHeight: "360px", overflowY: "auto" }}>
          {debouncedQuery.trim().length === 0 && recentSearches.length > 0 && (
            <div>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", margin: "0 0 8px" }}>
                Busquedas recientes
              </p>
              {recentSearches.map((entry) => (
                <button
                  key={entry.personId}
                  type="button"
                  onClick={() => goToPerson(entry.personId, entry.fullName, entry.internalCode)}
                  style={resultButtonStyle}
                >
                  <span>{entry.fullName}</span>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                    {entry.internalCode}
                  </span>
                </button>
              ))}
            </div>
          )}

          {debouncedQuery.trim().length === 0 && recentSearches.length === 0 && (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              Escriba un nombre, numero de identificacion, codigo interno o radicado.
            </p>
          )}

          {debouncedQuery.trim().length > 0 && isFetching && !data && (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Buscando...</p>
          )}

          {debouncedQuery.trim().length > 0 && data && data.results.length === 0 && (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              No se encontraron resultados para "{debouncedQuery}".
            </p>
          )}

          {data?.results.map((result) => (
            <button
              key={result.person_id}
              type="button"
              onClick={() => goToPerson(result.person_id, result.full_name, result.internal_code)}
              style={resultButtonStyle}
            >
              <span>
                <strong>{result.full_name}</strong>
                <br />
                <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                  {result.match_reason}
                  {result.establishment_name ? ` · ${result.establishment_name}` : ""}
                </span>
              </span>
              <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                {result.internal_code}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const resultButtonStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "var(--space-sm)",
  padding: "10px 12px",
  borderRadius: "var(--radius-md)",
  border: "none",
  background: "transparent",
  color: "var(--color-text-primary)",
  textAlign: "left",
  cursor: "pointer",
};
