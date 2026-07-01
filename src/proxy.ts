import { NextResponse, type NextRequest } from "next/server";

const CONNECT_APP_ORIGIN = "https://sherwood-connect.vercel.app";
const CONNECT_HOSTS = new Set([
  "sherwood-connect-nu-seven.vercel.app",
  "sherwoodconnect.nu",
  "www.sherwoodconnect.nu",
]);

function isConnectHost(host: string) {
  return CONNECT_HOSTS.has(host);
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (host && isConnectHost(host)) {
    const target = new URL(request.nextUrl.pathname, CONNECT_APP_ORIGIN);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, 308);
  }

  return NextResponse.next();
}
