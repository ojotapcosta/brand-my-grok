import { ImageResponse } from "next/og";

export const alt = "Brand My Grok Bot Bot — Your brand, on my Grok Bot.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadInter(weight: 500 | 600) {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/inter@5.2.5/latin-${weight}-normal.woff`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load Inter ${weight}: ${res.status}`);
  }
  return res.arrayBuffer();
}

export default async function Image() {
  const [interMedium, interSemiBold] = await Promise.all([loadInter(500), loadInter(600)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#ffffff",
          padding: "88px 104px",
          color: "#1d1d1f",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          Brand My Grok Bot
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontFamily: "Inter",
            fontSize: 64,
            fontWeight: 500,
            letterSpacing: "-0.05em",
            lineHeight: 1.05,
          }}
        >
          Your brand, on my Grok Bot.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontFamily: "Inter",
            fontSize: 28,
            fontWeight: 500,
            color: "#56565c",
            letterSpacing: "-0.02em",
          }}
        >
          At least one customer. Me. All day.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: interMedium, style: "normal", weight: 500 },
        { name: "Inter", data: interSemiBold, style: "normal", weight: 600 },
      ],
    },
  );
}
