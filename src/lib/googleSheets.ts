export type SheetRow = Record<string, string>;

export type SheetData = {
  ok: boolean;
  configured: boolean;
  headers: string[];
  rows: SheetRow[];
  error?: string;
};

// READ the current sheet contents (headers + rows) through our API proxy.
export async function fetchSheetData(): Promise<SheetData> {
  const response = await fetch("/api/google-sheets", { cache: "no-store" });
  const data = (await response.json()) as Partial<SheetData>;

  return {
    ok: Boolean(data.ok),
    configured: Boolean(data.configured),
    headers: data.headers ?? [],
    rows: data.rows ?? [],
    error: data.error,
  };
}

// WRITE a new entry (keyed by header) to the sheet.
export async function submitToGoogleSheets(
  entry: SheetRow,
): Promise<{ ok: boolean; configured: boolean }> {
  const response = await fetch("/api/google-sheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entry }),
  });

  const data = (await response.json()) as { ok?: boolean; configured?: boolean };

  if (!response.ok) {
    throw new Error("Google Sheets sync failed");
  }

  return { ok: Boolean(data.ok), configured: Boolean(data.configured) };
}
