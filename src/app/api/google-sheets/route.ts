import { NextResponse } from "next/server";
import { SEED_HEADERS, SEED_ROWS } from "@/data/churchSeed";

const WEBHOOK_URL =
  process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL ||
  "PASTE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL_HERE";

const isConfigured = WEBHOOK_URL !== "PASTE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL_HERE";

type SheetEntry = Record<string, string>;

type PostBody = {
  entry?: SheetEntry;
};

// READ: proxy the Apps Script doGet, returning { headers, rows }.
export async function GET() {
  if (!isConfigured) {
    // Fall back to the imported spreadsheet snapshot until the live sheet is connected.
    return NextResponse.json({
      ok: true,
      configured: false,
      headers: SEED_HEADERS,
      rows: SEED_ROWS,
    });
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, configured: true, error: "Sheet read failed", headers: [], rows: [] },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      ok: boolean;
      headers?: string[];
      rows?: SheetEntry[];
      error?: string;
    };

    return NextResponse.json({
      ok: data.ok,
      configured: true,
      headers: data.headers ?? [],
      rows: data.rows ?? [],
      error: data.error,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error: error instanceof Error ? error.message : "Sheet read failed",
        headers: [],
        rows: [],
      },
      { status: 502 },
    );
  }
}

// WRITE: forward a header-keyed entry to the Apps Script doPost.
export async function POST(request: Request) {
  const body = (await request.json()) as PostBody;

  if (!body.entry || typeof body.entry !== "object") {
    return NextResponse.json({ ok: false, error: "Missing entry" }, { status: 400 });
  }

  if (!isConfigured) {
    console.log("Google Sheets webhook not configured yet", body.entry);
    return NextResponse.json({
      ok: true,
      configured: false,
      message:
        "Entry accepted locally. Add GOOGLE_APPS_SCRIPT_WEBHOOK_URL to sync with Google Sheets.",
    });
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
      body: JSON.stringify({ entry: body.entry }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, configured: true, error: "Sheet append failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, configured: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error: error instanceof Error ? error.message : "Sheet append failed",
      },
      { status: 502 },
    );
  }
}
