"use client";

import { useEffect, useRef } from "react";
import styles from "./EntranceTimeline.module.css";

const stops = [
  { date: "College", title: "Georgia Tech", description: "I started studying Industrial Engineering at Georgia Tech, with an interest in statistics and how people make decisions with data.", landmark: "campus", x: 265 },
  { date: "Spring 2025", title: "CS 2316", description: "I took Data Manipulation for Science and Industry and learned to work through a dataset from the raw input to the result.", landmark: "course", x: 580 },
  { date: "Summer 2025", title: "Back in CS 2316 as a TA", description: "I came back to the same course to help students debug assignments and understand why their code behaved the way it did.", landmark: "teaching", x: 840 },
  { date: "Fall 2025", title: "Databases", description: "I studied relational databases and how data models and queries shape the systems that use them.", landmark: "database", x: 1140 },
  { date: "Spring 2026", title: "Machine learning coursework", description: "My coursework included 4600, 3803, and other classes in machine learning and language models. My brain tumor MRI project explored classification, clustering, and anomaly detection.", landmark: "research", x: 1445, href: "/?room=mri", link: "Brain tumor MRI project" },
  { date: "Summer 2026", title: "AT&T", description: "I automated ingestion of more than 25 million financial records from Azure SQL into Snowflake and built forecasting workflows.", landmark: "network", x: 1745 },
  { date: "Fall 2026", title: "Senior design and Granted", description: "I started senior design and co-built Granted, a grant research tool that won first place in the AnnieCannons challenge at JPMorgan Chase’s Data for Good hackathon.", landmark: "workshop", x: 2045, href: "/?room=granted", link: "Granted case study" },
  { date: "Spring 2027", title: "Delta Air Lines", description: "I’m planning to join Delta for the spring term.", landmark: "terminal", x: 2340, upcoming: true },
  { date: "Summer 2027", title: "JPMorgan Chase", description: "I’m planning to join JPMorgan Chase for the summer.", landmark: "tower", x: 2630, upcoming: true },
  { date: "Fall 2027", title: "Return to Delta", description: "I’m planning to return to Delta in the fall.", landmark: "terminalReturn", x: 2920, upcoming: true },
] as const;

type Landmark = (typeof stops)[number]["landmark"];
type TimelineStop = (typeof stops)[number];

const worldWidth = 3250;
const viewWidth = 760;
const viewHeight = 500;
const walkStep = 42;

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
        <path d="M-103 21h177l33-16H-73Z" fill="#aeb4c8" />
        <path d="M-96-44H71v49H-96Z" fill="#9eb3c5" />
        <path d="M71-44 91-56v49L71 5Z" fill="#6d86a6" />
        <path d="M-102-44-79-57H93L71-44Z" fill="#e1e1e3" />
        <path d="M-86-32H62V-4H-86Z" fill="#4f6b90" />
        <path d="M-61-32v28m31-28v28m31-28v28m31-28v28" stroke="#acc1d2" strokeWidth="2" />
        <path d="m-80-28 16 18m28-18 16 18M9-28l16 18m15-18 16 18" stroke="#a0bccd" strokeWidth="1.7" />
        <path d="m-46-67 35-2 26-25 7 1-12 23 36-2 8 4-42 6-23 12-7-1 6-10-30-1Z" fill={kind === "terminalReturn" ? "#ce735d" : "#da8a64"} />
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
      </g>;
  }
}

function EntranceMap() {
  const road = "M 128,350 C 243,332 304,374 411,356 S 593,321 706,345 S 900,372 1013,341 S 1227,325 1347,353 S 1565,368 1691,341 S 1897,329 2028,351 S 2252,358 2365,331 S 2578,327 2697,350 S 2893,365 3082,328";

  return <svg className={styles.art} data-timeline-map viewBox={`0 0 ${viewWidth} ${viewHeight}`} aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="timeline-sky" x2="0" y2="1"><stop stopColor="#faf1dc" /><stop offset="1" stopColor="#e7e5f3" /></linearGradient>
      <pattern id="timeline-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" fill="none" stroke="#747da3" strokeOpacity=".23" /></pattern>
      <pattern id="timeline-cut" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0v9" stroke="#8b8098" strokeOpacity=".23" strokeWidth="2" /></pattern>
    </defs>
    <path d={`M0 0H${worldWidth}V500H0Z`} fill="url(#timeline-sky)" />
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
    {stops.map((stop, index) => <g key={stop.landmark} transform={`translate(${stop.x} ${index % 3 === 1 ? 282 : 292})`}>
      <path d="m-118 37 55-43H81l49 21-45 28H-97Z" fill={index < 3 ? "#c8c9df" : index < 7 ? "#b9cec6" : "#c9c9db"} stroke="#7e82a2" strokeWidth="1" />
      <path d="m-114 38 21 10H86l44-28v-5L85 43H-97Z" fill="#8586ac" />
      <path d="M-112-9v36m-6-6h12m226-25v33m-6-6h12" stroke="#8a83a9" strokeWidth="1.4" />
      <LandmarkArt kind={stop.landmark} />
    </g>)}
    <path d={road} stroke="#fcf4e1" strokeWidth="15" fill="none" strokeLinecap="round" />
    <path d={road} stroke="#8f89a7" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="1 7" />
    <path d={road} data-timeline-road pathLength="1" stroke="#4c60b5" strokeWidth="3" strokeDasharray="1" strokeDashoffset="1" fill="none" strokeLinecap="round" />
    <g data-timeline-pins fill="#fff3db" stroke="#6c6d9d" strokeWidth="1.5">
      {stops.map(stop => <circle key={stop.landmark} cx={stop.x} cy="350" r="4" />)}
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
    <g fill="#887697" opacity=".92">
      <path d="m659 356 4 21 7 3-5-26m7 0 4 20 5 2-4-23m1251-8 3 20 7 2-4-24m12 0 4 19 5 2-4-22m409-1 3 24 6 1-3-25m8 0 4 22 5 1-4-23" />
    </g>
  </svg>;
}

function getProgress(offset: number, points: number[]) {
  const last = points.length - 1;
  if (offset >= points[last]) return last;
  const next = points.findIndex(point => point > offset);
  if (next <= 0) return 0;
  return next - 1 + (offset - points[next - 1]) / (points[next] - points[next - 1]);
}

export default function EntranceTimeline({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const section = useRef<HTMLElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const caption = useRef<HTMLSpanElement>(null);
  const date = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const journey = section.current;
    const stage = plate.current;
    const text = list.current;
    if (!active || !scrollRoot || !journey || !stage || !text) return;

    const map = stage.querySelector<SVGSVGElement>("[data-timeline-map]")!;
    const road = map.querySelector<SVGPathElement>("[data-timeline-road]")!;
    const walker = map.querySelector<SVGGElement>("[data-timeline-walker]")!;
    const figure = map.querySelector<SVGGElement>("[data-timeline-person]")!;
    const nearLeg = figure.querySelector<SVGPathElement>("[data-timeline-near-leg]")!;
    const farLeg = figure.querySelector<SVGPathElement>("[data-timeline-far-leg]")!;
    const arm = figure.querySelector<SVGPathElement>("[data-timeline-arm]")!;
    const pins = map.querySelectorAll<SVGCircleElement>("[data-timeline-pins] circle");
    const moments = Array.from(text.querySelectorAll<HTMLElement>("[data-timeline-stop]"));
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-width: 860px)");
    const length = road.getTotalLength();
    const landmarkDistances = stops.map(stop => {
      let left = 0, right = length;
      for (let i = 0; i < 14; i++) {
        const middle = (left + right) / 2;
        if (road.getPointAtLength(middle).x < stop.x) left = middle;
        else right = middle;
      }
      return (left + right) / 2;
    });
    pins.forEach((pin, index) => pin.setAttribute("cy", road.getPointAtLength(landmarkDistances[index]).y.toFixed(2)));
    let frame = 0;
    let visible = false;
    let dirty = true;
    let priorProgress = -1;
    let priorIndex = -1;
    let points: number[] = [];

    function measure() {
      const viewport = scrollRoot!.getBoundingClientRect();
      const cue = compact.matches ? viewport.height * .7 : viewport.height * .54;
      const documentTop = viewport.top - scrollRoot!.scrollTop;
      points = moments.map(moment => moment.getBoundingClientRect().top - documentTop + moment.offsetHeight * .5 - cue);
      dirty = false;
    }

    function draw() {
      frame = 0;
      if (!visible || document.hidden) return;
      if (dirty) measure();
      const progress = motion.matches ? 0 : getProgress(scrollRoot!.scrollTop, points);
      if (progress === priorProgress) return;
      priorProgress = progress;
      const from = Math.floor(progress);
      const fraction = progress - from;
      const distance = landmarkDistances[from] + ((landmarkDistances[from + 1] ?? landmarkDistances[from]) - landmarkDistances[from]) * fraction;
      const point = road.getPointAtLength(distance);
      const width = compact.matches ? 520 : viewWidth;
      const height = compact.matches ? 345 : viewHeight;
      const camera = Math.max(0, Math.min(worldWidth - width, point.x - width * .43));
      const swing = Math.sin((distance - landmarkDistances[0]) * 2 * Math.PI / walkStep);
      const rise = Math.abs(swing) * 2;
      map.setAttribute("viewBox", `${camera.toFixed(2)} ${compact.matches ? 111 : 0} ${width} ${height}`);
      road.setAttribute("stroke-dashoffset", (1 - distance / length).toFixed(4));
      walker.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
      figure.setAttribute("transform", `translate(0 ${(-rise).toFixed(2)})`);
      nearLeg.setAttribute("transform", `rotate(${(swing * 24).toFixed(2)} 4 -23)`);
      farLeg.setAttribute("transform", `rotate(${(-swing * 24).toFixed(2)} 0 -23)`);
      arm.setAttribute("transform", `rotate(${(-swing * 18).toFixed(2)} 3 -37)`);

      const current = Math.round(progress);
      if (current === priorIndex) return;
      if (priorIndex >= 0) moments[priorIndex].removeAttribute("data-current");
      moments[current].setAttribute("data-current", "true");
      stage!.setAttribute("data-timeline-chapter", stops[current].landmark);
      caption.current!.textContent = stops[current].title;
      date.current!.textContent = stops[current].date;
      priorIndex = current;
    }

    function schedule() {
      if (visible && !frame && !document.hidden) frame = requestAnimationFrame(draw);
    }
    function refresh() {
      dirty = true;
      priorProgress = -1;
      schedule();
    }

    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) refresh();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { root: scrollRoot, rootMargin: "100px 0px" });
    observer.observe(journey);
    const resize = new ResizeObserver(refresh);
    resize.observe(text);
    resize.observe(stage);
    resize.observe(scrollRoot);
    scrollRoot.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", refresh);
    motion.addEventListener("change", refresh);
    compact.addEventListener("change", refresh);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      scrollRoot.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", refresh);
      motion.removeEventListener("change", refresh);
      compact.removeEventListener("change", refresh);
    };
  }, [active, scrollRoot]);

  return <section className={styles.timeline} id="timeline" tabIndex={-1} ref={section} aria-labelledby="entrance-timeline-title">
    <div className={styles.heading}>
      <h2 id="entrance-timeline-title">Experience</h2>
      <p>Classes, research, and internships from Georgia Tech onward.</p>
    </div>
    <div className={styles.layout}>
      <div className={styles.sticky} aria-hidden="true">
        <div className={styles.plate} ref={plate}>
          <div className={styles.viewport}><EntranceMap /></div>
          <div className={styles.caption}><span ref={date}>{stops[0].date}</span><span ref={caption}>{stops[0].title}</span></div>
        </div>
      </div>
      <ol ref={list} className={styles.stops}>
        {stops.map((stop: TimelineStop) => <li className={styles.stop} key={stop.landmark} data-timeline-stop={stop.landmark}>
          <div className={styles.stopCopy}>
            <span className={styles.date}>{stop.date}{"upcoming" in stop && <span className={styles.upcoming}>Upcoming</span>}</span>
            <h3>{stop.title}</h3>
            <p>{stop.description}</p>
            {"href" in stop && <a href={stop.href}>{stop.link}</a>}
          </div>
        </li>)}
      </ol>
    </div>
  </section>;
}
