export const rooms = {
  entrance: { label: "Entrance", edgeLabel: "Entrance", short: "Start here", x: 0, y: 0, color: "#cbc8f2", description: "A curious mind at work." },
  mri: { label: "Learning to see", edgeLabel: "Brain Tumor MRI", short: "MRI / machine learning", x: -1, y: 0, color: "#56bdb7", description: "Inside a brain MRI experiment." },
  etf: { label: "Finding a signal", edgeLabel: "ETF Return Prediction", short: "ETF / research systems", x: 1, y: 0, color: "#f2ef9b", description: "Putting a market hypothesis to the test." },
  granted: { label: "Granted", edgeLabel: "Granted · Grant Analytics", short: "JPMorgan Chase Data for Good", x: 0, y: -1, color: "#ff987f", description: "First place in the AnnieCannons challenge." },
} as const;

export type RoomId = keyof typeof rooms;
export type Direction = "left" | "right" | "up" | "down";
export type RoomAnchor = "#about" | "#timeline" | "#contact" | "#granted-file" | "#granted-demo";
export const roomIds = Object.keys(rooms) as RoomId[];
export const directions: Direction[] = ["left", "up", "right", "down"];
export const arrows: Record<Direction, string> = { left: "←", right: "→", up: "↑", down: "↓" };
const vectors: Record<Direction, [number, number]> = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };

export function parseRoom(value: unknown): RoomId {
  return typeof value === "string" && Object.hasOwn(rooms, value) ? value as RoomId : "entrance";
}
export function roomHref(id: RoomId) { return id === "entrance" ? "/" : `/?room=${id}`; }
export function neighbor(id: RoomId, direction: Direction): RoomId | undefined {
  const [dx, dy] = vectors[direction];
  return roomIds.find(key => rooms[key].x === rooms[id].x + dx && rooms[key].y === rooms[id].y + dy);
}
export function roomDestination(search: string, hash: string): { room: RoomId; anchor?: RoomAnchor } {
  switch (hash) {
    case "#work": return { room: "mri" };
    case "#more-work": return { room: "etf" };
    case "#granted-file":
    case "#granted-demo": return { room: "granted", anchor: hash };
    case "#profile":
    case "#about": return { room: "entrance", anchor: "#about" };
    case "#education":
    case "#timeline": return { room: "entrance", anchor: "#timeline" };
    case "#contact": return { room: "entrance", anchor: "#contact" };
  }
  const room = new URLSearchParams(search).get("room");
  if (room === "profile" || room === "about") return { room: "entrance", anchor: "#about" };
  if (room === "education") return { room: "entrance", anchor: "#timeline" };
  if (room === "contact") return { room: "entrance", anchor: "#contact" };
  return { room: parseRoom(room) };
}
