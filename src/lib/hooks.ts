"use client";
import { useMemo, useState } from "react";
import { NOISE_MS, allTickers, sparkline, ticker } from "@/lib/market/model";
import { useNow } from "@/lib/store/sim-provider";

const bucket = (now: number) => Math.floor(now / NOISE_MS);
export function useTicker(pair: string) {
  const now = useNow();
  const b = bucket(now);
  return useMemo(() => ticker(pair, b * NOISE_MS), [pair, b]);
}
export function useTickers() {
  const now = useNow();
  const b = bucket(now);
  return useMemo(() => allTickers(b * NOISE_MS), [b]);
}
export function useSparkline(pair: string) {
  const now = useNow();
  const b = Math.floor(now / 60_000);
  return useMemo(() => sparkline(pair, b * 60_000), [pair, b]);
}

/** "up" when the last price did not fall since the previous update (state derived during render, no refs). */
export function usePriceDirection(price: number): "up" | "down" {
  const [s, setS] = useState<{ price: number; dir: "up" | "down" }>({ price, dir: "up" });
  if (price !== s.price) setS({ price, dir: price >= s.price ? "up" : "down" });
  return s.dir;
}
