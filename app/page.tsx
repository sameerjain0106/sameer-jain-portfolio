import SpatialWorld from "@/components/SpatialWorld";
import { parseRoom } from "@/data/spatialRooms";

export default async function Home({ searchParams }: { searchParams: Promise<{ room?: string | string[] }> }) {
  const { room } = await searchParams;
  return <SpatialWorld initialRoom={parseRoom(room)} />;
}
