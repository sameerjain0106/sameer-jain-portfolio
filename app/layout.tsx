import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
import { site } from "@/data/site";
import SiteFrame from "@/components/SiteFrame";
import { metadataBase, shareImages } from "@/lib/metadata";

export const metadata: Metadata = {
  metadataBase,
  title: site.seo.title,
  description: site.seo.description,
  openGraph: {
    title: site.seo.title,
    description: site.seo.description,
    siteName: site.name,
    type: "website",
    images: [
      {
        ...shareImages.entrance,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
    images: [shareImages.entrance],
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
