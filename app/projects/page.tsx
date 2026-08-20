import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import ProjectExplorer from "@/components/ProjectExplorer";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects | Sameer Jain",
  description: "Technical projects in machine learning, computer vision, and quantitative research.",
};

export default function ProjectsPage() {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <SectionHeading
          eyebrow="All Projects"
          title="Technical work"
          description="Filter by category, or browse everything below."
        />
        <div className="mt-12">
          <ProjectExplorer projects={projects} />
        </div>
      </div>
    </section>
  );
}
