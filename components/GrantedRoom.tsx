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

  useEffect(() => {
    const root = room.current;
    const section = chapter.current;
    if (!active || !root || !scrollRoot || !section) return;
    const steps = [...section.querySelectorAll<HTMLElement>("[data-file-step]")];
    let midpoints: number[] = [];
    let frame = 0;

    function draw() {
      frame = 0;
      const readingLine = scrollRoot!.scrollTop + scrollRoot!.clientHeight * .52;
      let current = 0;
      for (let i = 1; i < midpoints.length; i++) {
        if (readingLine >= (midpoints[i - 1] + midpoints[i]) / 2) current = i;
      }
      const step = String(current);
      if (root!.dataset.step !== step) root!.dataset.step = step;
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
    function measure() {
      const origin = scrollRoot!.scrollTop - scrollRoot!.getBoundingClientRect().top;
      midpoints = steps.map(element => {
        const box = element.getBoundingClientRect();
        return origin + box.top + box.height / 2;
      });
      schedule();
    }
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    resize.observe(scrollRoot);
    scrollRoot.addEventListener("scroll", schedule, { passive: true });
    scrollRoot.addEventListener("spatial:entered", measure);
    measure();
    return () => {
      resize.disconnect();
      scrollRoot.removeEventListener("scroll", schedule);
      scrollRoot.removeEventListener("spatial:entered", measure);
      cancelAnimationFrame(frame);
    };
  }, [active, scrollRoot]);

  function openFile(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !scrollRoot || !heading.current) return;
    event.preventDefault();
    const top = scrollRoot.scrollTop + heading.current.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top - 92;
    heading.current.focus({ preventScroll: true });
    scrollRoot.scrollTo({ top, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return <div ref={room} className={styles.room}>
    <section className={styles.hero} data-room-surface aria-labelledby="granted-title">
      <header className={styles.heroCopy}>
        <p className={styles.event}>JPMorgan Chase Data for Good · October 2026</p>
        <h1 id="granted-title" tabIndex={-1} data-room-heading>Granted</h1>
        <p className={styles.intro}>I co-built a grant research and editing tool for AnnieCannons. It helps nonprofit teams find opportunities and check a proposed edit against the source document.</p>
        <div className={styles.roomLinks}>
          <a className={styles.fileLink} href="https://granted-workspace-sj.vercel.app/" target="_blank" rel="noreferrer">Try Granted <span aria-hidden="true">↗</span></a>
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
    <section className={styles.caseFile} ref={chapter} data-room-surface aria-labelledby="granted-file">
      <div className={styles.deskHead}>
        <h2 id="granted-file" ref={heading} tabIndex={-1}>Inside a grant file</h2>
        <p>A fictional excerpt shows how a draft moves through the prototype.</p>
      </div>
      <div className={styles.walkthrough}>
        <div className={styles.paperStack} aria-hidden="true">{stages.map((stage, index) =>
          <div className={styles.leaf} key={stage.title} data-sheet={index}><ExampleSheet step={index} /></div>
        )}</div>
        <div className={styles.chapters}>{stages.map((stage, index) =>
          <article key={stage.title} data-file-step={index} className={styles.step}>
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
          </article>
        )}</div>
      </div>
    </section>
  </div>;
}
