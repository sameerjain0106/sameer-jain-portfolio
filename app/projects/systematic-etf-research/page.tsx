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
    images: [],
  },
  twitter: {
    card: "summary_large_image",
    title: `${etfResearch.title} | Sameer Jain`,
    description: etfResearch.oneLiner,
    images: [],
  },
};

export default function SystematicEtfResearchPage() {
  return <SystematicEtfResearchCaseStudy />;
}
