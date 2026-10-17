"use client";
import { create } from "zustand";
import { SIM } from "@/lib/config";
import { createInitialAccount } from "@/lib/engine/account";
import { matchOpenOrders } from "@/lib/engine/orders";
import { settleTransfers } from "@/lib/engine/transfers";
import type { Account, Preferences } from "@/lib/engine/types";

/**
 * LOCAL SIMULATION STATE. Persisted to this browser's localStorage only. It is not a ledger, holds no credentials
 * and no real financial or identity data.
 */
interface State {
  account: Account;
  hydrated: boolean;
  hydrate: (now: number) => void;
  commit: (a: Account) => void;
  tick: (now: number) => void;
  toggleWatch: (pair: string) => void;
  setPrefs: (p: Partial<Preferences>) => void;
  setProfile: (p: Partial<Account["profile"]>) => void;
  setSession: (on: boolean) => void;
  markNotificationsRead: () => void;
  resetSimulation: (now: number) => void;
}

const EMPTY = createInitialAccount(0);

function persist(a: Account) {
  try {
    localStorage.setItem(SIM.storageKey, JSON.stringify(a));
  } catch {
    /* private mode / quota: the simulation keeps working in memory */
  }
}
function applyTheme(theme: string) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("shomaaa-theme", theme);
  } catch {}
}

export const useAccount = create<State>((set, get) => ({
  account: EMPTY,
  hydrated: false,
  hydrate: (now) => {
    let acc: Account | null = null;
    try {
      const raw = localStorage.getItem(SIM.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Account;
        if (parsed?.version === 1 && parsed.balances) acc = parsed;
      }
    } catch {}
    if (!acc) {
      acc = createInitialAccount(now);
      try {
        const th = localStorage.getItem("shomaaa-theme");
        if (th === "light" || th === "dark") acc.prefs.theme = th;
      } catch {}
    }
    set({ account: acc, hydrated: true });
    persist(acc);
  },
  commit: (a) => {
    set({ account: a });
    persist(a);
  },
  tick: (now) => {
    let acc = get().account;
    const m = matchOpenOrders(acc, now);
    acc = m.account;
    const s = settleTransfers(acc, now);
    acc = s.account;
    if (acc !== get().account) get().commit(acc);
  },
  toggleWatch: (pair) => {
    const a = structuredClone(get().account);
    a.watchlist = a.watchlist.includes(pair) ? a.watchlist.filter((p) => p !== pair) : [...a.watchlist, pair];
    get().commit(a);
  },
  setPrefs: (p) => {
    const a = structuredClone(get().account);
    a.prefs = { ...a.prefs, ...p };
    if (p.theme) applyTheme(p.theme);
    get().commit(a);
  },
  setProfile: (p) => {
    const a = structuredClone(get().account);
    a.profile = { ...a.profile, ...p };
    get().commit(a);
  },
  setSession: (on) => {
    const a = structuredClone(get().account);
    a.session = on;
    get().commit(a);
  },
  markNotificationsRead: () => {
    const a = structuredClone(get().account);
    a.notifications.forEach((n) => (n.read = true));
    get().commit(a);
  },
  resetSimulation: (now) => {
    const fresh = createInitialAccount(now);
    fresh.prefs.theme = get().account.prefs.theme;
    get().commit(fresh);
  },
}));
