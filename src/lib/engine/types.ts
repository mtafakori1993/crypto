export type Side = "buy" | "sell";
export type OrderType = "market" | "limit";
export type OrderStatus = "open" | "filled" | "cancelled";

export interface Balance {
  free: number;
  locked: number;
}

export interface Order {
  id: string; // SIM-ORD-000001
  pair: string;
  side: Side;
  type: OrderType;
  status: OrderStatus;
  amount: number; // base
  price: number | null; // limit price (null for market)
  avgPrice: number | null; // execution price when filled
  total: number | null; // quote value at execution (gross, before fee)
  fee: number; // in feeAsset
  feeAsset: string;
  createdAt: number;
  closedAt: number | null;
  /** quote (buy) or base (sell) locked while the order is open */
  locked: number;
}

export interface Trade {
  id: string; // SIM-TRD-000001
  orderId: string;
  pair: string;
  side: Side;
  price: number;
  amount: number;
  total: number;
  fee: number;
  feeAsset: string;
  time: number;
}

export type TransferKind = "deposit" | "withdraw" | "transfer";
export type TransferStatus = "pending" | "completed";
export interface Transfer {
  id: string; // SIM-DEP-000001
  kind: TransferKind;
  asset: string;
  amount: number;
  fee: number;
  network: string | null;
  destination: string | null; // simulation ID, never a real address
  status: TransferStatus;
  createdAt: number;
  settleAt: number;
  completedAt: number | null;
}

export type LedgerReason = "initial" | "trade" | "fee" | "deposit" | "withdraw" | "withdraw_fee" | "transfer";
/** Every balance change is recorded so totals can be reconciled (free + locked deltas). */
export interface LedgerEntry {
  id: number;
  time: number;
  asset: string;
  delta: number; // change of free+locked
  reason: LedgerReason;
  ref: string;
}

export interface Notification {
  id: string;
  time: number;
  title: string;
  body: string;
  kind: "order" | "wallet" | "system";
  read: boolean;
}

export interface Profile {
  name: string;
  email: string;
  uid: string;
  level: string;
}
export interface Preferences {
  theme: "dark" | "light";
  notifyOrders: boolean;
  notifyWallet: boolean;
  notifyPrice: boolean;
  confirmOrders: boolean;
  defaultPair: string;
  compactTables: boolean;
}

export interface Account {
  version: 1;
  profile: Profile;
  prefs: Preferences;
  session: boolean;
  balances: Record<string, Balance>;
  orders: Order[];
  trades: Trade[];
  transfers: Transfer[];
  ledger: LedgerEntry[];
  notifications: Notification[];
  watchlist: string[]; // pair ids
  seq: { order: number; trade: number; transfer: number; ledger: number; notif: number };
}
