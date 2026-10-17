import { NextResponse } from "next/server";
import { requestTransfer } from "@/lib/engine/transfers";
import { asAccount, NO_STORE, resolveSimTime } from "@/lib/server-sim";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بدنه درخواست نامعتبر است" }, { status: 400, headers: NO_STORE });
  }
  const account = asAccount(body.account);
  const now = resolveSimTime(body.simTime);
  if (!account || now === null) return NextResponse.json({ ok: false, error: "درخواست شبیه‌سازی نامعتبر است" }, { status: 400, headers: NO_STORE });
  const r = requestTransfer(account, body.input, now);
  return NextResponse.json(r, { status: r.ok ? 200 : 422, headers: NO_STORE });
}
