import Image from "next/image";
import type { CSSProperties, Ref } from "react";
import { rooms, type Direction, type RoomId } from "@/data/spatialRooms";
import styles from "./DestinationPreview.module.css";

/** Charging never mounts another live room or WebGL scene. */
export default function DestinationPreview({ room, direction, progressRef }: { room: RoomId; direction: Direction; progressRef?: Ref<HTMLElement> }) {
  return <aside ref={progressRef} className={styles.preview} data-destination-preview={room} data-direction={direction} aria-hidden="true"
    style={{ "--preview-room-color": rooms[room].color } as CSSProperties}>
    <div className={styles.window}><div className={styles.content}>
      <span className={styles.eyebrow}>Through here / {rooms[room].short}</span>
      <strong className={styles.title}>{rooms[room].edgeLabel}</strong>
      <div className={styles.art}>
        {room === "mri" && <div className={styles.scanPlate}><div className={styles.scan}><Image src="/projects/brain-tumor-mri/images/cluster_2_samples.png" width={2250} height={480} alt="" sizes="1100px" /></div><span>A published MRI example</span></div>}
        {room === "etf" && <div className={styles.research}><i /><i /><i /><span>Freeze</span><span>Fit</span><span>Confirm</span></div>}
        {room === "granted" && <svg viewBox="0 0 280 220" fill="none">
          <g transform="rotate(-8 140 110)">
            <path d="M51 72V53Q51 46 58 46H116L132 60H219Q226 60 226 67V161H51Z" fill="var(--peek-accent)" />
            <path d="M78 49V31H180L206 57V151H78Z" fill="#fff8ed" />
            <path d="M180 31V57H206M93 65H151M93 76H142" />
            <path d="M50 99Q52 92 60 92H226Q234 92 233 100L224 177Q223 184 215 184H66Q58 184 56 176Z" fill="var(--peek-accent)" />
            <path d="M77 113H151M77 124H125M164 141L177 154L208 125" />
          </g>
        </svg>}
        {room === "entrance" && <svg viewBox="0 0 280 220" fill="none"><path d="M140 30v160M60 110h160" /><rect x="116" y="86" width="48" height="48" rx="8" /><circle cx="140" cy="30" r="17" /><circle cx="140" cy="190" r="17" /><circle cx="60" cy="110" r="17" /><circle cx="220" cy="110" r="17" /><circle className={styles.mapCenter} cx="140" cy="110" r="6" /></svg>}
      </div>
      <p className={styles.description}>{rooms[room].description}</p>
      <span className={styles.hold}>Keep holding to enter <span>↗</span></span>
    </div></div>
  </aside>;
}
