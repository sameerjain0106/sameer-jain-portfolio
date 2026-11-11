import type { Metadata } from "next";
import DesignLab from "@/components/DesignLab";

export const metadata: Metadata = {
  title: "Portfolio directions | Sameer Jain",
  description: "Three interactive directions for an ML and computer-vision portfolio.",
  robots: { index: false, follow: false },
};

export default function DesignLabPage({ searchParams }: { searchParams: { view?: string } }) {
  const initialDirection = searchParams.view === "atlas" || searchParams.view === "lab" ? searchParams.view : "story";
  return <DesignLab initialDirection={initialDirection} />;
}
