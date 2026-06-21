import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

const BCRYPT_ROUNDS = 12;

export function isValidLastFour(value: string): boolean {
  return /^\d{4}$/.test(value);
}

export function isValidPin(value: string): boolean {
  return /^\d{6}$/.test(value);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, BCRYPT_ROUNDS);
}

export async function verifyPin(pin: string, pinHash: string): Promise<boolean> {
  return bcrypt.compare(pin, pinHash);
}

/** Cryptographically secure 6-digit PIN (100000–999999, no leading-zero-only edge cases) */
export function generatePin(): string {
  return String(randomInt(100000, 1000000));
}
