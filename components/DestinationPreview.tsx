import Image from "next/image";
import { rooms, type Direction, type RoomId } from "@/data/spatialRooms";
import styles from "./DestinationPreview.module.css";

/** Charging never mounts another live room or WebGL scene. */
export default function DestinationPreview({ room, direction }: { room: RoomId; direction: Direction }) {
  return <aside className={styles.preview} data-destination-preview={room} data-direction={direction} aria-hidden="true">
    <div className={styles.window}><div className={styles.content}>
      <span className={styles.eyebrow}>Through here / {rooms[room].short}</span>
      <strong className={styles.title}>{rooms[room].edgeLabel}</strong>
      <div className={styles.art}>
        {room === "mri" && <div className={styles.scanPlate}><div className={styles.scan}><Image src="/projects/brain-tumor-mri/images/cluster_2_samples.png" width={2250} height={480} alt="" sizes="1100px" /></div><span>A published MRI example</span></div>}
        {room === "etf" && <div className={styles.research}><i /><i /><i /><span>Freeze</span><span>Fit</span><span>Confirm</span></div>}
        {room === "profile" && <svg viewBox="0 0 280 220" fill="none"><ellipse cx="140" cy="110" rx="118" ry="55" transform="rotate(-32 140 110)" /><ellipse cx="140" cy="110" rx="118" ry="55" transform="rotate(32 140 110)" /><circle cx="140" cy="110" r="55" /><text x="140" y="127" textAnchor="middle">sj.</text></svg>}
        {room === "contact" && <svg viewBox="0 0 280 220" fill="none"><path className={styles.bloom} d="M140 14C164 14 158 55 178 61C198 67 231 39 242 60C253 81 215 95 215 112C215 134 250 148 237 168C224 188 194 164 176 171C157 179 164 211 140 211C116 211 123 179 104 171C86 164 56 188 43 168C30 148 65 134 65 112C65 95 27 81 38 60C49 39 82 67 102 61C122 55 116 14 140 14Z" /><path d="m108 114 67-33-25 65-12-26-30-6Zm30 6 37-39" /></svg>}
        {room === "entrance" && <svg viewBox="0 0 280 220" fill="none"><path d="M140 30v160M60 110h160" /><rect x="116" y="86" width="48" height="48" rx="8" /><circle cx="140" cy="30" r="17" /><circle cx="140" cy="190" r="17" /><circle cx="60" cy="110" r="17" /><circle cx="220" cy="110" r="17" /><circle className={styles.mapCenter} cx="140" cy="110" r="6" /></svg>}
      </div>
      <p className={styles.description}>{rooms[room].description}</p>
      <span className={styles.hold}>Keep holding to enter <span>↗</span></span>
    </div></div>
  </aside>;
}
