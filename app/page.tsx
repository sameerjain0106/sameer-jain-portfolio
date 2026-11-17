import type { Metadata } from "next";
import SpatialWorld from "@/components/SpatialWorld";
import { parseRoom, roomHref, type RoomId } from "@/data/spatialRooms";
import { site } from "@/data/site";
import { createPageMetadata, shareImages } from "@/lib/metadata";

const roomMetadata: Record<RoomId, { title: string; description: string }> = {
  entrance: { title: site.seo.title, description: site.seo.description },
  mri: {
    title: "Brain Tumor MRI Classification | Sameer Jain",
    description: "Explore Sameer Jain's brain MRI research: supervised classification, unsupervised clustering, anomaly detection, and the recorded results and limitations.",
  },
  etf: {
    title: "Systematic ETF Research Engine | Sameer Jain",
    description: "Explore Sameer Jain's ETF return prediction research: leakage-controlled machine learning, sealed confirmation, and an archived forward paper signal.",
  },
  profile: {
    title: "About Sameer Jain | Data Science & Machine Learning",
    description: "Meet Sameer Jain, a Georgia Tech Industrial Engineering student. Explore his experience, education, and work in data science, statistics, and machine learning.",
  },
  contact: {
    title: "Contact & Links | Sameer Jain",
    description: "Connect with Sameer Jain by email, explore his GitHub and LinkedIn, or download his resume.",
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ room?: string | string[] }>;
}): Promise<Metadata> {
  const { room } = await searchParams;
  const id = parseRoom(room);
  return createPageMetadata({ ...roomMetadata[id], path: roomHref(id), image: shareImages[id] });
}

export default async function Home({ searchParams }: { searchParams: Promise<{ room?: string | string[] }> }) {
  const { room } = await searchParams;
  return <SpatialWorld initialRoom={parseRoom(room)} />;
}
