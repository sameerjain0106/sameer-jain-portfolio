"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import styles from "./GrantedRoom.module.css";

const stages = [
  {
    title: "Find the evidence",
    description: "I extracted question-and-answer passages from grant documents and connected each passage to its source. Versioned Parquet files, schema checks, and source hashes let us trace a passage back to the material it came from.",
  },
  {
    title: "Check the edit",
    description: "I integrated Qwen through Ollama to suggest revisions locally. We checked source quotations, word limits, names, dates, and numbers against the underlying material.",
  },
  {
    title: "Give the reviewer the last word",
    description: "Generated changes stayed subject to human review. The team brought grant analytics, opportunity matching, and editing into a React and FastAPI prototype for the AnnieCannons challenge.",
  },
];

/** All three examples are fictional and exclusively illustrate the workflow. */
function ExampleSheet({ step }: { step: number }) {
  return <div className={styles.sheet}>
    <div className={styles.sheetHeader}><span>Illustrative grant file</span><span>{step + 1} / 3</span></div>
    {step === 0 && <>
      <h3>Program record</h3>
      <p className={styles.question}>How many students did the program serve?</p>
      <blockquote>“In June, volunteers led <mark>four workshops</mark> for <mark>24 students</mark>.”</blockquote>
      <p className={styles.annotation}>Source excerpt</p>
    </>}
    {step === 1 && <>
      <h3>Proposed revision</h3>
      <p className={styles.question}>Draft response</p>
      <p className={styles.manuscript}><del>We held a number of workshops that reached students.</del></p>
      <p className={styles.manuscript}><ins>Volunteers led four workshops for 24 students in June.</ins></p>
    </>}
    {step === 2 && <>
      <h3>Reviewer’s copy</h3>
      <p className={styles.question}>Details to verify against the source</p>
      <dl className={styles.checks}><div><dt>Workshops</dt><dd>4</dd></div><div><dt>Students</dt><dd>24</dd></div><div><dt>Month</dt><dd>June</dd></div></dl>
      <p className={styles.reviewNote}>Awaiting human review</p>
    </>}
  </div>;
}

export default function GrantedRoom({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const room = useRef<HTMLDivElement>(null);
  const chapter = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const demo = useRef<HTMLElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!active || !room.current || !chapter.current || !scrollRoot || !frame.current) return;
    const root = room.current;
    const section = chapter.current;
    const panel = scrollRoot;
    const embedded = frame.current;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const steps = [...section.querySelectorAll<HTMLElement>("[data-file-step]")];
    const hero = root.querySelector<HTMLElement>("[data-granted-hero]")!;
    const arrivals = [...root.querySelectorAll<HTMLElement>("[data-granted-arrival]")];
    let arrivalTops: number[] = [];
    let midpoints: number[] = [];
    let demoStart = Infinity;
    let heroEnd = 0;
    let frameStart = Infinity;
    let panelHeight = 0;
    let raf = 0;
    let previousTop = NaN;
    let previousHeight = 0;
    let wasVisible: boolean | undefined;

    function sendViewport(top: number, height: number) {
      const localTop = top - frameStart;
      const visible = localTop < Number(embedded.height) && localTop + height > 0;
      if ((visible && (previousTop !== localTop || previousHeight !== height)) || visible !== wasVisible) {
        embedded.contentWindow?.postMessage({ type: "granted:viewport", top: localTop, height, inset: 76, visible }, "*");
        wasVisible = visible;
        previousTop = localTop;
        previousHeight = height;
      }
    }
    function progress(element: HTMLElement, property: string, raw: number) {
      const value = Math.min(1, Math.max(0, raw)).toFixed(3);
      if (element.style.getPropertyValue(property) !== value) element.style.setProperty(property, value);
    }
    function draw() {
      raf = 0;
      const top = panel.scrollTop;
      const height = panel.clientHeight;
      const readingLine = top + height * .52;
      // Use the outer panel height so reserving space for the return gate cannot
      // change this threshold and repeatedly open and close the bottom strip.
      panel.toggleAttribute("data-granted-demo-reading", top + panelHeight * .85 >= demoStart);
      sendViewport(top, height);
      if (panelHeight && !motion.matches) {
        progress(hero, "--granted-depart", top / (panelHeight * .78));
        // On a short phone the folder can begin below the fold.
        progress(hero, "--granted-folder-exit", (top - Math.max(0, heroEnd - panelHeight)) / (panelHeight * .76));
        for (let i = 0; i < arrivals.length; i++) {
          const start = Math.max(0, arrivalTops[i] - panelHeight * .98);
          progress(arrivals[i], "--granted-arrive", (top - start) / (panelHeight * .38));
        }
      }
      let current = 0;
      for (let i = 1; i < midpoints.length; i++) {
        if (readingLine >= (midpoints[i - 1] + midpoints[i]) / 2) current = i;
      }
      const step = String(current);
      if (root.dataset.step !== step) root.dataset.step = step;
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(draw); }
    function measure() {
      const origin = panel.scrollTop - panel.getBoundingClientRect().top;
      demoStart = demo.current ? origin + demo.current.getBoundingClientRect().top : Infinity;
      heroEnd = origin + hero.getBoundingClientRect().bottom;
      frameStart = origin + embedded.getBoundingClientRect().top;
      panelHeight = panel.parentElement?.clientHeight ?? panel.clientHeight;
      arrivalTops = arrivals.map(element => origin + element.getBoundingClientRect().top);
      midpoints = steps.map(element => {
        const box = element.getBoundingClientRect();
        return origin + box.top + box.height / 2;
      });
      schedule();
    }
    function receive(event: MessageEvent) {
      // Without allow-same-origin the browser gives this exact frame an opaque origin.
      if (event.origin !== "null" || event.source !== embedded.contentWindow || !event.data) return;
      const message = event.data;
      if (message.type === "granted:viewport-request") {
        wasVisible = undefined;
        schedule();
      } else if (message.type === "granted:resize" && Number.isFinite(message.height) && message.height > 0) {
        const height = Math.max(240, Math.min(100000, Math.ceil(message.height)));
        if (embedded.height !== String(height)) embedded.height = String(height);
      } else if (message.type === "granted:scroll" && Number.isFinite(message.top) &&
          message.top >= 0 && message.top <= 100000 && document.activeElement === embedded &&
          !embedded.closest("[inert]")) {
        panel.scrollTo({top: frameStart + Math.min(message.top, embedded.offsetHeight) - 84, behavior:"instant"});
      }
    }
    function enter() {
      wasVisible = undefined;
      measure();
    }
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    resize.observe(panel);
    panel.addEventListener("scroll", schedule, { passive: true });
    panel.addEventListener("spatial:entered", enter);
    motion.addEventListener("change", schedule);
    embedded.addEventListener("load", enter);
    window.addEventListener("message", receive);
    embedded.contentWindow?.postMessage({ type: "granted:measure" }, "*");
    measure();
    return () => {
      resize.disconnect();
      panel.removeEventListener("scroll", schedule);
      panel.removeEventListener("spatial:entered", enter);
      motion.removeEventListener("change", schedule);
      embedded.removeEventListener("load", enter);
      window.removeEventListener("message", receive);
      cancelAnimationFrame(raf);
      panel.removeAttribute("data-granted-demo-reading");
      if (wasVisible) embedded.contentWindow?.postMessage({ type: "granted:viewport", top: 0, height: 0, inset: 76, visible: false }, "*");
    };
  }, [active, scrollRoot]);

  function openFile(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !scrollRoot || !heading.current) return;
    event.preventDefault();
    const layout = heading.current.closest("[data-granted-arrival]") ?? heading.current;
    const top = scrollRoot.scrollTop + layout.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top - 92;
    heading.current.focus({ preventScroll: true });
    scrollRoot.scrollTo({ top, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return <div ref={room} className={styles.room}>
    <section className={styles.hero} data-granted-hero data-scene-color="#ff987f" data-scene-ink="#282136" data-room-surface aria-labelledby="granted-title">
      <header className={styles.heroCopy}>
        <div className={styles.heroTitle}>
          <p className={styles.event}>JPMorgan Chase Data for Good · October 2026</p>
          <h1 id="granted-title" tabIndex={-1} data-room-heading>Granted</h1>
          <p className={styles.intro}>I co-built a grant research and editing tool for AnnieCannons. It helps nonprofit teams find opportunities and check a proposed edit against the source document.</p>
        </div>
        <div className={styles.roomLinks}>
          <a className={styles.fileLink} href="#granted-demo">Try Granted with fictional data <span aria-hidden="true">↓</span></a>
          <a className={styles.fileLink} href="#granted-file" onClick={openFile}>Follow a grant file <span aria-hidden="true">↓</span></a>
        </div>
      </header>
      <figure className={styles.folder}>
        <div className={styles.folderBack} aria-hidden="true" />
        <div className={styles.insert} aria-hidden="true"><i /><i /><i /><i /></div>
        <div className={styles.folderCover}>
          <span className={styles.folderTab}>AnnieCannons</span>
          <span className={styles.fastener} aria-hidden="true" />
          <div className={styles.award}><strong>1st place</strong><span>AnnieCannons challenge</span></div>
        </div>
        <figcaption>JPMorgan Chase Data for Good Hackathon</figcaption>
      </figure>
    </section>
    <section className={styles.caseFile} ref={chapter} data-scene-color="#e5def0" data-scene-ink="#282136" data-room-surface aria-labelledby="granted-file">
      <div data-granted-arrival="case-heading">
        <div className={styles.deskHead}>
          <h2 id="granted-file" ref={heading} tabIndex={-1}>Inside a grant file</h2>
          <p>A fictional excerpt shows how a draft moves through the prototype.</p>
        </div>
      </div>
      <div className={styles.walkthrough} data-granted-arrival="paper-stack">
        <div className={styles.paperStack} aria-hidden="true">{stages.map((stage, index) =>
          <div className={styles.leaf} key={stage.title} data-sheet={index}><ExampleSheet step={index} /></div>
        )}</div>
        <div className={styles.chapters}>{stages.map((stage, index) =>
          <article key={stage.title} data-file-step={index} className={styles.step}>
            <div data-granted-arrival="file-step">
              <div className={styles.stepCopy}>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
                {index === 0 && <dl className={styles.totals}>
                  <div><dt>Grant records</dt><dd>304</dd></div>
                  <div><dt>Documents</dt><dd>254</dd></div>
                  <div><dt>Q&amp;A passages</dt><dd>2,477</dd></div>
                </dl>}
              </div>
              <div className={styles.inlineSheet}><ExampleSheet step={index} /></div>
            </div>
          </article>
        )}</div>
      </div>
    </section>
    <section className={styles.demo} ref={demo} data-scene-color="#f5f3e9" data-scene-ink="#282136" aria-labelledby="granted-demo">
      <div data-granted-arrival="demo-heading">
        <header className={styles.demoHead}>
          <h2 id="granted-demo" tabIndex={-1}>Try Granted</h2>
          <p>Explore the dashboard and grant workbench with fictional applications.</p>
        </header>
      </div>
      <div className={styles.demoMount} data-native-scroll data-scene-paper data-granted-arrival="workbench">
        <iframe ref={frame} src={scrollRoot ? "/demos/granted/index.html" : undefined}
          title="Granted dashboard and grant workbench with fictional data"
          sandbox="allow-scripts allow-forms allow-downloads" allow="clipboard-write"
          data-native-cursor data-no-dwell loading="lazy" height="760"
          onLoad={() => frame.current?.contentWindow?.postMessage({type:"granted:measure"}, "*")} />
      </div>
    </section>
  </div>;
}
