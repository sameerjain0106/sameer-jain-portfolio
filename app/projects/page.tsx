import type { Metadata } from "next";
import ProjectExplorer from "@/components/ProjectExplorer";
import { projects } from "@/data/projects";
import styles from "@/components/Journal.module.css";

export const metadata: Metadata = {
  title: "Projects | Sameer Jain",
  description: "Technical projects in machine learning, computer vision, and quantitative research.",
};

export default function ProjectsPage() {
  return <div className={styles.journal}><section className={styles.archivePage}>
    <span className={styles.sectionLabel}>The research archive</span>
    <h1>Questions, tested.</h1>
    <p>Browse by field. Open a case study for the full methodology, results, limitations, and source material.</p>
    <div><ProjectExplorer projects={projects} /></div>
  </section></div>;
}
