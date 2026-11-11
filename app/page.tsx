import SpatialWorld from "@/components/SpatialWorld";
import { parseRoom } from "@/data/spatialRooms";

export default function Home({ searchParams }: { searchParams: { room?: string } }) {
  return <SpatialWorld initialRoom={parseRoom(searchParams.room)} />;
}
