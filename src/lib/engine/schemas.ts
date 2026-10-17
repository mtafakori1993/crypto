import { z } from "zod";
import { assetMap } from "../market/assets";
import { pairMap } from "../market/pairs";

export const orderInputSchema = z
  .object({
    pair: z.string().refine((p) => p in pairMap, "جفت‌ارز نامعتبر است"),
    side: z.enum(["buy", "sell"]),
    type: z.enum(["market", "limit"]),
    amount: z.number().finite().positive("مقدار باید بزرگ‌تر از صفر باشد"),
    price: z.number().finite().positive("قیمت باید بزرگ‌تر از صفر باشد").optional(),
  })
  .refine((o) => o.type === "market" || o.price !== undefined, { message: "قیمت سفارش حدی الزامی است", path: ["price"] });
export type OrderInput = z.infer<typeof orderInputSchema>;

export const transferInputSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("deposit"), asset: z.string().refine((a) => a === "IRT" || a in assetMap), amount: z.number().positive(), network: z.string().min(1) }),
  z.object({ kind: z.literal("withdraw"), asset: z.string().refine((a) => a in assetMap), amount: z.number().positive(), network: z.string().min(1), destination: z.string().regex(/^SIM-ADDR-\d{3}$/, "مقصد باید یکی از شناسه‌های نمونه باشد") }),
  z.object({ kind: z.literal("transfer"), asset: z.string().refine((a) => a === "IRT" || a in assetMap), amount: z.number().positive(), destination: z.string().regex(/^SIM-\d{6}$/, "شناسه حساب نمونه باید به شکل SIM-123456 باشد") }),
]);
export type TransferInput = z.infer<typeof transferInputSchema>;
