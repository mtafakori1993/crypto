import { NextResponse } from "next/server";
import { ASSETS, IRT } from "@/lib/market/assets";
import { PAIRS } from "@/lib/market/pairs";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(
    {
      simulated: true,
      assets: [...ASSETS.map((a) => ({ symbol: a.symbol, nameFa: a.nameFa, nameEn: a.nameEn, category: a.category, amountDecimals: a.amountDecimals, networks: a.networks, withdrawFee: a.withdrawFee, minWithdraw: a.minWithdraw })), { symbol: IRT.symbol, nameFa: IRT.nameFa, nameEn: IRT.nameEn }],
      pairs: PAIRS,
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
