import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  const packageName = process.env.ANDROID_PACKAGE_NAME;
  const sha256CertFingerprint = process.env.ANDROID_SHA256_CERT_FINGERPRINT;

  if (!packageName || !sha256CertFingerprint) {
    return NextResponse.json([], {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: packageName,
          sha256_cert_fingerprints: [sha256CertFingerprint],
        },
      },
    ],
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
