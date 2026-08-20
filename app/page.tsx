import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import ProjectExplorer from "@/components/ProjectExplorer";
import ProfileSection from "@/components/ProfileSection";
import { projects } from "@/data/projects";

export default function Home() {
  return (
    <>
      <Hero />

      <section id="work" className="py-10 lg:py-12">
        <div className="site-shell">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Selected Work"
              title="Technical projects"
              description="Methodology, results, limitations, and the actual technologies behind each build — not a marketing summary."
            />
            <div className="hidden items-center gap-3 pb-1 md:flex">
              <span className="h-px w-14 bg-base-border" />
              <span className="mono-label text-[9px] text-ink-faint">01 featured case study</span>
            </div>
          </div>

          <div className="mt-7">
            <ProjectExplorer projects={projects} />
          </div>
        </div>
      </section>

      <ProfileSection />
    </>
  );
}
