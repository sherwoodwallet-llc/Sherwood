import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  const teamId = process.env.APPLE_TEAM_ID ?? "TEAMID";
  const appBundleId = process.env.APPLE_APP_BUNDLE_ID ?? "com.sherwood.app";
  const appClipBundleId = process.env.APPLE_APP_CLIP_BUNDLE_ID ?? "com.sherwood.app.Clip";

  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appIDs: [`${teamId}.${appBundleId}`, `${teamId}.${appClipBundleId}`],
            components: [
              {
                "/": "/check-balance",
                comment: "QR allowance lookup and App Clip fallback URL",
              },
            ],
          },
        ],
      },
      appclips: {
        apps: [`${teamId}.${appClipBundleId}`],
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
