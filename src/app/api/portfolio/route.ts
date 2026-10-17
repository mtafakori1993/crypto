import { NextResponse } from "next/server";
import { createInitialAccount, reconcile, summarize } from "@/lib/engine/account";
import { simNow } from "@/lib/market/model";
import { asAccount, NO_STORE } from "@/lib/server-sim";

export const dynamic = "force-dynamic";

/** GET: valuation of the fictional starter portfolio. POST {account}: valuation of a posted local simulation account. */
export function GET() {
  const t = simNow();
  const acc = createInitialAccount(t);
  return NextResponse.json({ simulated: true, time: t, summary: summarize(acc, t), reconciled: reconcile(acc).length === 0 }, { headers: NO_STORE });
}
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const acc = asAccount(body?.account);
  if (!acc) return NextResponse.json({ error: "حساب شبیه‌سازی نامعتبر است" }, { status: 400, headers: NO_STORE });
  const t = simNow();
  return NextResponse.json({ simulated: true, time: t, summary: summarize(acc, t), reconciled: reconcile(acc).length === 0 }, { headers: NO_STORE });
}
