const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return dateFormatter.format(date);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CO").format(value);
}
