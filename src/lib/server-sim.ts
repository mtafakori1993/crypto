import { z } from "zod";
import { SIM } from "@/lib/config";
import type { Account } from "@/lib/engine/types";

/** Server-side guard: the client supplies a simulation clock, but it must be close to the server's clock. */
export function resolveSimTime(simTime: unknown): number | null {
  if (SIM.fixedTime) return SIM.fixedTime;
  const t = Number(simTime);
  if (!Number.isFinite(t)) return null;
  return Math.abs(t - Date.now()) <= 5 * 60_000 ? t : null;
}

const balance = z.object({ free: z.number().finite().nonnegative(), locked: z.number().finite().nonnegative() });
export const accountSchema = z.looseObject({
  version: z.literal(1),
  balances: z.record(z.string(), balance),
  orders: z.array(z.any()).max(2000),
  trades: z.array(z.any()).max(4000),
  transfers: z.array(z.any()).max(2000),
  ledger: z.array(z.any()).max(20000),
  notifications: z.array(z.any()).max(100),
  watchlist: z.array(z.string()).max(100),
  profile: z.looseObject({ uid: z.string() }),
  prefs: z.looseObject({}),
  seq: z.looseObject({}),
});
export const asAccount = (a: unknown): Account | null => {
  const r = accountSchema.safeParse(a);
  return r.success ? (r.data as unknown as Account) : null;
};
export const NO_STORE = { "Cache-Control": "no-store" };
