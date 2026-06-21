# QR Card Allowance Prototype

This prototype lets a recipient scan one HTTPS QR code, enter their card's last four digits and six-digit PIN, and see a program-assigned allowance. It does not move money and does not expose Stripe card secrets.

## Public URL

Use the same URL for QR, mobile web fallback, and App Clip launch:

```text
https://YOUR_PROGRAM_DOMAIN/check-balance
```

## Environment

Set these Vercel environment variables from `.env.example`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SYNC_TOKEN`
- `RATE_LIMIT_SALT`
- `APPLE_TEAM_ID`
- `APPLE_APP_BUNDLE_ID`
- `APPLE_APP_CLIP_BUNDLE_ID`

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never prefix it with `NEXT_PUBLIC_`.

## Supabase

Run `supabase/migrations/20250611000000_allowance_cards.sql` in the Supabase SQL editor or through the Supabase CLI. The migration creates:

- `cards`
- `lookup_attempts`
- `lookup_lockouts`
- `sync_logs`

RLS is enabled with no direct client policies. The Next.js server uses the Supabase service role for both lookup and admin sync.

## Google Sheets

Create a sheet with these columns:

```text
Stripe card ID | Last four | Allowance | Currency | Active | Sync status | Updated time | PIN once
```

Install `docs/google-sheets-apps-script.js` in Apps Script and set script properties:

- `SHERWOOD_SYNC_URL=https://YOUR_PROGRAM_DOMAIN/api/admin/cards/sync`
- `SHERWOOD_SYNC_TOKEN=<same as ADMIN_SYNC_TOKEN>`

The script converts dollar allowances to cents, sends rows to the API, and writes generated PINs once into the `PIN once` column. Staff should show the PIN to the recipient and clear that cell.

## API

### `POST /api/allowance/lookup`

Input:

```json
{ "last4": "0427", "pin": "123456" }
```

Success response:

```json
{
  "ok": true,
  "cardEnding": "•••• 0427",
  "allowanceFormatted": "$25.00",
  "currency": "USD",
  "updatedAt": "Jun 11, 2026, 9:15 PM",
  "stale": false
}
```

Failures return generic invalid, locked, inactive, offline/client error, or unavailable states. No full card numbers, raw PINs, Stripe secrets, or PIN hashes are returned.

### `POST /api/admin/cards/sync`

Protected by:

```text
Authorization: Bearer <ADMIN_SYNC_TOKEN>
```

Input:

```json
{
  "cards": [
    {
      "stripe_card_id": "ic_123",
      "last_four": "0427",
      "allowance_cents": 2500,
      "currency": "usd",
      "active": true,
      "generate_pin": true
    }
  ]
}
```

The server hashes the PIN and returns generated PINs once.

## App Clip

Vercel serves:

- `/.well-known/apple-app-site-association`
- `/apple-app-site-association`

Configure the Apple App Clip experience in App Store Connect with:

- URL: `https://YOUR_PROGRAM_DOMAIN/check-balance`
- Associated domain entitlement: `appclips:YOUR_PROGRAM_DOMAIN`
- Universal Links entitlement: `applinks:YOUR_PROGRAM_DOMAIN`

Android users remain on the responsive web page in v1. Optional Android app link support is available through `/.well-known/assetlinks.json`.

## Security Notes

- HTTPS-only in production.
- Never store PAN, expiration date, CVC, or raw PIN.
- PINs are bcrypt hashed server-side.
- Duplicate last-four records are allowed and distinguished by PIN.
- Failed lookups are rate-limited across Vercel instances through Supabase tables.
- Repeated failures create a temporary lockout.
- Inactive cards are rejected after a valid PIN match.
- Malformed or negative allowances are rejected by the sync API and database checks.
