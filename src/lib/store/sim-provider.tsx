"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { SIM } from "@/lib/config";
import { useAccount } from "./account-store";

const ClockContext = createContext<{ now: number; live: boolean }>({ now: 0, live: false });
/** Current simulation time (ms). Starts at the server render time (no hydration mismatch), then follows the real clock. */
export const useNow = () => useContext(ClockContext).now;
export const useClockLive = () => useContext(ClockContext).live;

export function SimProvider({ serverNow, children }: { serverNow: number; children: ReactNode }) {
  const [state, setState] = useState({ now: serverNow, live: false });
  const hydrate = useAccount((s) => s.hydrate);
  const tick = useAccount((s) => s.tick);
  const hydrated = useAccount((s) => s.hydrated);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const clock = () => SIM.fixedTime ?? Date.now();
    hydrate(clock());
    const step = () => {
      const n = clock();
      setState({ now: n, live: true });
      useAccount.getState().tick(n);
    };
    const start = () => {
      if (timer.current) return;
      step();
      timer.current = setInterval(step, SIM.priceTickMs);
    };
    const stop = () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
    const onVis = () => (document.hidden ? stop() : start());
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [hydrate, tick]);

  useEffect(() => {
    if (hydrated) document.documentElement.dataset.theme = useAccount.getState().account.prefs.theme;
  }, [hydrated]);

  return <ClockContext.Provider value={state}>{children}</ClockContext.Provider>;
}
