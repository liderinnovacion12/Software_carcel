import type { ButtonHTMLAttributes, CSSProperties } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, CSSProperties> = {
  primary: {
    background: "var(--color-accent)",
    color: "#04181b",
    border: "1px solid var(--color-accent)",
  },
  secondary: {
    background: "transparent",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-secondary)",
    border: "1px solid transparent",
  },
};

export function Button({ variant = "primary", style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 16px",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--font-size-md)",
        fontWeight: 500,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.5 : 1,
        transition: `background var(--motion-fast) var(--motion-easing), border-color var(--motion-fast) var(--motion-easing)`,
        ...variantStyles[variant],
        ...style,
      }}
    />
  );
}
