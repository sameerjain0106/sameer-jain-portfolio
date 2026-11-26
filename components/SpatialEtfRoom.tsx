"use client";

import EtfResearchReplay from "./EtfResearchReplay";
import EtfScrollJourney from "./EtfScrollJourney";
import styles from "./SpatialEtfRoom.module.css";

export default function SpatialEtfRoom({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  return (
    <div className={styles.room} data-active={active}>
      <EtfScrollJourney active={active} scrollRoot={scrollRoot} />
      <EtfResearchReplay active={active} scrollRoot={scrollRoot} />
    </div>
  );
}
