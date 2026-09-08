import { useEffect, useRef, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { NAV_MODULES, useRadialNavState } from "./useRadialNavState";
import { RadialNavItem } from "./RadialNavItem";
import "./radialNav.css";

const ARC_START_DEG = -85;
const ARC_END_DEG = 85;
const RADIUS = 130;

function angleForIndex(index: number, total: number): number {
  const span = ARC_END_DEG - ARC_START_DEG;
  const deg = total === 1 ? ARC_START_DEG : ARC_START_DEG + (span * index) / (total - 1);
  return (deg * Math.PI) / 180;
}

export function RadialNav() {
  const navigate = useNavigate();
  const { expanded, open, scheduleClose, close, activePath, focusedIndex, setFocusedIndex, moveFocus } =
    useRadialNavState();
  const handleRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (expanded) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [expanded, focusedIndex]);

  function handleSelect(path: string) {
    navigate(path);
    close();
    handleRef.current?.focus();
  }

  function handleHandleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      open();
      setFocusedIndex(0);
    }
  }

  function handleItemKeyDown(event: KeyboardEvent<HTMLDivElement>, index: number) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(-1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
      handleRef.current?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(NAV_MODULES[index].path);
    }
  }

  return (
    <nav
      className={`radial-nav ${expanded ? "radial-nav--expanded" : ""}`}
      aria-label="Navegacion principal de BIALCO"
      onPointerEnter={open}
      onPointerLeave={scheduleClose}
    >
      <button
        ref={handleRef}
        type="button"
        className="radial-nav__handle"
        aria-haspopup="true"
        aria-expanded={expanded}
        aria-label="Abrir menu de navegacion"
        onClick={open}
        onKeyDown={handleHandleKeyDown}
      >
        <span aria-hidden="true">{expanded ? "›" : "‹"}</span>
      </button>

      <div className="radial-nav__items" role="menu">
        {NAV_MODULES.map((module, index) => (
          <div
            key={module.path}
            role="menuitem"
            onKeyDown={(event) => handleItemKeyDown(event, index)}
          >
            <RadialNavItem
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              module={module}
              angleRad={angleForIndex(index, NAV_MODULES.length)}
              radius={RADIUS}
              isActive={activePath === module.path}
              isFocused={expanded && focusedIndex === index}
              tabIndex={expanded ? 0 : -1}
              onSelect={() => handleSelect(module.path)}
              onFocus={() => setFocusedIndex(index)}
            />
          </div>
        ))}
      </div>
    </nav>
  );
}
