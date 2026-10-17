import { NextResponse } from "next/server";
import { cancelOrder, placeOrder } from "@/lib/engine/orders";
import { asAccount, NO_STORE, resolveSimTime } from "@/lib/server-sim";

export const dynamic = "force-dynamic";

/** GET: describes the (stateless) simulated order API. POST: runs the simulation engine against the posted local account. */
export async function GET() {
  return NextResponse.json(
    { simulated: true, note: "این API فقط شبیه‌سازی است؛ سفارش واقعی ثبت نمی‌شود و حساب در سرور نگهداری نمی‌شود.", actions: ["place", "cancel"], orders: [] },
    { headers: NO_STORE },
  );
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بدنه درخواست نامعتبر است" }, { status: 400, headers: NO_STORE });
  }
  const account = asAccount(body.account);
  const now = resolveSimTime(body.simTime);
  if (!account) return NextResponse.json({ ok: false, error: "حساب شبیه‌سازی نامعتبر است" }, { status: 400, headers: NO_STORE });
  if (now === null) return NextResponse.json({ ok: false, error: "ساعت شبیه‌سازی نامعتبر است" }, { status: 400, headers: NO_STORE });
  if (body.action === "cancel") {
    const r = cancelOrder(account, String(body.orderId ?? ""), now);
    return NextResponse.json(r, { status: r.ok ? 200 : 422, headers: NO_STORE });
  }
  if (body.action !== "place") return NextResponse.json({ ok: false, error: "عملیات نامعتبر است" }, { status: 400, headers: NO_STORE });
  const r = placeOrder(account, body.input, now);
  return NextResponse.json(r, { status: r.ok ? 200 : 422, headers: NO_STORE });
}
