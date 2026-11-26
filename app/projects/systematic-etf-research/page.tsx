import type { Metadata } from "next";
import SystematicEtfResearchCaseStudy from "@/components/SystematicEtfResearchCaseStudy";
import { etfResearch } from "@/data/etfResearch";

export const metadata: Metadata = {
  title: `${etfResearch.title} | Sameer Jain`,
  description: etfResearch.oneLiner,
  openGraph: {
    title: `${etfResearch.title} | Sameer Jain`,
    description: etfResearch.oneLiner,
    type: "article",
    images: [{ url: etfResearch.figures.confirmation, width: 1505, height: 970, alt: "ETF model development and sealed confirmation results" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${etfResearch.title} | Sameer Jain`,
    description: etfResearch.oneLiner,
    images: [{ url: etfResearch.figures.confirmation, alt: "ETF model development and sealed confirmation results" }],
  },
};

export default function SystematicEtfResearchPage() {
  return <SystematicEtfResearchCaseStudy />;
}
