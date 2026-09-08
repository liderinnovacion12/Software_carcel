import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { RadialNav } from "./RadialNav/RadialNav";
import { SyntheticDataBanner } from "@/components/common/SyntheticDataBanner";
import { CommandPalette } from "@/components/search/CommandPalette";

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SyntheticDataBanner />
      <TopBar onOpenSearch={() => setSearchOpen(true)} />
      <main style={{ flex: 1, padding: "var(--space-lg)", paddingRight: "72px" }}>
        <Outlet />
      </main>
      <RadialNav />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
