import type { Account, Order, Transfer } from "@/lib/engine/types";
import type { EngineResult } from "@/lib/engine/orders";

/**
 * The seam between UI and "backend". The UI only talks to this interface; today it is implemented by the
 * in-app Next.js route handlers (stateless simulation engine). A real backend could implement the same
 * interface without touching any component.
 */
export interface ExchangeService {
  placeOrder(account: Account, input: unknown, simTime: number): Promise<EngineResult<{ order: Order }>>;
  cancelOrder(account: Account, orderId: string, simTime: number): Promise<EngineResult>;
  requestTransfer(account: Account, input: unknown, simTime: number): Promise<EngineResult<{ transfer: Transfer }>>;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  try {
    return (await res.json()) as T;
  } catch {
    return { ok: false, error: "پاسخ نامعتبر از سرویس شبیه‌سازی" } as T;
  }
}

export const httpExchangeService: ExchangeService = {
  placeOrder: (account, input, simTime) => post("/api/orders", { action: "place", account, input, simTime }),
  cancelOrder: (account, orderId, simTime) => post("/api/orders", { action: "cancel", account, orderId, simTime }),
  requestTransfer: (account, input, simTime) => post("/api/transfers", { account, input, simTime }),
};
