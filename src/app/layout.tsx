import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.replace(/\/$/, "")}` : null) ||
    "https://brand-my-grok-live.vercel.app",
);

export const metadata: Metadata = {
  metadataBase,
  title: "Brand My Grok Bots",
  description:
    "27 bots. $200 each. Your brand sits on the bot's name and icon — the one surface I look at all day.",
  openGraph: {
    title: "Brand My Grok Bots",
    description: "Your brand, on my Grok Bot. At least one customer. Me. All day.",
    siteName: "Brand My Grok Bots",
    locale: "en",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brand My Grok Bots",
    description: "Your brand, on my Grok Bot. At least one customer. Me. All day.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-ink">{children}</body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-YCWZ0W6648"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YCWZ0W6648');
        `}
      </Script>
    </html>
  );
}
