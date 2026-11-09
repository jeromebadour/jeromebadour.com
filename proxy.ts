import { NextResponse, type NextRequest } from "next/server";

// Upwork mode (Upwork's rule on contact details, Freelance Strategy 2026-11-09): a visit that came from Upwork shows
// no way to reach Jerome off Upwork. It is on for proposal pages (/for/<job>) and for any address carrying
// ?via=upwork, which links on the page carry on (components/UpworkMode). It lives only in the address: no cookie and
// no storage, so the Privacy Policy's "one cookie, for the limits" stays true. The layout marks the page from the
// header set here; app/globals.css hides the contact routes (.off-up) and shows the Upwork line (.on-up).
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("x-via");
  const { pathname, searchParams } = request.nextUrl;
  if (pathname.startsWith("/for/") || searchParams.get("via") === "upwork") headers.set("x-via", "upwork");
  return NextResponse.next({ request: { headers } });
}

// Pages only: not the app's own files, the API, link-preview cards, or pictures.
export const config = { matcher: ["/((?!_next/|api/|og/|p/|favicon|icon|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$).*)"] };
