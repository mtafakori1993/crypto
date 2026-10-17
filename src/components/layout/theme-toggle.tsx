"use client";
import { Moon, Sun } from "lucide-react";
import { Tip } from "@/components/ui/misc";
import { useAccount } from "@/lib/store/account-store";

export function ThemeToggle() {
  const theme = useAccount((s) => s.account.prefs.theme);
  const setPrefs = useAccount((s) => s.setPrefs);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <Tip label={next === "light" ? "حالت روشن" : "حالت تیره"}>
      <button onClick={() => setPrefs({ theme: next })} aria-label={next === "light" ? "تغییر به حالت روشن" : "تغییر به حالت تیره"} className="flex size-10 items-center justify-center rounded-md text-muted hover:bg-raised hover:text-text">
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </Tip>
  );
}
