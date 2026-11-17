import type { Metadata } from "next";
import SystematicEtfResearchCaseStudy from "@/components/SystematicEtfResearchCaseStudy";
import { etfResearch } from "@/data/etfResearch";
import { createPageMetadata, shareImages } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: `${etfResearch.title} | Sameer Jain`,
  description: etfResearch.oneLiner,
  path: `/projects/${etfResearch.slug}`,
  image: shareImages.etf,
  type: "article",
});

export default function SystematicEtfResearchPage() {
  return <SystematicEtfResearchCaseStudy />;
}
