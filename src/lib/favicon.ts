import { parsePublicHttpUrl } from "./url";

function googleFavicon(hostname: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
}

function absolutize(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function pickIconHref(html: string): string | null {
  const matches = [
    ...html.matchAll(
      /<link\b[^>]*rel=["']([^"']*)["'][^>]*>/gi,
    ),
  ];
  const scored: { href: string; score: number }[] = [];
  for (const match of matches) {
    const tag = match[0];
    const rel = (match[1] ?? "").toLowerCase();
    if (!rel.includes("icon")) continue;
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    let score = 1;
    if (rel.includes("apple-touch")) score = 2;
    if (/\d{2,3}x\d{2,3}/.test(tag)) score = 3;
    if (rel === "icon" || rel === "shortcut icon") score = 4;
    scored.push({ href, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.href ?? null;
}

export async function resolveFavicon(siteUrl: string): Promise<string> {
  const url = parsePublicHttpUrl(siteUrl);
  const fallback = googleFavicon(url.hostname);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url.origin, {
      signal: controller.signal,
      headers: { Accept: "text/html" },
      redirect: "follow",
    });
    clearTimeout(timer);
    const html = await res.text();
    const href = pickIconHref(html.slice(0, 80_000));
    const absolute = href ? absolutize(href, res.url || url.origin) : null;
    if (absolute) return absolute;
  } catch {
    // Favicon lookup is best-effort. Google's service still paints the spot.
  }

  return fallback;
}
