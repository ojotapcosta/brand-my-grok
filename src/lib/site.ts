export function siteUrl(request?: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  if (request) {
    const proto = request.headers.get("x-forwarded-proto") ?? "http";
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (host) return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}
