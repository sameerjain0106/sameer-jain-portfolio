export const rooms = {
  entrance: { label: "Entrance", edgeLabel: "Entrance", short: "Start here", x: 0, y: 0, color: "#cbc8f2", description: "A curious mind at work." },
  mri: { label: "Learning to see", edgeLabel: "Brain Tumor MRI", short: "MRI / machine learning", x: -1, y: 0, color: "#2449dc", description: "Inside a brain MRI experiment." },
  etf: { label: "Finding a signal", edgeLabel: "ETF Return Prediction", short: "ETF / research systems", x: 1, y: 0, color: "#f2ef9b", description: "Putting a market hypothesis to the test." },
  profile: { label: "Meet Sameer", edgeLabel: "About Sameer", short: "A little about me", x: 0, y: -1, color: "#ff987f", description: "The person behind the experiments." },
  contact: { label: "Say hello", edgeLabel: "Contact & Links", short: "Let's connect", x: 0, y: 1, color: "#bdebd7", description: "A good place to start a conversation." },
} as const;

export type RoomId = keyof typeof rooms;
export type Direction = "left" | "right" | "up" | "down";
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
export function roomFromLocation(): RoomId {
  const hashRooms: Record<string, RoomId> = { "#work": "mri", "#profile": "profile", "#about": "profile", "#education": "profile", "#contact": "contact", "#more-work": "etf" };
  return hashRooms[window.location.hash] ?? parseRoom(new URLSearchParams(window.location.search).get("room"));
}
