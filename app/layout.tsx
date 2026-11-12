import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
import { site } from "@/data/site";
import SiteFrame from "@/components/SiteFrame";

const vercelHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const metadataBase = new URL(
  vercelHost ? `https://${vercelHost}` : "https://musteermain.vercel.app",
);

export const metadata: Metadata = {
  metadataBase,
  title: site.seo.title,
  description: site.seo.description,
  openGraph: {
    title: site.seo.title,
    description: site.seo.description,
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "Sameer Jain — Machine Learning, Computer Vision, and Data Engineering",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
    images: ["/og.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg?v=sj-1", type: "image/svg+xml", sizes: "any" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-base text-ink font-body antialiased selection:bg-signal/20 selection:text-signal">
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
