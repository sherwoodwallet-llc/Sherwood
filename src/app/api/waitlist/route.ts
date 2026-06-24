import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const roles = new Set(["Donor", "Nonprofit", "Merchant", "Builder", "Investor"]);

type WaitlistPayload = {
  name?: unknown;
  email?: unknown;
  role?: unknown;
  message?: unknown;
};

function normalizePayload(payload: WaitlistPayload) {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const role = typeof payload.role === "string" ? payload.role.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  return { name, email, role, message };
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: "Waitlist storage is not configured." },
      { status: 500 },
    );
  }

  let payload: WaitlistPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, role, message } = normalizePayload(payload);

  if (!name || !email || !role) {
    return NextResponse.json({ error: "Name, email, and role are required." }, { status: 400 });
  }

  if (!roles.has(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from("waitlist_entries")
    .insert({ name, email, role, message: message || null });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "This email is already on the waitlist." }, { status: 409 });
    }

    return NextResponse.json({ error: "Could not join the waitlist." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
