import { NextResponse } from "next/server";
import { createInitialAccount, summarize } from "@/lib/engine/account";
import { simNow } from "@/lib/market/model";
import { NO_STORE } from "@/lib/server-sim";

export const dynamic = "force-dynamic";

export function GET() {
  const t = simNow();
  const acc = createInitialAccount(t);
  const s = summarize(acc, t);
  return NextResponse.json(
    { simulated: true, profile: acc.profile, totals: { totalUsdt: s.totalUsdt, totalToman: s.totalToman, availableUsdt: s.availableUsdt, lockedUsdt: s.lockedUsdt }, openOrders: 0, watchlist: acc.watchlist },
    { headers: NO_STORE },
  );
}
