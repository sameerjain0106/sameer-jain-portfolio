"use client";

import { memo, useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { gsap } from "gsap";
import { arrows, directions, neighbor, roomFromLocation, roomHref, roomIds, rooms, type Direction, type RoomId } from "@/data/spatialRooms";
import MriScrollJourney from "./MriScrollJourney";
import SpatialEtfRoom from "./SpatialEtfRoom";
import { ContactRoom, ProfileRoom } from "./SpatialPeopleRooms";
import SpatialEntrance from "./SpatialEntrance";
import DestinationPreview from "./DestinationPreview";
import RoomCreature from "./RoomCreature";
import LivingCursor from "./LivingCursor";
import { AmbientMotionProvider, useAmbientMotion } from "@/lib/useAmbientMotion";
import { useScrollChoreography } from "@/lib/useScrollChoreography";
import { useRoomSmoothScroll } from "@/lib/useRoomSmoothScroll";
import styles from "./SpatialWorld.module.css";

type Mode = { kind: "idle" } | { kind: "map" } | { kind: "travel"; from: RoomId; to: RoomId };
type World = { room: RoomId; visited: RoomId[]; mode: Mode };
const HOLD_MS = 1050;
const gatePaths: Record<Direction, string> = {
  left: "M8 10 Q164 150 8 290",
  right: "M92 10 Q-64 150 92 290",
  up: "M10 8 Q150 164 290 8",
  down: "M10 92 Q150 -64 290 92",
};

function edgeAt(x: number, y: number): Direction | null {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (x < 44 && y > 90 && y < h - 90) return "left";
  if (x > w - 44 && y > 90 && y < h - 90) return "right";
  if (y < 38 && x > w * .25 && x < w * .75) return "up";
  if (y > h - 38 && x > w * .25 && x < w * .75) return "down";
  return null;
}

const RoomPanel = memo(function RoomPanel({ id, active, visible, navigate }: {
  id: RoomId; active: boolean; visible: boolean; navigate: (id: RoomId) => void;
}) {
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const panel = useRef<HTMLElement | null>(null);
  useAmbientMotion(active, undefined, panel);
  useRoomSmoothScroll(active, scrollRoot);
  useScrollChoreography(active, scrollRoot);
  return <section data-panel={id} data-active={active} hidden={!visible} aria-hidden={!active}
    aria-label={rooms[id].label} className={styles.panel}
    ref={element => { panel.current = element; if (element) element.inert = !active; }}>
    <div ref={setScrollRoot} className={styles.scroller} data-room-scroll={id}>
      {id === "entrance" && <SpatialEntrance active={active} scrollRoot={scrollRoot} navigate={navigate} />}
      {id === "mri" && <MriScrollJourney active={active} scrollRoot={scrollRoot} />}
      {id === "etf" && <SpatialEtfRoom active={active} scrollRoot={scrollRoot} />}
      {id === "profile" && <ProfileRoom active={active} scrollRoot={scrollRoot} />}
      {id === "contact" && <ContactRoom active={active} scrollRoot={scrollRoot} />}
    </div>
  </section>;
});

export default function SpatialWorld({ initialRoom }: { initialRoom: RoomId }) {
  const [world, setWorld] = useState<World>({ room: initialRoom, visited: [initialRoom], mode: { kind: "idle" } });
  const [dwell, setDwell] = useState<Direction | null>(null);
  const [reduced, setReduced] = useState(false);
  const [idlePaused, setIdlePaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const mapButton = useRef<HTMLButtonElement>(null);
  const worldRef = useRef(world);
  const reducedRef = useRef(false);
  const armed = useRef(true);
  const holdFrame = useRef(0);
  const hold = useRef<{ direction: Direction; started: number } | null>(null);
  const inhibitedUntil = useRef(0);
  const pressed = useRef(false);
  const finishTravel = useRef<(() => void) | null>(null);
  worldRef.current = world;

  useEffect(() => {
    try { setIdlePaused(localStorage.getItem("sj-idle-motion") === "paused"); } catch { /* Storage can be unavailable in private contexts. */ }
  }, []);

  const toggleIdle = () => setIdlePaused(paused => {
    try { localStorage.setItem("sj-idle-motion", paused ? "playing" : "paused"); } catch { /* The control still works for this visit. */ }
    return !paused;
  });

  const cancelHold = useCallback(() => {
    if (!hold.current && !holdFrame.current) return;
    cancelAnimationFrame(holdFrame.current);
    holdFrame.current = 0;
    hold.current = null;
    root.current?.style.setProperty("--hold", "0");
    setDwell(null);
  }, []);

  const focusRoom = useCallback((id: RoomId) => {
    const panel = root.current?.querySelector<HTMLElement>(`[data-panel="${id}"]`);
    const fragment = window.location.hash;
    const destination = id === "profile" && (fragment === "#education" || fragment === "#about") ? panel?.querySelector<HTMLElement>(fragment) : null;
    const stage = panel?.querySelector<HTMLElement>("[data-room-heading]");
    const book = panel?.querySelector<HTMLElement>('[data-profile-enhanced="true"] [data-profile-book]');
    const scroller = panel?.querySelector<HTMLElement>("[data-room-scroll]");
    const unfoldEducation = fragment === "#education" && book && scroller;
    const heading = destination && !book && fragment === "#education"
      ? destination.querySelector<HTMLElement>("h1, h2")
      : stage ?? panel?.querySelector<HTMLElement>("h1");
    if (unfoldEducation) {
      const start = book.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
      scroller.scrollTop = start + (book.offsetHeight - scroller.clientHeight) * .48;
    } else destination?.scrollIntoView({ block: "start", behavior: "auto" });
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }, []);

  const navigate = useCallback((to: RoomId, fromHistory = false) => {
    const current = worldRef.current;
    if (current.mode.kind === "travel" && !fromHistory) return;
    cancelHold();
    armed.current = false;
    const from = current.mode.kind === "travel" ? current.mode.to : current.room;
    if (to === from && current.mode.kind !== "travel") {
      setWorld({ ...current, mode: { kind: "idle" } });
      requestAnimationFrame(() => focusRoom(to));
      return;
    }
    const next: World = {
      room: from,
      visited: current.visited.includes(to) ? current.visited : [...current.visited, to],
      mode: { kind: "travel", from, to },
    };
    worldRef.current = next;
    setWorld(next);
    if (!fromHistory) window.history.pushState(null, "", roomHref(to));
  }, [cancelHold, focusRoom]);

  const followLink = (event: MouseEvent<HTMLAnchorElement>, id: RoomId) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    navigate(id);
  };

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => { reducedRef.current = media.matches; setReduced(media.matches); if (media.matches) finishTravel.current?.(); };
    change();
    media.addEventListener("change", change);
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const onHistory = () => navigate(roomFromLocation(), true);
    window.addEventListener("popstate", onHistory);
    window.addEventListener("hashchange", onHistory);
    if (roomFromLocation() !== worldRef.current.room || window.location.hash === "#education" || window.location.hash === "#about") onHistory();
    return () => {
      media.removeEventListener("change", change);
      window.removeEventListener("popstate", onHistory);
      window.removeEventListener("hashchange", onHistory);
      history.scrollRestoration = previousRestoration;
    };
  }, [navigate]);

  useEffect(() => {
    if (world.mode.kind !== "travel") return;
    const trip = world.mode;
    const outgoing = root.current?.querySelector<HTMLElement>(`[data-panel="${trip.from}"]`);
    const incoming = root.current?.querySelector<HTMLElement>(`[data-panel="${trip.to}"]`);
    let live = true;
    const complete = () => {
      if (!live) return;
      live = false;
      const next: World = { room: trip.to, visited: worldRef.current.visited, mode: { kind: "idle" } };
      worldRef.current = next;
      setWorld(next);
      inhibitedUntil.current = performance.now() + 300;
      // Focus after the room is no longer inert. No scroll jump on return visits.
      requestAnimationFrame(() => focusRoom(trip.to));
    };
    finishTravel.current = complete;
    if (!outgoing || !incoming || reducedRef.current || trip.from === trip.to) {
      complete();
      return () => { live = false; finishTravel.current = null; };
    }
    const dx = rooms[trip.to].x - rooms[trip.from].x;
    const dy = rooms[trip.to].y - rooms[trip.from].y;
    const length = Math.max(Math.abs(dx), Math.abs(dy), 1);
    const x = dx / length * window.innerWidth;
    const y = dy / length * window.innerHeight;
    const stretch = { scaleX: dx ? 1.065 : .975, scaleY: dy ? 1.065 : .975 };
    const context = gsap.context(() => {
      gsap.set([outgoing, incoming], { willChange: "transform, filter", transformOrigin: "50% 50%" });
      gsap.set(incoming, { x, y, ...stretch, filter: "blur(5px)" });
      const timeline = gsap.timeline({ onComplete: complete, defaults: { ease: "power3.inOut" } });
      timeline.to(outgoing, { x: -x, y: -y, duration: .88 }, 0)
        .to(outgoing, { ...stretch, filter: "blur(5px)", duration: .38 }, 0)
        .to(incoming, { x: 0, y: 0, duration: .88 }, 0)
        .to(incoming, { scaleX: 1, scaleY: 1, filter: "blur(0px)", duration: .58, ease: "power3.out" }, .3);
    }, root);
    window.addEventListener("resize", complete);
    return () => { live = false; finishTravel.current = null; window.removeEventListener("resize", complete); context.revert(); };
  }, [world.mode, focusRoom]);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const tick = (now: number) => {
      const pending = hold.current;
      if (!pending) return;
      if (worldRef.current.mode.kind !== "idle" || document.hidden || document.getSelection()?.toString()) { cancelHold(); return; }
      const progress = Math.min(1, (now - pending.started) / HOLD_MS);
      root.current?.style.setProperty("--hold", String(progress));
      if (progress >= 1) {
        const target = neighbor(worldRef.current.room, pending.direction);
        cancelHold();
        if (target) navigate(target);
      } else holdFrame.current = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !fine.matches) return;
      const gate = (event.target as Element)?.closest<HTMLElement>("[data-edge]");
      const edge = (gate?.dataset.edge as Direction | undefined) ?? edgeAt(event.clientX, event.clientY);
      if (!edge) { armed.current = true; cancelHold(); return; }
      const state = worldRef.current;
      if (!armed.current || pressed.current || event.buttons || state.mode.kind !== "idle" || performance.now() < inhibitedUntil.current || document.getSelection()?.toString() || (event.target as Element)?.closest("[data-no-dwell]")) { cancelHold(); return; }
      if (!neighbor(state.room, edge)) { cancelHold(); return; }
      if (hold.current?.direction === edge) return;
      cancelHold();
      hold.current = { direction: edge, started: performance.now() };
      setDwell(edge);
      holdFrame.current = requestAnimationFrame(tick);
    };
    const scroll = () => { inhibitedUntil.current = performance.now() + 250; cancelHold(); };
    const down = () => { pressed.current = true; cancelHold(); };
    const up = () => { pressed.current = false; };
    const blur = () => { armed.current = false; pressed.current = false; cancelHold(); };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) blur(); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointerout", leave, { passive: true });
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", blur);
    document.addEventListener("selectionchange", cancelHold);
    const node = root.current;
    node?.addEventListener("scroll", scroll, { capture: true, passive: true });
    node?.addEventListener("wheel", scroll, { passive: true });
    return () => {
      cancelHold();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", blur);
      document.removeEventListener("selectionchange", cancelHold);
      node?.removeEventListener("scroll", scroll, true);
      node?.removeEventListener("wheel", scroll);
    };
  }, [cancelHold, navigate]);

  const closeMap = useCallback(() => setWorld(current => ({ ...current, mode: { kind: "idle" } })), []);
  const openMap = useCallback(() => {
    if (worldRef.current.mode.kind === "travel") return;
    cancelHold(); armed.current = false;
    setWorld(current => ({ ...current, mode: { kind: "map" } }));
  }, [cancelHold]);

  useEffect(() => {
    const modal = dialog.current;
    if (world.mode.kind !== "map" || !modal) return;
    modal.showModal();
    return () => { modal.close(); };
  }, [world.mode]);

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "m" || !event.shiftKey || event.repeat || event.metaKey || event.ctrlKey || event.altKey || (event.target as Element)?.closest("input, textarea, select, [contenteditable=true]")) return;
      event.preventDefault();
      if (worldRef.current.mode.kind === "map") closeMap(); else openMap();
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [closeMap, openMap]);

  useEffect(() => { document.title = `${rooms[world.room].label} — Sameer Jain`; }, [world.room]);

  const traveling = world.mode.kind === "travel";
  const current = rooms[world.room];
  return <AmbientMotionProvider value={!idlePaused}><div ref={root} className={styles.world} data-world-room={world.room} data-world-mode={world.mode.kind} data-reduced-motion={reduced} data-idle-paused={idlePaused}
    style={{ "--room-color": current.color } as CSSProperties}>
    <a href="#room-navigation" className={styles.skip}>Skip to room navigation</a>
    <header className={styles.header} data-no-dwell>
      <a href="/" onClick={event => followLink(event, "entrance")} className={styles.signature} aria-label="Sameer Jain, entrance">sj<span>↗</span></a>
      <span className={styles.location}><span className={styles.locationDot} />{current.label}</span>
      <button ref={mapButton} onClick={openMap} disabled={traveling} className={styles.mapButton} aria-haspopup="dialog" aria-label="Open portfolio map">
        <span className={styles.miniMap} aria-hidden="true">{roomIds.map(id => <i key={id} data-current={id === world.room} style={{ gridColumn: rooms[id].x + 2, gridRow: rooms[id].y + 2 }} />)}</span>
        Map <kbd>⇧ M</kbd>
      </button>
    </header>
    <div className={styles.rooms}>
      {world.visited.map(id => <RoomPanel key={id} id={id} active={world.mode.kind === "idle" && world.room === id} visible={world.room === id || (world.mode.kind === "travel" && world.mode.to === id)} navigate={navigate} />)}
    </div>
    {dwell && neighbor(world.room, dwell) && <DestinationPreview room={neighbor(world.room, dwell)!} direction={dwell} />}
    <nav id="room-navigation" aria-label="Adjacent rooms" className={styles.edges} aria-hidden={traveling} ref={node => { if (node) node.inert = traveling; }}>
      {directions.map(direction => {
        const target = neighbor(world.room, direction);
        return target && <a key={direction} href={roomHref(target)} onClick={event => followLink(event, target)}
          className={`${styles.edge} ${styles[direction]}`} data-edge={direction} data-charging={dwell === direction}
          aria-label={`${rooms[target].edgeLabel}, ${direction}. Hold pointer at the edge or activate to enter.`}>
          <svg className={styles.gateSurface} viewBox={direction === "left" || direction === "right" ? "0 0 100 300" : "0 0 300 100"} preserveAspectRatio="none" aria-hidden="true">
            <path className={styles.gateBody} d={`${gatePaths[direction]} Z`} />
            <path className={styles.gateCharge} d={gatePaths[direction]} pathLength="1" />
          </svg>
          <span className={styles.edgeContent}><span className={styles.edgeArrow} aria-hidden="true">{arrows[direction]}</span><span className={styles.edgeName}>{rooms[target].edgeLabel}</span></span>
        </a>;
      })}
    </nav>
    <p className={styles.srOnly} role="status" aria-live="polite">{!traveling ? `${current.label}. Scroll to explore this room.` : ""}</p>
    <dialog ref={dialog} className={styles.map} aria-labelledby="map-title" onCancel={event => { event.preventDefault(); closeMap(); }} onClick={event => { if (event.target === event.currentTarget) closeMap(); }} onKeyDown={event => {
      if (event.key !== "Tab") return;
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]"));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
      <div className={styles.mapInner}>
        <div className={styles.mapTop}><span>Your bearings</span><button onClick={closeMap} aria-label="Close portfolio map" autoFocus>Close ×</button></div>
        <h2 id="map-title">A small world.<br />A few big questions.</h2>
        <p>Choose a room. Come back whenever you like.</p>
        <div className={styles.mapGrid}>
          {roomIds.map(id => <a key={id} href={roomHref(id)} onClick={event => followLink(event, id)} className={styles.mapNode} aria-current={id === world.room ? "location" : undefined}
            style={{ gridColumn: rooms[id].x + 2, gridRow: rooms[id].y + 2, "--node-color": rooms[id].color } as CSSProperties}>
            <span>{id === world.room ? "You are here" : rooms[id].short}</span><strong>{rooms[id].label}</strong><span aria-hidden="true">{id === "entrance" ? "⊙" : "↗"}</span>
          </a>)}
        </div>
        <p className={styles.mapFoot}>Move to an edge and hold to travel. Or use the room links.<br />Scroll vertically inside each room. <kbd>Esc</kbd> closes this map.</p>
        <button className={styles.motionToggle} onClick={toggleIdle} disabled={reduced} aria-pressed={idlePaused}>
          {reduced ? "Idle motion off · reduced-motion preference" : idlePaused ? "Full background motion" : "Calmer background motion"}
        </button>
      </div>
    </dialog>
    <RoomCreature room={world.room} active={world.mode.kind === "idle"} paused={idlePaused} />
    <LivingCursor room={world.room} active={world.mode.kind === "idle"} paused={idlePaused} />
    <noscript><style>{`.${styles.mapButton}{display:none!important}`}</style><nav className={styles.noScript} aria-label="All rooms">{roomIds.map(id => <a key={id} href={roomHref(id)}>{rooms[id].label}</a>)}</nav></noscript>
  </div></AmbientMotionProvider>;
}
