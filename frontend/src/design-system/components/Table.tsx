import type { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({ columns, rows, rowKey, emptyMessage, onRowClick }: TableProps<T>) {
  if (rows.length === 0) {
    return (
      <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
        {emptyMessage ?? "No hay datos para mostrar."}
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: "var(--font-size-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--color-text-muted)",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={onRowClick ? { cursor: "pointer" } : undefined}
              onMouseEnter={
                onRowClick
                  ? (e) => (e.currentTarget.style.background = "var(--color-bg-surface-raised)")
                  : undefined
              }
              onMouseLeave={onRowClick ? (e) => (e.currentTarget.style.background = "transparent") : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: "10px 12px",
                    fontSize: "var(--font-size-sm)",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
