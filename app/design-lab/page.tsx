import type { Metadata } from "next";
import DesignLab from "@/components/DesignLab";

export const metadata: Metadata = {
  title: "Portfolio directions | Sameer Jain",
  description: "Three interactive directions for an ML and computer-vision portfolio.",
  robots: { index: false, follow: false },
};

export default async function DesignLabPage({ searchParams }: { searchParams: Promise<{ view?: string | string[] }> }) {
  const { view } = await searchParams;
  const initialDirection = view === "atlas" || view === "lab" ? view : "story";
  return <DesignLab initialDirection={initialDirection} />;
}
