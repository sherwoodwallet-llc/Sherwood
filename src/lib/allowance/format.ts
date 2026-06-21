const STALE_HOURS = Number(process.env.ALLOWANCE_STALE_HOURS ?? "72");

export function formatAllowance(cents: number, currency: string): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function maskCardEnding(lastFour: string): string {
  return `•••• ${lastFour}`;
}

export function isStaleData(updatedAt: string): boolean {
  const updated = new Date(updatedAt).getTime();
  const thresholdMs = STALE_HOURS * 60 * 60 * 1000;
  return Date.now() - updated > thresholdMs;
}

export function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
