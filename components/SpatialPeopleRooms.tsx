"use client";

import { useId } from "react";
import { site } from "@/data/site";
import KineticSculpture from "./KineticSculpture";
import styles from "./SpatialPeopleRooms.module.css";

type PeopleRoomProps = { active: boolean; scrollRoot: HTMLElement | null };

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={diagonal ? { transform: "rotate(-45deg)" } : undefined}><path d="M9 24h30M26 11l13 13-13 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function ProfileRoom({ active, scrollRoot }: PeopleRoomProps) {
  const titleId = useId();
  const education = site.education[0];
  const [firstName, ...restName] = site.name.split(" ");

  return <div className={`${styles.room} ${styles.profileRoom}`} data-active={active}>
    <section id="about" className={styles.profileHero} aria-labelledby={titleId} data-room-surface>
      <div className={styles.profileOpening} data-scroll-reveal="copy">
        <p className={styles.roomLabel}>The person behind the work</p>
        <h1 id={titleId} tabIndex={-1} data-room-heading>{firstName}<br />{restName.join(" ")}<span className={styles.nameDot}>.</span></h1>
        <p className={styles.profileLede}>{site.tagline}</p>
        <span className={styles.belowHint}>Scroll through my background <span aria-hidden="true">↓</span></span>
      </div>
      <div className={styles.orbit} aria-label="Experience and academic record" data-scroll-reveal="figure">
        <div className={styles.orbitSculpture} data-ambient-art="profile" aria-hidden="true"><KineticSculpture kind="orbit" active={active} scrollRoot={scrollRoot} /></div>
        <div className={styles.orbitCenter}><span>Georgia Tech</span><strong>Engineering<br />&amp; curiosity.</strong><span>{site.location}</span></div>
        <dl className={styles.orbitFacts}>
          {site.heroStats.map((stat, index) => <div key={stat.label} className={styles[`orbitFact${index}`]}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}
        </dl>
        <p className={styles.orbitCaption}>Experience &amp; academic record</p>
      </div>
    </section>

    <section id="education" className={styles.educationChapter} aria-labelledby={`${titleId}-education`} data-room-surface>
      <div className={styles.chapterHeading} data-scroll-reveal="copy"><p className={styles.roomLabel}>Academic foundation</p><h2 id={`${titleId}-education`}>Thinking in<br />systems.</h2></div>
      <div className={styles.educationBody}>
        <div className={styles.degreeBlock} data-scroll-reveal="group">
          <p>{education.school}</p>
          <h3>{education.degree}</h3>
          <p className={styles.concentration}>{education.concentration}</p>
          <dl className={styles.schoolFacts}><div><dt>GPA</dt><dd>{education.gpa}</dd></div><div><dt>Recognition</dt><dd>{education.honors}</dd></div></dl>
        </div>
        <div className={styles.studyLine} data-scroll-reveal="figure"><span>Working toward</span><strong>{education.period.split(" ")[1]}</strong><span>Expected graduation · {education.period}</span><i aria-hidden="true" /></div>
        <div className={styles.coursework} data-scroll-reveal="group"><h3>Inside the coursework</h3><ul>{education.coursework.map((course) => <li key={course}>{course}</li>)}</ul><p>Current study includes Decision &amp; Data Analytics and Constraint Programming.</p></div>
      </div>
    </section>

    <section className={styles.toolkitChapter} aria-labelledby={`${titleId}-toolkit`} data-room-surface>
      <div className={styles.toolkitIntro} data-scroll-reveal="copy"><p className={styles.roomLabel}>Working toolkit</p><h2 id={`${titleId}-toolkit`}>Ideas need<br />instruments.</h2><p>From image features to data pipelines, these are the tools and methods I work with.</p><a href={site.links.resume} target="_blank" rel="noopener noreferrer">Read the complete résumé <Arrow diagonal /></a></div>
      <div className={styles.toolkitFields}>{site.skillGroups.map((group, index) => <details key={group.label} open={index === 0} data-scroll-reveal="group"><summary>{group.label}<span aria-hidden="true">+</span></summary><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></details>)}</div>
    </section>
  </div>;
}

export function ContactRoom({ active, scrollRoot }: PeopleRoomProps) {
  const titleId = useId();
  const [mailName, mailDomain] = site.links.email.split("@");

  return <div className={`${styles.room} ${styles.contactRoom}`} data-active={active}>
    <section className={styles.contactHero} aria-labelledby={titleId} data-room-surface>
      <div className={styles.contactOpening} data-scroll-reveal="copy">
        <p className={styles.roomLabel}>Sameer Jain / Contact</p>
        <h1 id={titleId} tabIndex={-1} data-room-heading>Let’s<br />connect.</h1>
        <p className={styles.contactLede}>A good problem is a good place to start.</p>
        <a className={styles.emailLink} href={`mailto:${site.links.email}`} aria-label={`Email ${site.name} at ${site.links.email}`}><span>{mailName}<br />@{mailDomain}</span><Arrow diagonal /></a>
        <span className={styles.belowHint}>Scroll for more ways to connect <span aria-hidden="true">↓</span></span>
      </div>
      <div className={styles.signal} aria-hidden="true" data-scroll-reveal="figure"><div className={styles.signalSculpture} data-ambient-art="contact"><KineticSculpture kind="bloom" active={active} scrollRoot={scrollRoot} /></div><span className={styles.signalCore}><svg viewBox="0 0 120 120" fill="none"><path d="m25 61 70-35-25 70-13-28-32-7Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" /><path d="m57 68 38-42" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg></span></div>
      <div className={styles.contactFootnote} data-scroll-reveal="copy"><span>{site.location}</span></div>
    </section>

    <section className={styles.connections} aria-labelledby={`${titleId}-elsewhere`} data-room-surface>
      <div className={styles.connectionsHeading} data-scroll-reveal="copy"><p className={styles.roomLabel}>Elsewhere</p><h2 id={`${titleId}-elsewhere`}>Follow the<br />threads.</h2></div>
      <div className={styles.connectionLinks}>
        <a href={site.links.github} target="_blank" rel="noopener noreferrer" data-scroll-reveal="group"><span><strong>GitHub</strong><span>Projects &amp; source code</span></span><Arrow diagonal /></a>
        <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" data-scroll-reveal="group"><span><strong>LinkedIn</strong><span>Professional profile</span></span><Arrow diagonal /></a>
        <a href={site.links.resume} target="_blank" rel="noopener noreferrer" data-scroll-reveal="group"><span><strong>Résumé</strong><span>Experience &amp; education · PDF</span></span><Arrow diagonal /></a>
      </div>
      <div className={styles.contactColophon} data-scroll-reveal="copy"><span>{site.name}</span><a href={`mailto:${site.links.email}`}>{site.links.email}</a></div>
    </section>
  </div>;
}
