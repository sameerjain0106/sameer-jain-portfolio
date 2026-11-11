import { site } from "@/data/site";
import styles from "./JournalShell.module.css";

export default function ProfileSection() {
  const education = site.education[0];

  return (
    <section id="profile" className={styles.profile} aria-labelledby="profile-title">
      <div className="site-shell">
        <div className={styles.profileHeading} data-reveal>
          <div>
            <p className={styles.kicker}>Profile</p>
            <h2 id="profile-title">Curiosity has<br />a toolkit.</h2>
          </div>
          <p className={styles.profileIntro}>{site.tagline}</p>
        </div>

        <section className={styles.beyondProject} aria-labelledby="beyond-project-title" data-reveal>
          <div className={styles.statsIntro}>
            <h3 id="beyond-project-title">Beyond this project</h3>
            <p>Experience and academic record</p>
          </div>
          <dl className={styles.profileStats}>
            {site.heroStats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}
          </dl>
        </section>

        <div className={styles.profileSpread}>
          <article id="education" className={styles.education} data-reveal>
            <div className={styles.sectionTopline}>
              <p className={styles.kicker}>Academic foundation</p>
              <span className={styles.smallNote}>Atlanta, GA</span>
            </div>
            <h3>{education.school}</h3>
            <p className={styles.degree}>{education.degree}</p>
            <p className={styles.concentration}>{education.concentration}</p>
            <div className={styles.academicFacts}>
              <p className={styles.gpa}>GPA <strong>{education.gpa}</strong></p>
              <div className={styles.academicNotes}>
                <p>Expected {education.period}</p>
                <p>{education.honors}</p>
              </div>
            </div>
            <details className={styles.coursework}>
              <summary>Inside the coursework <span className={styles.plus} aria-hidden="true">+</span></summary>
              <ul>{education.coursework.map((course) => <li key={course}>{course}</li>)}</ul>
              <p>Current study includes Decision &amp; Data Analytics and Constraint Programming.</p>
            </details>
          </article>
          <article id="about" className={styles.toolbox} data-reveal>
            <div className={styles.sectionTopline}>
              <h3 className={styles.kicker}>Working toolkit</h3>
              <span className={styles.smallNote}>Open a field ↓</span>
            </div>
            <div className={styles.skillGroups}>
              {site.skillGroups.map((group, index) => (
                <details className={styles.skillGroup} key={group.label} open={index === 0}>
                  <summary>
                    <span className={styles.skillIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <span>{group.label}</span>
                    <span className={styles.plus} aria-hidden="true">+</span>
                  </summary>
                  <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
                </details>
              ))}
            </div>
            <a href={site.links.resume} target="_blank" rel="noopener noreferrer" className={styles.profileResume}>
              The complete résumé <span aria-hidden="true">↗</span>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
