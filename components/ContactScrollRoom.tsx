"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/data/site";
import { useAmbientMotion } from "@/lib/useAmbientMotion";
import KineticSculpture from "./KineticSculpture";
import styles from "./ContactScrollRoom.module.css";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };

export default function ContactScrollRoom({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const [mailName, mailDomain] = site.links.email.split("@");
  useAmbientMotion(active, scrollRoot, stage);

  useEffect(() => {
    const section = root.current;
    const view = stage.current;
    if (!section || !view || !scrollRoot || !active) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const opening = view.querySelector<HTMLElement>("[data-contact-opening]")!;
    const letter = view.querySelector<HTMLElement>("[data-contact-letter]")!;
    const bloom = view.querySelector<HTMLElement>("[data-kinetic-occluded]")!;
    let owned: ScrollTrigger | undefined;
    let frame = 0;
    let disposed = false;
    let lastWidth = 0;
    let lastHeight = 0;
    let previousProgress = Number.NaN;
    let openingHidden: boolean | undefined;
    let letterHidden: boolean | undefined;
    let bloomHidden = bloom.dataset.kineticOccluded === "true";
    const published = new Map<string, string>();
    const setVisual = (name: string, value: string) => {
      if (published.get(name) === value) return;
      published.set(name, value);
      section.style.setProperty(name, value);
    };
    const occludeBloom = (hidden: boolean) => {
      if (hidden !== bloomHidden) {
        bloomHidden = hidden;
        bloom.dataset.kineticOccluded = String(hidden);
      }
    };
    const paint = (progress: number) => {
      if (document.hidden || progress === previousProgress) return;
      previousProgress = progress;
      const open = smooth((progress - .09) / .32);
      const lift = smooth((progress - .27) / .35);
      const expand = smooth((progress - .4) / .36);
      const mobile = lastWidth < 760;
      section.dataset.contactProgress = progress.toFixed(4);
      setVisual("--letter-open", String(open));
      setVisual("--letter-expand", String(expand));
      setVisual("--letter-away", String(smooth((progress - .5) / .25)));
      setVisual("--letter-x", `${mobile ? 0 : (1 - expand) * lastWidth * .21}px`);
      setVisual("--letter-y", `${(1 - expand) * lastHeight * (mobile ? .245 : .025) - Math.sin(expand * Math.PI) * lastHeight * .13 - lift * (1 - expand) * lastHeight * .08}px`);
      setVisual("--letter-scale", String((mobile ? .55 : .42) + expand * (mobile ? .45 : .58)));
      const nextOpeningHidden = progress > .23, nextLetterHidden = progress < .75;
      if (nextOpeningHidden !== openingHidden) {
        openingHidden = nextOpeningHidden;
        opening.inert = openingHidden;
        opening.setAttribute("aria-hidden", String(openingHidden));
      }
      if (nextLetterHidden !== letterHidden) {
        letterHidden = nextLetterHidden;
        letter.inert = letterHidden;
        letter.setAttribute("aria-hidden", String(letterHidden));
      }
      occludeBloom(open === 1);
    };
    function configure() {
      frame = 0;
      if (disposed || !scrollRoot!.clientWidth || !scrollRoot!.clientHeight) return;
      owned?.kill();
      owned = undefined;
      lastWidth = scrollRoot!.clientWidth;
      lastHeight = scrollRoot!.clientHeight;
      previousProgress = Number.NaN;
      openingHidden = letterHidden = undefined;
      const enhanced = !reduced.matches && lastHeight >= (lastWidth < 760 ? 610 : 650);
      section!.dataset.contactEnhanced = String(enhanced);
      section!.style.setProperty("--contact-height", `${lastHeight}px`);
      if (!enhanced) {
        occludeBloom(false);
        opening.inert = false; opening.removeAttribute("aria-hidden");
        letter.inert = false; letter.removeAttribute("aria-hidden");
        return;
      }
      owned = ScrollTrigger.create({ trigger: section, scroller: scrollRoot!, start: "top top", end: "bottom bottom",
        onUpdate: self => paint(self.progress), onRefresh: self => paint(self.progress) });
      paint(owned.progress);
    }
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(configure); };
    const observer = new ResizeObserver(() => { if (scrollRoot.clientWidth !== lastWidth || scrollRoot.clientHeight !== lastHeight) schedule(); });
    observer.observe(scrollRoot);
    reduced.addEventListener("change", schedule);
    const visibility = () => { if (!document.hidden) { owned?.refresh(); if (owned) paint(owned.progress); } };
    document.addEventListener("visibilitychange", visibility);
    scrollRoot.addEventListener("spatial:entered", visibility);
    void document.fonts.ready.then(() => { if (!disposed) owned?.refresh(); });
    configure();
    return () => {
      disposed = true; cancelAnimationFrame(frame); owned?.kill(); observer.disconnect();
      reduced.removeEventListener("change", schedule); document.removeEventListener("visibilitychange", visibility);
      scrollRoot.removeEventListener("spatial:entered", visibility);
      // Map overlays pause the room. Keep its current paper geometry and scroll range.
    };
  }, [active, scrollRoot]);

  return <div className={styles.room}>
    <section ref={root} className={styles.journey} data-contact-journey>
      <div ref={stage} className={styles.stage} data-contact-stage data-room-surface data-surface-positioned data-room-heading tabIndex={-1} aria-label="Contact Sameer Jain. Scroll to open the letter.">
        <div className={styles.opening} data-contact-opening>
          <p className={styles.location}>{site.location} / Open a conversation</p>
          <h1>What are<br />you making?</h1>
          <p className={styles.lede}>A machine-learning problem, a project, or an idea you want to talk through.</p>
          <a className={styles.openingEmail} href={`mailto:${site.links.email}`}>{mailName}<br />@{mailDomain}<span aria-hidden="true">↗</span></a>
          <span className={styles.scrollCue}>Scroll to open the letter <span aria-hidden="true">↓</span></span>
        </div>
        <div className={styles.art} ref={art}>
          <div className={styles.bloom} data-ambient-art="contact" data-kinetic-occluded="false" aria-hidden="true"><KineticSculpture kind="bloom" active={active} scrollRoot={scrollRoot} /></div>
          <div className={styles.envelopeBack} aria-hidden="true" />
          <div className={styles.letter} data-contact-letter>
            <div className={styles.letterTop}><span>To a good conversation</span><span className={styles.stamp} aria-hidden="true">SJ</span></div>
            <h2>Let’s<br />connect.</h2>
            <a className={styles.letterEmail} href={`mailto:${site.links.email}`} aria-label={`Email Sameer Jain at ${site.links.email}`}>{mailName}<br />@{mailDomain}<span aria-hidden="true">↗</span></a>
            <p>Start with an interesting question.<br />We can go from there.</p>
            <span className={styles.signature} aria-hidden="true">Sameer.</span>
          </div>
          <div className={styles.envelopeFront} aria-hidden="true"><span>Sameer Jain<br />Atlanta, GA</span><i /></div>
          <div className={styles.flap} aria-hidden="true" />
        </div>
      </div>
    </section>
    <section className={styles.connections} data-room-surface aria-labelledby="contact-elsewhere-title">
      <div className={styles.connectionsTop}><p>Keep in touch</p><h2 id="contact-elsewhere-title">Pick up<br />a thread.</h2><span className={styles.postmark} aria-hidden="true">ATL<br /><i />SJ</span></div>
      <div className={styles.links}>
        <a href={site.links.github} target="_blank" rel="noopener noreferrer"><span className={styles.linkName}>GitHub</span><span>Projects &amp; source code</span><span aria-hidden="true">↗</span></a>
        <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer"><span className={styles.linkName}>LinkedIn</span><span>Professional profile</span><span aria-hidden="true">↗</span></a>
        <a href={site.links.resume} target="_blank" rel="noopener noreferrer"><span className={styles.linkName}>Résumé</span><span>Experience &amp; education / PDF</span><span aria-hidden="true">↗</span></a>
      </div>
      <footer className={styles.footer}><span>{site.name}<br />{site.location}</span><a href={`mailto:${site.links.email}`}>{site.links.email}<span aria-hidden="true">↗</span></a></footer>
    </section>
  </div>;
}
