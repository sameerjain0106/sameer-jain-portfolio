"use client";

import { useEffect, useRef } from "react";
import styles from "./EntranceTimeline.module.css";

const stops = [
  { date: "College", title: "Georgia Tech", description: "I started studying Industrial Engineering at Georgia Tech, with an interest in statistics and how people make decisions with data.", landmark: "campus", x: 880 },
  { date: "Spring 2025", title: "CS 2316", description: "I took Data Manipulation for Science and Industry and learned to work through a dataset from the raw input to the result.", landmark: "course", x: 1557 },
  { date: "Summer 2025", title: "Back in CS 2316 as a TA", description: "I came back to the same course to help students debug assignments and understand why their code behaved the way it did.", landmark: "teaching", x: 2116 },
  { date: "Fall 2025", title: "Databases", description: "I studied relational databases and how data models and queries shape the systems that use them.", landmark: "database", x: 2761 },
  { date: "Spring 2026", title: "Machine learning coursework", description: "My coursework included 4600, 3803, and other classes in machine learning and language models. My brain tumor MRI project explored classification, clustering, and anomaly detection.", landmark: "research", x: 3417, href: "/?room=mri", link: "Brain tumor MRI project" },
  { date: "Summer 2026", title: "AT&T", description: "I automated ingestion of more than 25 million financial records from Azure SQL into Snowflake and built forecasting workflows.", landmark: "network", x: 4062 },
  { date: "Fall 2026", title: "Senior design and Granted", description: "I started senior design and co-built Granted, a grant research tool that won first place in the AnnieCannons challenge at JPMorgan Chase’s Data for Good hackathon.", landmark: "workshop", x: 4707, href: "/?room=granted", link: "Granted case study" },
  { date: "Spring 2027", title: "Delta Air Lines", description: "Co-op, In-Flight Crew Resources and Insights", landmark: "terminal", x: 5341, upcoming: true },
  { date: "Summer 2027", title: "JPMorganChase", description: "Summer internship", landmark: "tower", x: 5965, upcoming: true },
  { date: "Fall 2027", title: "Delta Air Lines", description: "Co-op, In-Flight Crew Resources and Insights", landmark: "terminalReturn", x: 6588, upcoming: true },
] as const;

type Landmark = (typeof stops)[number]["landmark"];
type TimelineStop = (typeof stops)[number];

const worldWidth = stops[stops.length - 1].x + 880;
const roadHeight = [350, 334, 350, 335, 354, 340, 354, 333, 349, 338];
const viewHeight = 340;
const walkStep = 182;
const lastStop = stops.length - 1;
const walkLength = stops[lastStop].x - stops[0].x;
const clamp = (value: number, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const ease = (t: number) => t * t * (3 - 2 * t);
const road = stops.slice(1).reduce((path, stop, i) => {
  const start = stops[i].x;
  const third = (stop.x - start) / 3;
  return `${path} C${start + third} ${roadHeight[i]}, ${stop.x - third} ${roadHeight[i+1]}, ${stop.x} ${roadHeight[i+1]}`;
}, `M0 ${roadHeight[0]} H${stops[0].x}`) + ` H${worldWidth}`;

function LandmarkArt({ kind }: { kind: Landmark }) {
  switch (kind) {
    case "campus":
      return <g>
        <path d="M-93 18h157l38-20H-55Z" fill="#a4b299" />
        <path d="M-84 13v-83H60v83Z" fill="#cb7b62" />
        <path d="m60-70 23-13v83L60 13Z" fill="#98475b" />
        <path d="m-97-69 84-36L69-68Z" fill="#424778" />
        <path d="M-26 13v-122h40V13Z" fill="#dc997d" />
        <path d="m14-109 16-9V4L14 13Z" fill="#ab5965" />
        <path d="m-34-108 23-34 32 34Z" fill="#424778" />
        <path d="M-12-142v-18l20 4-20 6" stroke="#5b5685" strokeWidth="1.8" fill="#f6c34f" />
        <circle cx="-6" cy="-92" r="9" fill="#fff0d1" stroke="#8c4855" strokeWidth="2" />
        <path d="M-6-97v6l4 2" stroke="#473759" fill="none" strokeWidth="1.5" />
        <path d="M-18 13V-9a12 12 0 0 1 24 0v22M-68-53h12v23h-12Zm25 0h12v23h-12Zm68 0h12v23H25Zm20 0h10v23H45Z" fill="#faf0cd" />
        <path d="M-30 19H15m-48 5h52m-55 5h60" stroke="#8c4958" strokeWidth="2" />
        <path d="M76-6v-40m-164 49v-29" stroke="#796774" strokeWidth="3" />
        <path d="M64-30q-10-14 9-26 21 2 16 23Zm-174 7q-3-14 13-20 16 6 12 20Z" fill="#759e83" />
      </g>;
    case "course":
    case "teaching": {
      const teaching = kind === "teaching";
      return <g>
        <path d="M-101 23v-102l29-16V7L-101 23Z" fill="#a4a5cc" />
        <path d="M-72-95H82V7H-72Z" fill="#d6d4eb" />
        <path d="M-70-81H55v62H-70Z" fill="#6d558d" />
        <rect x="-65" y="-76" width="115" height="51" rx="2" fill="#244b54" />
        <path d="M-51-56h33m-33 9h27m22-9h37m-37 8h28m-77 31h14" fill="none" stroke="#bddeb9" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M-7-65l5 5-5 5m32 16h12m-8 0v4" fill="none" stroke="#ead7a0" strokeWidth="2" strokeLinecap="round" />
        <path d="m-101 23 29-16H81l-18 16Z" fill="#b6b5d9" />
        <path d="M38 12v-24l12-11v25m28 10v-24l13-11v25" fill="none" stroke="#6a6089" strokeWidth="3" />
        <path d="M33-11h45l13-12H49Z" fill={teaching ? "#e7a963" : "#f1d799"} />
        {teaching ? <path d="m55-16 15-3m-21 2 2 4" stroke="#a04148" strokeWidth="2" strokeLinecap="round" /> : <path d="m55-17 6-3 12 1-7 3Z" fill="#ffffff" />}
        <path d="M-62 25v-18l9-8v24m27 2V7l9-8v24" fill="none" stroke="#6a6089" strokeWidth="2.7" />
        <path d="m-65 7 10-8h38l-10 8Z" fill="#f2d280" />
      </g>;
    }
    case "database":
      return <g>
        <path d="M-94 18v-40m165 40v-52M-94-22h31m103-12h31" stroke="#8d91bb" strokeWidth="2" strokeDasharray="4 4" fill="none" />
        <path d="M-55-71v78c0 23 100 23 100 0v-78Z" fill="#839fdf" stroke="#323b77" strokeWidth="1.8" />
        <path d="M-55-41c0 22 100 22 100 0m-100 24c0 22 100 22 100 0m-100 24c0 22 100 22 100 0" stroke="#4f62a1" strokeWidth="1.8" fill="none" />
        <ellipse cx="-5" cy="-71" rx="50" ry="17" fill="#c8d4f0" stroke="#323b77" strokeWidth="1.8" />
        <path d="M-26-70h41m-20-7h23" stroke="#5d70b1" strokeWidth="2" strokeLinecap="round" />
        <path d="M-85-24h25v-18h-25zm138-17h28v-20H53Z" fill="#eaa579" />
        <path d="M-81-35h16m126-17h12m-147 41h8m108-29h8" stroke="#694b7d" strokeWidth="2" strokeLinecap="round" />
      </g>;
    case "research":
      return <g>
        <path d="M-95 22h140l41-24H-54Z" fill="#aeb8bc" />
        <path d="M-84 12v-43H49v43Z" fill="#9ca9ac" />
        <path d="m49-31 31-18v43L49 12Z" fill="#72868e" />
        <path d="m-87-31 28-18H81L50-31Z" fill="#dfeee3" />
        <path d="M-52-45c0-46 63-77 100-36 13 14 14 32 14 43H-52Z" fill="#b5ccd1" stroke="#5f7782" strokeWidth="2" />
        <path d="M-44-41c0-36 23-58 47-58S50-77 50-41Z" fill="#507180" />
        <path d="M-25-43c0-23 10-42 27-42s27 19 27 42Z" fill="#fcf4e1" />
        <path d="M-9-41a12 12 0 1 1 22 0Z" fill="#9a7594" />
        <path d="m-25-38 55-1 32 16-54 4Z" fill="#f4b27a" />
        <path d="M79-92h35v33H79Z" fill="#374876" stroke="#b2bce5" strokeWidth="3" />
        <path d="m83-75 5 5 6-15 6 13 5-6h4m-13 19v18" stroke="#8fe4bf" fill="none" strokeWidth="1.8" />
      </g>;
    case "network":
      return <g>
        <path d="M-90 17v-105h40V17Zm54 0v-116H6V17Zm58 0v-93h41v93Z" fill="#596a9f" />
        <path d="m-50-88 13-8V7l-13 10m56-116 13-8V7L6 17m57-93 13-8V7l-13 10" fill="#394773" />
        <path d="m-90-88 13-8h40l-13 8m14-11 13-8h42L6-99m16 23 13-8h41l-13 8" fill="#a2b0d2" />
        <path d="M-83-72h25m-25 17h25m-25 17h25m-25 17h25m29-64h26m-26 17h26m-26 17h26m-26 17h26m30-29h26m-26 17h26m-26 17h26" stroke="#c8d0eb" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M-81-68h7m-7 17h7m47-30h7m-7 17h7m51 11h7m-7 17h7" stroke="#bdebd7" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M-55 27H55m-73-29 13 7 20-6" stroke="#d48779" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M66-100q10 5 19 0m-19-8q10 5 19 0m-16-8q7 4 14 0" stroke="#6d86c2" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>;
    case "workshop":
      return <g>
        <path d="M-89 21v-80l27-17v81Z" fill="#838ab3" />
        <path d="M-62-76H70v81H-62Z" fill="#aeb2d5" />
        <path d="M-45-64H51v42h-96Z" fill="#fff4d7" stroke="#555776" strokeWidth="2" />
        <path d="M-31-53h22v19h-22Zm41 5h26v12H10Zm-18 4h16m-35-3h12m-12 6h8" stroke="#7782ae" strokeWidth="1.6" fill="none" />
        <path d="m-81 5 34-23H83L52 5Z" fill="#e1a887" />
        <path d="M-81 5H52v10H-81Zm133 0 31-23v10L52 15Z" fill="#a76363" />
        <path d="M-75 14v21m117-21v21m33-45V9" stroke="#704c6e" strokeWidth="3" />
        <path d="m-34-12 18-3 21 5-17 4Z" fill="#fbf0d6" />
        <path d="M25-15v-24h17v24m-13-19h9m-9 7h9" fill="#bdebd7" stroke="#496e7f" strokeWidth="1.7" />
        <path d="M65-58v21m-4-16h8m-8 7h8" stroke="#f3cb74" strokeWidth="2" strokeLinecap="round" />
      </g>;
    case "terminal":
    case "terminalReturn":
      return <g>
        <path d="M-76-51v-46m61 46v-46m-61 30 61-24" stroke="#5d6d88" strokeWidth="3" />
        <g transform="translate(-92 -132)">
          <path d="M0 3 4 0h100v38l-4 4H0Z" fill="#536c82" />
          <rect y="3" width="100" height="37" rx="1.8" fill="#182b49" stroke="#71809a" strokeWidth="1.3" />
          <g transform="translate(9 8)" className={styles.deltaSign}>
            <path d="M12 0 2 21l10-5.4Z" fill="#ae153a" />
            <path d="M12 0v15.6L22 21Z" fill="#ee3759" />
            <path d="M1.2 23.1 12 18l11 5.1 2 4.4H-.8Z" fill="#e52249" />
            <path d="M12 18v9.5H-.8l2-4.4Z" fill="#b11038" />
            <path d="M32 9h3.6q6.3 0 6.3 5.8t-6.3 5.8H32ZM54.7 9h-7.5v11.6h7.5m-7.4-6h6.3M60.3 9v11.6h7.2M68 9h9.6m-4.8 0v11.6m6.4 0L84 9l4.7 11.6m-7.6-4h5.8" fill="none" stroke="#fff9ef" strokeWidth="1.8" strokeLinejoin="round" />
          </g>
        </g>
        <path d="M-103 21h177l33-16H-73Z" fill="#aeb4c8" />
        <path d="M-96-44H71v49H-96Z" fill="#9eb3c5" />
        <path d="M71-44 91-56v49L71 5Z" fill="#6d86a6" />
        <path d="M-102-44-79-57H93L71-44Z" fill="#e1e1e3" />
        <path d="M-86-32H62V-4H-86Z" fill="#4f6b90" />
        <path d="M-61-32v28m31-28v28m31-28v28m31-28v28" stroke="#acc1d2" strokeWidth="2" />
        <path d="m-80-28 16 18m28-18 16 18M9-28l16 18m15-18 16 18" stroke="#a0bccd" strokeWidth="1.7" />
        <g transform={kind === "terminalReturn" ? "translate(17 0)" : "translate(52 -17)"}>
          <g className={kind === "terminalReturn" ? styles.arrivingPlane : styles.departingPlane}>
            <path d="m-46-67 35-2 26-25 7 1-12 23 36-2 8 4-42 6-23 12-7-1 6-10-30-1Z" fill="#e1e7ea" stroke="#4b6082" strokeWidth="1.7" />
            <path d="m-46-67-8-15 5-1 18 15Zm32 1 43-2 10 1-52 4Z" fill="#203654" />
            <path d="m-52-79 11 9-7 1Z" fill="#ef4053" />
          </g>
        </g>
        <path d="M-91 16h13m13 0h13m14 0h13m13 0H1m13 0h13m14 0h13" stroke="#eee5cf" strokeWidth="2.1" />
      </g>;
    case "tower":
      return <g>
        <path d="M-53 19v-118H49V19Z" fill="#acb7d1" />
        <path d="m49-99 21-12V7L49 19Z" fill="#7284ae" />
        <path d="m-53-99 20-12H70L49-99Z" fill="#dce0ea" />
        <path d="M-38-88H34v74h-72Z" fill="#526789" />
        <path d="M-14-88v74m23-74v74m-47-58h72m-72 18h72m-72 17h72m-72 17h72" stroke="#b2cae2" strokeWidth="2" />
        <path d="M-42 0H40v18h-82Zm16-15h48v14h-48Z" fill="#e6e0d4" />
        <path d="M-61 24h119m-126 6H63" stroke="#8d8ea7" strokeWidth="2" />
        <path d="M-15 18V1H9v17" fill="#7789ac" />
        <path d="M-49-101v-24m91 22v-22" stroke="#4d5e72" strokeWidth="3" />
        <path d="M-65-143H58l7-4H-58Z" fill="#f6f2e9" />
        <rect x="-65" y="-143" width="123" height="37" rx="1.5" fill="#f5f1e6" stroke="#718199" strokeWidth="1.5" />
        <path d="m58-143 7-4v36l-7 5Z" fill="#9ba8ba" />
        <g transform="translate(-46 -124) scale(.65)" fill="#1468b6">
          {[0, 90, 180, 270].map(angle => <g key={angle} transform={`rotate(${angle})`}>
            <path className={styles.chaseVane} d="M-8.7-20H8.2L19.4-9H-8.7Z" />
          </g>)}
        </g>
        <text x="-27" y="-120.6" fill="#253247" fontFamily="Georgia, serif" fontSize="11.1" letterSpacing="-.45">JPMorganChase</text>
      </g>;
  }
}

function EntranceMap() {
  return <svg className={styles.art} data-timeline-map viewBox={`${stops[0].x - 500} 112 1000 ${viewHeight}`} aria-hidden="true" focusable="false">
    <defs>
      {stops.map(stop => <g id={`timeline-icon-${stop.landmark}`} key={stop.landmark}><LandmarkArt kind={stop.landmark} /></g>)}
      <pattern id="timeline-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" fill="none" stroke="#747da3" strokeOpacity=".23" /></pattern>
      <pattern id="timeline-cut" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0v9" stroke="#8b8098" strokeOpacity=".23" strokeWidth="2" /></pattern>
    </defs>
    <g transform={`scale(${worldWidth / 3250} 1)`}>
    <g fill="none" stroke="#b8b3cf" strokeWidth="1.3" opacity=".71">
      <path d="M0 168c190-14 270-108 417-30S626 173 738 126s181-53 257 5 238 58 364-12 182-4 286 30 213 50 302-7 211-70 358-13 213 21 365-34 372-1 580 38" />
      <path d="M0 181c191-22 260-96 419-28s209 37 322-12 168-41 252 12 223 63 369-13 184-3 285 27 217 41 305-13 215-59 354-5 208 15 363-39 375 4 581 40" />
      <path d="M0 195c201-23 262-96 418-26s210 38 320-10 171-38 250 10 223 65 375-14 186-3 288 27 216 38 307-15 210-47 348 4 206 8 363-39 371 3 581 36" />
    </g>
    <path d="M-45 341 72 238l3023 1 170 73v78l-141 54H80L-45 415Z" fill="#928bb7" />
    <path d="M-45 359 75 402h3048l142-58v46l-141 54H80L-45 415Z" fill="#a79bc0" />
    <path d="M-45 359 75 402h3048l142-58v46l-141 54H80L-45 415Z" fill="url(#timeline-cut)" />
    <path d="M-45 341 72 238l3023 1 170 73-142 90H75Z" fill="#e7e1ee" />
    <path d="M-45 341 72 238l3023 1 170 73-142 90H75Z" fill="url(#timeline-grid)" />
    <path d="M0 380 77 417h3048l125-50M0 399l81 33h3043l126-48" fill="none" stroke="#a098b4" strokeWidth="1.1" />
    <path d="M75 448h3051" stroke="#a49bb7" strokeWidth="1" strokeDasharray="2 22" />
    </g>
    {stops.slice(1).map((stop, index) => <g key={stop.landmark} transform={`translate(${(stop.x + stops[index].x) / 2} ${266 + index % 3 * 7})`} aria-hidden="true">
      <path d="m-46 11 34-13 45 2 16 9-31 11z" fill="#c3c9c4" />
      <g fill="#89a48f" stroke="#587d72" strokeWidth="1.4">
        <path d="m-16 5 12-36 10 35z" /><path d="m0 8 15-47 12 45z" />
        <path d="M-4-5V9M14-6v17" stroke="#6b6279" strokeWidth="2.4" />
      </g>
    </g>)}
    {stops.map((stop, index) => <g key={stop.landmark} data-timeline-landmark={stop.landmark}
      data-company-station={"upcoming" in stop ? stop.x : undefined} transform={`translate(${stop.x} ${index % 3 === 1 ? 282 : 292})`}>
      <path d="m-118 37 55-43H81l49 21-45 28H-97Z" fill={index < 3 ? "#c8c9df" : index < 7 ? "#b9cec6" : "#c9c9db"} stroke="#7e82a2" strokeWidth="1" />
      <path d="m-114 38 21 10H86l44-28v-5L85 43H-97Z" fill="#8586ac" />
      <path d="M-112-9v36m-6-6h12m226-25v33m-6-6h12" stroke="#8a83a9" strokeWidth="1.4" />
      <use href={`#timeline-icon-${stop.landmark}`} />
    </g>)}
    <path d={road} stroke="#fcf4e1" strokeWidth="15" fill="none" strokeLinecap="round" />
    <path d={road} stroke="#8f89a7" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="1 7" />
    <path d={road} data-timeline-road pathLength="1" stroke="#4c60b5" strokeWidth="3" strokeDasharray="1" strokeDashoffset="1" fill="none" strokeLinecap="round" />
    <g data-timeline-pins fill="#fff3db" stroke="#6c6d9d" strokeWidth="1.5">
      {stops.map((stop, i) => <circle key={stop.landmark} cx={stop.x} cy={roadHeight[i]} r="4" />)}
    </g>
    <g data-timeline-walker transform={`translate(${stops[0].x} 345)`}>
      <ellipse cx="0" cy="1" rx="18" ry="4.5" fill="#222751" opacity=".21" />
      <g data-timeline-person>
        <path data-timeline-far-leg d="M0-21-4-10-4-2h5" stroke="#4c466e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path data-timeline-near-leg d="M4-21 6-11 9-2h5" stroke="#293351" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M-3-40c-8-2-13 2-13 11 0 6 4 10 9 9l5-5Z" fill="#db8c69" stroke="#6b526d" strokeWidth="1.4" />
        <path d="M-8-39c6-5 15-4 18 0l2 17-6 4H-5l-3-9Z" fill="#627bd1" stroke="#323b67" strokeWidth="1.5" />
        <path data-timeline-arm d="M3-37 9-30l8 3" stroke="#b7795f" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M-7-45c0-8 5-13 12-12 8 1 10 7 10 13-2 5-6 7-11 7-6 0-11-2-11-8Z" fill="#bb876a" stroke="#4c3f59" strokeWidth="1.4" />
        <path d="M-8-45c-4-6-1-14 6-15 8-4 16 0 18 6l-3 5-6-4-4 3-4-1-2 6Z" fill="#393451" />
        <path d="M8-46h2m3 0h2" stroke="#30284a" strokeWidth="1.7" strokeLinecap="round" />
      </g>
    </g>
    {stops.slice(1).map((stop,i) => <path key={stop.landmark} transform={`translate(${stop.x - 210} ${365 + i % 3 * 3})`} d="m0 0 4 17 6 2-4-20m6-1 3 15 5 2-3-17" fill="#887697" />)}
  </svg>;
}

export default function EntranceTimeline({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const navigate = useRef<(stop: number) => void>(() => {});

  useEffect(() => {
    const root = scrollRoot;
    const timeline = section.current;
    const runway = track.current;
    const scene = stage.current;
    if (!active || !root || !timeline || !runway || !scene) return;

    const map = scene.querySelector<SVGSVGElement>("[data-timeline-map]")!;
    const route = map.querySelector<SVGPathElement>("[data-timeline-road]")!;
    const walker = map.querySelector<SVGGElement>("[data-timeline-walker]")!;
    const figure = map.querySelector<SVGGElement>("[data-timeline-person]")!;
    const near = figure.querySelector<SVGPathElement>("[data-timeline-near-leg]")!;
    const far = figure.querySelector<SVGPathElement>("[data-timeline-far-leg]")!;
    const arm = figure.querySelector<SVGPathElement>("[data-timeline-arm]")!;
    const signs = Array.from(map.querySelectorAll<SVGGElement>("[data-company-station]"), node => ({
      node, x: Number(node.dataset.companyStation), previous: -1,
    }));
    const labels = Array.from(scene.querySelectorAll<HTMLElement>("[data-timeline-stop]"));
    const buttons = Array.from(scene.querySelectorAll<HTMLButtonElement>("[data-timeline-jump]"));
    // Short windows and reduced motion use the printed edition of the same illustrated stops.
    const animated = matchMedia("(min-height: 551px) and (prefers-reduced-motion: no-preference)");
    let visible = false;
    let dirty = true;
    let raf = 0;
    let lastPaint = -1;
    let selected = -1;
    let start = 0;
    let span = 1;
    let width = 900;

    function measure() {
      const pinTop = parseFloat(getComputedStyle(scene!).top) || 0;
      start = root!.scrollTop + runway!.getBoundingClientRect().top - root!.getBoundingClientRect().top - pinTop;
      span = Math.max(1, runway!.offsetHeight - scene!.offsetHeight);
      width = viewHeight * map.clientWidth / Math.max(1, map.clientHeight);
      dirty = false;
      lastPaint = -1;
    }

    function draw() {
      raf = 0;
      if (!visible || document.hidden || !animated.matches) return;
      if (dirty) measure();
      // The room already supplies wheel momentum. Actual distance scrolled drives the gait and camera.
      const x = stops[0].x + walkLength * clamp((root!.scrollTop - start) / span);
      if (x !== lastPaint) {
        const from = Math.max(0, stops.findIndex(stop => stop.x >= x) - 1);
        const travel = (x - stops[from].x) / (stops[from + 1].x - stops[from].x);
        const y = roadHeight[from] + (roadHeight[from+1] - roadHeight[from]) * ease(travel);
        const camera = clamp(x - width * .5, 0, Math.max(0, worldWidth - width));
        const approach = Math.min(390, width * .48);
        for (const sign of signs) {
          const progress = ease(clamp((x - sign.x + approach) / approach));
          if (progress === sign.previous) continue;
          sign.node.style.setProperty("--landmark-approach", progress.toFixed(4));
          sign.previous = progress;
        }
        map!.setAttribute("viewBox", `${camera.toFixed(2)} 112 ${width.toFixed(2)} ${viewHeight}`);
        route!.setAttribute("stroke-dashoffset", (1 - x / worldWidth).toFixed(5));
        walker!.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
        const swing = Math.sin((x - stops[0].x) * Math.PI * 2 / walkStep);
        figure!.setAttribute("transform", `translate(0 ${(-Math.abs(swing) * 1.2).toFixed(2)})`);
        near!.setAttribute("transform", `rotate(${(swing * 21).toFixed(2)} 4 -23)`);
        far!.setAttribute("transform", `rotate(${(-swing * 21).toFixed(2)} 0 -23)`);
        arm!.setAttribute("transform", `rotate(${(-swing * 14).toFixed(2)} 3 -37)`);

        const visual = from + travel;
        const next = Math.round(visual);
        if (selected !== next) {
          if (selected >= 0) {
            labels[selected].removeAttribute("data-current");
            labels[selected].inert = true;
            buttons[selected].removeAttribute("aria-current");
          }
          selected = next;
          labels[next].dataset.current = "true";
          labels[next].inert = false;
          buttons[next].setAttribute("aria-current", "step");
          scene!.dataset.timelineChapter = stops[next].landmark;
        }
        // Fade the old sign away before the incoming chapter can show through.
        const opacity = ease(clamp((.5 - Math.abs(visual - next)) / .19));
        labels[next].style.opacity = opacity.toFixed(3);
        lastPaint = x;
      }
    }
    function schedule() {
      if (visible && !raf && !document.hidden && animated.matches) raf = requestAnimationFrame(draw);
    }
    function refresh() {
      dirty = true;
      schedule();
    }
    function configure() {
      timeline!.toggleAttribute("data-animated", animated.matches);
      selected = animated.matches ? 0 : -1;
      labels.forEach((label, index) => {
        label.inert = animated.matches && index !== 0;
        label.toggleAttribute("data-current", index === 0);
        label.style.removeProperty("opacity");
      });
      buttons.forEach(button => button.removeAttribute("aria-current"));
      if (animated.matches) buttons[0].setAttribute("aria-current", "step");
      scene!.dataset.timelineChapter = stops[0].landmark;
      refresh();
    }
    navigate.current = index => {
      if (!animated.matches) return;
      if (dirty) measure();
      root.scrollTo({ top: start + span * (stops[index].x - stops[0].x) / walkLength, behavior: "instant" });
      schedule();
    };
    configure();
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) refresh();
      else { cancelAnimationFrame(raf); raf = 0; }
    }, { root, rootMargin: "96px 0px" });
    observer.observe(runway);
    const resize = new ResizeObserver(refresh);
    resize.observe(root);
    resize.observe(scene);
    resize.observe(runway);
    root.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", refresh);
    animated.addEventListener("change", configure);
    return () => {
      observer.disconnect();
      resize.disconnect();
      root.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", refresh);
      animated.removeEventListener("change", configure);
      cancelAnimationFrame(raf);
      navigate.current = () => {};
      // Retain the rendered scene during the outgoing room slide.
    };
  }, [active, scrollRoot]);

  return <section className={styles.timeline} id="timeline" tabIndex={-1} ref={section} data-scene-color="#ebe2ef" aria-labelledby="entrance-timeline-title">
    <h2 id="entrance-timeline-title" data-scene-reveal className={styles.heading}>Experience</h2>
    <div ref={track} className={styles.track}>
      <div className={styles.stage} ref={stage} data-timeline-chapter={stops[0].landmark}>
        <ol className={styles.stops}>
          {stops.map((stop: TimelineStop) => <li className={styles.stop} key={stop.landmark} data-timeline-stop={stop.landmark}>
            <svg className={styles.still} viewBox="-135 -166 270 218" aria-hidden="true" focusable="false">
              <path d="m-127 32 67-34H79l49 22-56 27H-87Z" fill="#d5cfdf"/>
              <use href={`#timeline-icon-${stop.landmark}`}/>
            </svg>
            <div className={styles.date}>{stop.date}{"upcoming" in stop && <span>Upcoming</span>}</div>
            <h3>{stop.title}</h3>
            <p>{stop.description}</p>
            {"href" in stop && <a href={stop.href}>{stop.link}<span aria-hidden="true">&nbsp;↗</span></a>}
          </li>)}
        </ol>
        <div className={styles.viewport}><EntranceMap /></div>
        <nav className={styles.markers} aria-label="Experience timeline milestones">
          {stops.map((stop, index) => <button type="button" key={stop.landmark} data-timeline-jump={stop.landmark}
            aria-label={`${stop.date} · ${stop.title}`} title={`${stop.date} · ${stop.title}`}
            onClick={() => navigate.current(index)}><i aria-hidden="true"/></button>)}
        </nav>
      </div>
    </div>
  </section>;
}
