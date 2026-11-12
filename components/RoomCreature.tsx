"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
import { createPortal } from "react-dom";
import type { RoomId } from "@/data/spatialRooms";
import styles from "./RoomCreature.module.css";

type Eye = { x: number; y: number; rx: number; ry: number; turn: number };
type Resident = { light: string; color: string; shade: string; body: string; seam: string; glint: string; eyes: Eye[] };
const residents: Record<RoomId, Resident> = {
  entrance: {
    light: "#fff7c4", color: "#b9a6ff", shade: "#3541a9",
    body: "M32 202C14 175 27 144 42 128C25 97 51 43 91 45C123 17 161 43 168 76C206 86 219 124 200 151C212 174 203 205 179 210L153 194C166 175 172 159 158 147C141 130 117 130 100 147C82 164 94 186 85 206L61 213Z M101 176C99 157 116 145 132 150C150 154 155 168 147 185L132 199L116 185Z",
    seam: "M46 127C64 107 67 77 94 62M167 78C159 111 176 127 186 143M60 193C55 175 63 154 79 142",
    glint: "M53 89C58 65 73 57 88 58M111 44C128 35 146 45 151 57",
    eyes: [{ x: 92, y: 95, rx: 17, ry: 23, turn: -12 }, { x: 132, y: 91, rx: 14, ry: 19, turn: 11 }],
  },
  mri: {
    light: "#fff1dd", color: "#efb0bc", shade: "#7048a3",
    body: "M119 49C105 28 81 30 70 46C51 39 35 55 38 73C17 82 18 108 32 119C19 134 26 155 44 160C46 181 69 191 88 179C91 192 104 193 111 186L106 208Q120 221 134 207L129 186C143 196 159 187 162 178C185 188 204 173 201 154C221 145 223 123 208 111C221 92 207 71 191 71C194 48 174 35 158 44C143 27 123 35 119 49Z",
    seam: "M119 49C129 67 111 80 123 98C112 116 128 130 118 151C125 169 115 180 120 190M70 47C87 47 94 61 86 72C68 60 52 74 60 88M39 76C43 91 35 101 43 113C48 119 57 118 62 112M68 89C83 77 104 80 105 96M32 122C49 122 51 137 45 149M47 161C61 149 82 151 90 166C94 177 106 175 108 164M158 45C146 49 145 65 155 71C170 58 185 69 181 83M191 73C181 90 201 95 199 109M138 88C151 76 172 84 174 98M207 117C190 114 184 131 194 141M199 155C185 148 175 159 174 167M160 177C155 162 138 159 133 169M113 199L127 199",
    glint: "M50 66C49 53 62 49 69 54M81 44C94 37 105 42 110 52M136 45C145 38 151 45 154 51M182 123C176 136 181 145 187 147M54 167C65 178 78 175 82 171",
    eyes: [{ x: 84, y: 118, rx: 18, ry: 22, turn: -5 }, { x: 153, y: 117, rx: 17, ry: 24, turn: 6 }],
  },
  etf: {
    light: "#fff3c3", color: "#ffac8d", shade: "#8f4aac",
    body: "M18 128Q47 101 55 76L79 76L79 56L103 66Q117 48 131 62L153 52L153 35L178 40L178 24L214 32Q207 77 187 106L220 130Q190 145 157 144L137 165Q146 183 156 193Q166 211 146 216Q130 220 130 204Q143 210 141 199L118 176L100 194L76 184L85 152Q52 155 18 128Z",
    seam: "M18 128L115 137L55 76M79 56L115 137L103 66M153 35L139 119L214 32M187 106L115 137L157 144M85 152L115 137L118 176M46 124L69 124M59 113L80 113M169 75L191 69M161 87L183 81",
    glint: "M33 126L57 88L70 87M87 69L100 76M162 48L177 52L185 36L201 39M145 188Q158 204 149 207",
    eyes: [{ x: 103, y: 112, rx: 15, ry: 20, turn: -9 }, { x: 140, y: 108, rx: 14, ry: 19, turn: 9 }],
  },
  profile: {
    light: "#ffe7f2", color: "#d4b5ff", shade: "#3146b2",
    body: "M26 67Q70 43 120 74Q163 44 214 61L215 176Q170 158 125 187C137 205 154 199 153 215C137 223 125 209 118 198C112 214 94 219 87 210C83 199 107 198 107 188Q67 165 24 185Z",
    seam: "M120 75L118 187M34 78Q75 61 111 83L109 176Q74 156 33 173ZM130 83Q169 60 204 72L205 163Q164 151 129 177ZM44 145Q70 139 96 150M44 155Q70 149 94 159M144 146Q168 137 193 145M145 156Q167 147 191 154M184 58L181 82L212 64",
    glint: "M39 72Q75 57 104 73M133 75Q156 61 178 61M32 164L33 135M198 112L198 150M95 209Q103 209 111 198",
    eyes: [{ x: 78, y: 116, rx: 17, ry: 23, turn: -5 }, { x: 162, y: 112, rx: 16, ry: 22, turn: 7 }],
  },
  contact: {
    light: "#fffbd7", color: "#f0d98d", shade: "#b46b9f",
    body: "M42 92C22 84 13 62 23 42C23 65 49 67 67 62L115 34Q120 31 125 35L171 63C193 68 218 56 218 38C235 65 219 88 196 97L196 171Q162 181 132 174L119 194L108 175Q70 185 42 171Z",
    seam: "M43 94L119 147L196 94M45 166L104 135M193 166L139 135M67 62L119 105L171 63M23 43Q21 83 61 83M217 43Q220 79 179 85M108 175L119 164L132 174",
    glint: "M53 92L53 157M73 66L117 42M129 42L164 65M183 160L149 167M31 65Q41 78 55 75M205 64Q197 77 185 76",
    eyes: [{ x: 97, y: 115, rx: 15, ry: 20, turn: -7 }, { x: 143, y: 112, rx: 17, ry: 22, turn: 8 }],
  },
};

type PointerPosition = { x: number; y: number; known: boolean };
type CreatureSubscriber = { move: () => void; blink: () => void; reset: () => void };
type CreatureInput = { pointer: PointerPosition; subscribers: Set<CreatureSubscriber> };
type CreatureProps = { room: RoomId; active: boolean; paused: boolean };

/** Each surface owns its resident beneath its content, above its painted background. */
function BackgroundResident({ host, room, active, paused, input }: CreatureProps & { host: HTMLElement; input: MutableRefObject<CreatureInput> }) {
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const coordinates = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, "");
  const resident = residents[room];

  useEffect(() => {
    const node = root.current, drawing = svg.current, coordinateSpace = coordinates.current;
    const scroller = host.closest<HTMLElement>("[data-room-scroll]");
    if (!node || !drawing || !coordinateSpace || !scroller) return;
    const fine = matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const headNode = drawing.querySelector<SVGGElement>("[data-creature-head]")!;
    const artNode = drawing.querySelector<SVGGElement>("[data-creature-art]")!;
    const pupils = Array.from(drawing.querySelectorAll<SVGGElement>("[data-creature-eye]"));
    const brows = Array.from(drawing.querySelectorAll<SVGPathElement>("[data-creature-brow]"));
    const eyelids = Array.from(drawing.querySelectorAll<SVGGElement>("[data-creature-click-eye]"));
    const automaticEyes = Array.from(drawing.querySelectorAll<SVGGElement>("[data-creature-auto-eye]"));
    const subscribers = input.current.subscribers;
    let visible = false, enabled = false, disposed = false, needsMeasure = true;
    let focused = document.hasFocus();
    let frame = 0, lastTime = 0, width = 1, height = 1;
    let renderedWidth = 0, renderedHeight = 0, renderedTop = Number.NaN;
    let lastGaze = "", lastBrow = "", lastHead = "";
    let blinkAnimations: Animation[] = [];
    const automaticBlinkTimers = new Set<number>();
    const automaticBlinkAnimations = new Set<Animation>();
    const automaticBlinkPeriod = paused ? 26000 : 17300;
    // Preserve the original linear 43/43.6/44.5% and 81/81.7/82.6% blinks.
    const automaticBlinkWindows = [{ start: .43, end: .445, closeOffset: .4 }, { start: .81, end: .826, closeOffset: .4375 }];
    let automaticBlinkEpoch: number | null = null, automaticBlinkGeneration = 0;
    let inverse: DOMMatrix | null = null;
    let target = { x: 0, y: 0, interest: 0 };
    let eyes = { x: 0, y: 0 }, head = { x: 0, y: 0, interest: 0 };

    function status(key: string, value: string | boolean) {
      const next = String(value);
      if (node!.dataset[key] !== next) node!.dataset[key] = next;
    }
    function updateAim() {
      const pointer = input.current.pointer;
      if (!inverse || !pointer.known) return;
      const point = new DOMPoint(pointer.x, pointer.y).matrixTransform(inverse);
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
      const dx = (point.x - width * .5) / Math.max(1, width * .42);
      const dy = (point.y - height * .43) / Math.max(1, height * .45);
      const length = Math.max(1, Math.hypot(dx, dy));
      target = { x: dx / length, y: dy / length, interest: Math.max(0, 1 - Math.hypot(dx, dy)) };
    }
    function measure() {
      needsMeasure = false;
      const bounds = host.getBoundingClientRect(), viewport = scroller!.getBoundingClientRect();
      width = host.clientWidth; height = scroller!.clientHeight;
      if (!width || !height) { inverse = null; return; }
      const top = viewport.top + scroller!.clientTop - bounds.top - host.clientTop;
      if (top !== renderedTop) { node!.style.top = `${top}px`; renderedTop = top; }
      if (height !== renderedHeight) node!.style.height = `${height}px`;
      if (width !== renderedWidth || height !== renderedHeight) {
        const viewBox = `0 0 ${width} ${height}`;
        drawing!.setAttribute("viewBox", viewBox); coordinateSpace!.setAttribute("viewBox", viewBox);
        const scale = Math.max(width / 240, height / 220) * .96;
        const offsetX = width * .5 - 120 * scale, offsetY = height * .52 - 110 * scale;
        artNode.setAttribute("transform", `translate(${offsetX} ${offsetY}) scale(${scale})`);
        node!.style.setProperty("--creature-scale", String(scale));
        renderedWidth = width; renderedHeight = height;
      }
      // This is measured on scroll/resize, never in the pointer handler.
      // Keep the coordinate SVG outside the composited idle wrapper: idle motion
      // must not change the original, viewport-relative gaze calculation.
      try { inverse = coordinateSpace!.getScreenCTM()?.inverse() ?? null; } catch { inverse = null; }
      updateAim();
    }
    function paint() {
      const gazeStrength = paused ? .55 : 1, headStrength = paused ? .35 : 1;
      const turn = head.x * 4 * headStrength;
      const tx = head.x * 2 * headStrength, ty = (head.y * 1.5 - head.interest * 1.8) * headStrength;
      const headTransform = `translate(${tx} ${ty}) rotate(${turn} 120 110)`;
      const gaze = `translate(${(eyes.x * 6 * gazeStrength).toFixed(3)}px, ${(eyes.y * 6 * gazeStrength).toFixed(3)}px)`;
      const brow = `translateY(${(-head.interest * 2 * headStrength).toFixed(3)}px)`;
      if (headTransform !== lastHead) { headNode.setAttribute("transform", headTransform); lastHead = headTransform; }
      // Scope changing styles to the tiny moving parts instead of invalidating
      // inherited custom properties throughout every full-screen SVG descendant.
      if (gaze !== lastGaze) { pupils.forEach(pupil => { pupil.style.transform = gaze; }); lastGaze = gaze; }
      if (brow !== lastBrow) { brows.forEach(eyebrow => { eyebrow.style.transform = brow; }); lastBrow = brow; }
      status("creatureGaze", `${eyes.x.toFixed(3)},${eyes.y.toFixed(3)}`);
    }
    function cancelBlink() {
      blinkAnimations.forEach(animation => animation.cancel()); blinkAnimations = [];
      status("creatureBlinking", false);
    }
    function cancelAutomaticBlink() {
      automaticBlinkEpoch = null; automaticBlinkGeneration++;
      automaticBlinkTimers.forEach(timer => window.clearTimeout(timer)); automaticBlinkTimers.clear();
      automaticBlinkAnimations.forEach(animation => { animation.onfinish = null; animation.cancel(); }); automaticBlinkAnimations.clear();
    }
    function queueAutomaticBlink(eye: SVGGElement, delay: number, generation: number, after = performance.now()) {
      const epoch = automaticBlinkEpoch;
      if (disposed || !enabled || epoch === null || generation !== automaticBlinkGeneration) return;
      const now = performance.now(), nextTime = Math.max(now, after);
      const cycle = Math.max(0, Math.floor((nextTime - epoch - delay) / automaticBlinkPeriod));
      let cycleStart = epoch + delay + cycle * automaticBlinkPeriod;
      let segment = automaticBlinkWindows.find(candidate => cycleStart + candidate.end * automaticBlinkPeriod > nextTime);
      if (!segment) { cycleStart += automaticBlinkPeriod; segment = automaticBlinkWindows[0]; }
      const start = cycleStart + segment.start * automaticBlinkPeriod;
      const end = cycleStart + segment.end * automaticBlinkPeriod;
      const duration = end - start, closeOffset = segment.closeOffset;
      const timer = window.setTimeout(() => {
        automaticBlinkTimers.delete(timer);
        if (disposed || !enabled || automaticBlinkEpoch === null || generation !== automaticBlinkGeneration) return;
        const elapsed = performance.now() - start;
        // A delayed timer joins the original phase or skips an already-finished blink.
        if (elapsed < duration) {
          const animation = eye.animate([
            { transform: "scaleY(1)", offset: 0 },
            { transform: "scaleY(.08)", offset: closeOffset },
            { transform: "scaleY(1)", offset: 1 },
          ], { duration, easing: "linear" });
          animation.currentTime = Math.max(0, performance.now() - start);
          automaticBlinkAnimations.add(animation);
          animation.onfinish = () => {
            animation.onfinish = null; automaticBlinkAnimations.delete(animation); animation.cancel();
          };
        }
        queueAutomaticBlink(eye, delay, generation, end);
      }, Math.max(0, start - now));
      automaticBlinkTimers.add(timer);
    }
    function startAutomaticBlink() {
      if (disposed || !enabled || automaticBlinkEpoch !== null) return;
      automaticBlinkEpoch = performance.now();
      const generation = ++automaticBlinkGeneration;
      // Only the short closing/opening windows animate SVG; open eyes have no animation.
      automaticEyes.forEach(eye => {
        const delay = Number.parseFloat(eye.style.getPropertyValue("--blink-delay") || "0") * 1000;
        queueAutomaticBlink(eye, delay, generation);
      });
    }
    function blink() {
      if (!enabled) return;
      cancelBlink(); status("creatureBlinking", true);
      // This separate wrapper leaves the automatic blink's phase untouched.
      blinkAnimations = eyelids.map(eyelid => eyelid.animate([
        { transform: "scaleY(1)", offset: 0 },
        { transform: "scaleY(.08)", offset: .36 },
        { transform: "scaleY(.08)", offset: .48 },
        { transform: "scaleY(1)", offset: 1 },
      ], { duration: paused ? 420 : 240, easing: "ease-in-out" }));
      const finalBlink = blinkAnimations[blinkAnimations.length - 1];
      if (finalBlink) finalBlink.onfinish = () => {
        if (blinkAnimations[blinkAnimations.length - 1] !== finalBlink) return;
        blinkAnimations = []; status("creatureBlinking", false);
      };
    }
    function stop() {
      cancelAnimationFrame(frame); frame = 0; lastTime = 0;
      status("creatureRunning", false); status("creatureAwake", false); status("creatureIdleRunning", false);
      cancelBlink(); cancelAutomaticBlink();
    }
    function reset() {
      stop(); target = { x: 0, y: 0, interest: 0 };
      eyes = { x: 0, y: 0 }; head = { x: 0, y: 0, interest: 0 };
      paint();
    }
    function tick(time: number) {
      frame = 0;
      if (disposed || !enabled) return;
      if (needsMeasure) measure();
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 1 / 30) : 1 / 60;
      lastTime = time;
      const quick = 1 - Math.pow(paused ? .85 : .73, dt * 60), slow = 1 - Math.pow(paused ? .95 : .91, dt * 60);
      eyes.x += (target.x - eyes.x) * quick; eyes.y += (target.y - eyes.y) * quick;
      head.x += (target.x - head.x) * slow; head.y += (target.y - head.y) * slow;
      head.interest += (target.interest - head.interest) * slow;
      const unsettled = Math.max(Math.abs(target.x - eyes.x), Math.abs(target.y - eyes.y), Math.abs(target.x - head.x), Math.abs(target.y - head.y), Math.abs(target.interest - head.interest)) > .001;
      if (!unsettled) { eyes = { x: target.x, y: target.y }; head = { ...target }; }
      paint(); status("creatureRunning", unsettled);
      if (unsettled) frame = requestAnimationFrame(tick); else lastTime = 0;
    }
    function schedule() {
      if (!disposed && enabled && !frame) {
        lastTime = 0; status("creatureRunning", true); frame = requestAnimationFrame(tick);
      }
    }
    function move() {
      if (!enabled) return;
      updateAim(); status("creatureAwake", true);
      status("creatureIdleRunning", focused); startAutomaticBlink(); schedule();
    }
    const subscriber: CreatureSubscriber = { move, blink, reset };
    function configure() {
      reset();
      const shown = visible && active && fine.matches && !reduced.matches && !document.hidden;
      enabled = shown && focused;
      status("creatureVisible", shown); status("creatureEnabled", enabled); status("creatureIdleRunning", enabled);
      if (enabled) subscribers.add(subscriber); else subscribers.delete(subscriber);
      needsMeasure = true;
      if (shown) { measure(); paint(); }
      if (enabled && input.current.pointer.known) { status("creatureAwake", true); startAutomaticBlink(); schedule(); }
    }
    function refresh() { needsMeasure = true; if (enabled) schedule(); else if (visible && active && fine.matches && !reduced.matches && !document.hidden) { measure(); paint(); } }
    function blur() { focused = false; configure(); }
    function focus() { focused = true; configure(); }
    // A folded leaf can touch the viewport with zero area before unfolding.
    // Observe a positive-area threshold too, so that first edge contact cannot
    // leave the resident hidden for the rest of the reverse page turn.
    const intersection = new IntersectionObserver(entries => {
      const next = entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0);
      if (next !== visible) { visible = next; configure(); }
    }, { root: scroller, threshold: [0, .001] });
    const observer = new ResizeObserver(refresh);
    intersection.observe(host); observer.observe(host); observer.observe(scroller);
    configure();
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    window.addEventListener("resize", refresh, { passive: true });
    scroller.addEventListener("scroll", refresh, { passive: true });
    document.addEventListener("visibilitychange", configure);
    fine.addEventListener("change", configure); reduced.addEventListener("change", configure);
    return () => {
      disposed = true; stop(); subscribers.delete(subscriber); observer.disconnect(); intersection.disconnect();
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
      window.removeEventListener("resize", refresh); scroller.removeEventListener("scroll", refresh);
      document.removeEventListener("visibilitychange", configure);
      fine.removeEventListener("change", configure); reduced.removeEventListener("change", configure);
    };
  }, [host, room, active, paused, input]);

  return <div ref={root} className={styles.creature} data-room-creature={room} data-active={active} data-paused={paused} data-creature-visible="false" aria-hidden="true"
    style={{ "--creature-ink": resident.shade } as CSSProperties}>
    <div className={styles.idle} data-creature-idle={room}>
    <svg ref={svg} data-creature-drawing viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" focusable="false">
      <defs>
        <linearGradient id={`${uid}-body`} x1="48" y1="40" x2="189" y2="215" gradientUnits="userSpaceOnUse"><stop stopColor={resident.light} stopOpacity=".9" /><stop offset=".43" stopColor={resident.color} stopOpacity=".82" /><stop offset="1" stopColor={resident.shade} stopOpacity=".65" /></linearGradient>
        <linearGradient id={`${uid}-edge`} x1="50" y1="45" x2="185" y2="202" gradientUnits="userSpaceOnUse"><stop stopColor={resident.light} /><stop offset=".42" stopColor={resident.color} /><stop offset="1" stopColor={resident.shade} /></linearGradient>
        <radialGradient id={`${uid}-iris`}><stop stopColor="#173bd3" /><stop offset="1" stopColor="#14234f" /></radialGradient>
      </defs>
      <g data-creature-art>
        <g data-creature-head>
          <path d={resident.body} transform="translate(4 6)" fill={resident.shade} opacity=".12" fillRule="evenodd" />
          <path d={resident.body} fill={`url(#${uid}-body)`} stroke={`url(#${uid}-edge)`} strokeWidth="2.4" fillRule="evenodd" />
          <path d={resident.seam} stroke={resident.shade} strokeOpacity=".5" strokeWidth="1.6" strokeLinecap="round" />
          <path d={resident.glint} stroke={resident.light} strokeWidth="3" strokeOpacity=".8" strokeLinecap="round" />
          {resident.eyes.map((eye, i) => <g key={i} transform={`translate(${eye.x} ${eye.y}) rotate(${eye.turn})`}>
            <path data-creature-brow d={`M${-eye.rx - 1} ${-eye.ry - 7}Q0 ${-eye.ry - 13} ${eye.rx + 1} ${-eye.ry - 7}`} stroke={resident.shade} strokeWidth="2.1" strokeLinecap="round" />
            <g className={styles.clickEye} data-creature-click-eye={i}>
            <g className={styles.eye} data-creature-auto-eye={i} style={{ "--blink-delay": `${i * -1.17}s` } as CSSProperties}>
              <ellipse rx={eye.rx + 1.5} ry={eye.ry + 1.5} fill={resident.shade} fillOpacity=".6" />
              <ellipse rx={eye.rx} ry={eye.ry} fill="#fffbea" />
              <ellipse cx={-eye.rx * .28} cy={-eye.ry * .2} rx={eye.rx * .64} ry={eye.ry * .8} fill="#fff" fillOpacity=".65" />
              <g data-creature-eye={i}>
                <ellipse rx={eye.rx * .42} ry={eye.ry * .43} fill={`url(#${uid}-iris)`} />
                <ellipse rx={eye.rx * .2} ry={eye.ry * .27} fill="#14234f" />
                <circle cx="-1.8" cy="-3.2" r="1.8" fill="#fffbea" />
              </g>
            </g>
            </g>
          </g>)}
        </g>
      </g>
    </svg>
    </div>
    <svg ref={coordinates} data-creature-coordinate-space className={styles.coordinates} viewBox="0 0 1440 900" preserveAspectRatio="none" focusable="false" />
  </div>;
}

/** Portal into isolated backgrounds instead of placing artwork over the portfolio. */
export default function RoomCreature({ room, active, paused }: CreatureProps) {
  const anchor = useRef<HTMLSpanElement>(null);
  const input = useRef<CreatureInput>({ pointer: { x: 0, y: 0, known: false }, subscribers: new Set() });
  const [placement, setPlacement] = useState<{ room: RoomId; hosts: HTMLElement[] }>({ room, hosts: [] });
  useEffect(() => {
    const world = anchor.current?.closest<HTMLElement>("[data-world-room]");
    if (!world) return;
    let observer: MutationObserver | undefined;
    const discover = () => {
      const panel = world.querySelector<HTMLElement>(`[data-panel="${room}"]`);
      if (!panel) return false;
      const hosts = Array.from(panel.querySelectorAll<HTMLElement>("[data-room-surface], article[data-profile-leaf]"))
        .filter(host => !host.hasAttribute("data-profile-stage") && !host.hasAttribute("data-surface-flow"));
      if (!hosts.length) return false;
      setPlacement({ room, hosts }); return true;
    };
    if (!discover()) {
      observer = new MutationObserver(() => { if (discover()) observer?.disconnect(); });
      observer.observe(world, { childList: true, subtree: true });
    }
    return () => observer?.disconnect();
  }, [room]);
  useEffect(() => {
    const current = input.current;
    const record = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      current.pointer.x = event.clientX; current.pointer.y = event.clientY; current.pointer.known = true;
      current.subscribers.forEach(subscriber => subscriber.move());
    };
    const click = (event: MouseEvent) => { if (event.button === 0) current.subscribers.forEach(subscriber => subscriber.blink()); };
    const reset = () => current.subscribers.forEach(subscriber => subscriber.reset());
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) { current.pointer.known = false; reset(); } };
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Tab") reset(); };
    const blur = () => { current.pointer.known = false; };
    window.addEventListener("pointermove", record, { passive: true });
    window.addEventListener("click", click, { passive: true, capture: true });
    window.addEventListener("keydown", keyboard);
    window.addEventListener("pointerout", leave, { passive: true }); window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("pointermove", record); window.removeEventListener("click", click, true);
      window.removeEventListener("keydown", keyboard); window.removeEventListener("pointerout", leave); window.removeEventListener("blur", blur);
    };
  }, []);
  return <><span ref={anchor} className={styles.controller} aria-hidden="true" />{placement.room === room && placement.hosts.map((host, index) => createPortal(<BackgroundResident host={host} room={room} active={active} paused={paused} input={input} />, host, `${room}-${index}`))}</>;
}
