export type LookupSuccess = {
  ok: true;
  cardEnding: string;
  allowanceFormatted: string;
  currency: string;
  updatedAt: string;
  stale: boolean;
};

export type LookupInactive = {
  ok: false;
  code: "inactive";
  message: string;
};

export type LookupInvalid = {
  ok: false;
  code: "invalid";
  message: string;
};

export type LookupLocked = {
  ok: false;
  code: "locked";
  message: string;
  retryAfterSeconds?: number;
};

export type LookupError = {
  ok: false;
  code: "error";
  message: string;
};

export type LookupResponse =
  | LookupSuccess
  | LookupInactive
  | LookupInvalid
  | LookupLocked
  | LookupError;

export type SyncCardInput = {
  stripe_card_id: string;
  last_four: string;
  allowance_cents: number;
  currency?: string;
  active?: boolean;
  /** Plain PIN from Apps Script (transmitted over HTTPS only, hashed server-side) */
  pin?: string;
  /** Ask server to generate a new 6-digit PIN */
  generate_pin?: boolean;
};

export type SyncCardResult = {
  stripe_card_id: string;
  last_four: string;
  status: "created" | "updated" | "error";
  /** Returned once when PIN is set or generated — never stored in DB */
  pin_once?: string;
  error?: string;
};
