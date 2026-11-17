import type { Metadata } from "next";
import { site } from "@/data/site";

const vercelHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export const metadataBase = new URL(
  vercelHost ? `https://${vercelHost}` : "https://musteermain.vercel.app",
);

export const shareImages = {
  entrance: { url: "/share/entrance.png", alt: "Sameer Jain — Data Science, Statistics and Machine Learning" },
  mri: { url: "/share/brain-tumor-mri.png", alt: "Brain Tumor MRI Classification — supervised learning, clustering and anomaly detection" },
  etf: { url: "/share/systematic-etf-research.png", alt: "Systematic ETF Research Engine — return prediction and sealed confirmation" },
  profile: { url: "/share/about-sameer.png", alt: "About Sameer Jain — Georgia Tech Industrial Engineering, Data Science and Machine Learning" },
  contact: { url: "/share/contact.png", alt: "Contact Sameer Jain — email, GitHub, LinkedIn and resume" },
} as const;

type PageMetadata = {
  title: string;
  description: string;
  path: string;
  image: { url: string; alt: string };
  type?: "website" | "article";
};

export function createPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: PageMetadata): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      type,
      images: [{ ...image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
