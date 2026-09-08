import { forwardRef } from "react";
import type { NavModule } from "./useRadialNavState";

interface RadialNavItemProps {
  module: NavModule;
  angleRad: number;
  radius: number;
  isActive: boolean;
  isFocused: boolean;
  tabIndex: number;
  onSelect: () => void;
  onFocus: () => void;
}

export const RadialNavItem = forwardRef<HTMLButtonElement, RadialNavItemProps>(
  function RadialNavItem(
    { module, angleRad, radius, isActive, isFocused, tabIndex, onSelect, onFocus },
    ref
  ) {
    // Anchor is pinned to the right viewport edge, so the arc must bulge
    // left into the page - negate the x component of the unit circle.
    const tx = -Math.cos(angleRad) * radius;
    const ty = Math.sin(angleRad) * radius;

    return (
      <div
        className="radial-nav__item"
        style={{ ["--tx" as string]: `${tx}px`, ["--ty" as string]: `${ty}px` }}
      >
        <button
          ref={ref}
          type="button"
          className={[
            "radial-nav__button",
            isActive ? "radial-nav__button--active" : "",
            isFocused ? "radial-nav__button--focused" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={onSelect}
          onFocus={onFocus}
          tabIndex={tabIndex}
          aria-current={isActive ? "page" : undefined}
          aria-label={module.label}
        >
          <span aria-hidden="true">{module.icon}</span>
        </button>
        <span className="radial-nav__tooltip" role="presentation">
          {module.label}
          {!module.implemented && " (proximamente)"}
        </span>
      </div>
    );
  }
);
