import { site } from "@/data/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-base-border bg-base-panel/35">
      <div className="site-shell flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between md:py-7">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[17px] md:text-[18px]">
          <span className="mono-label text-[13px] md:text-[14px] text-signal">Contact</span>
          <a href={`mailto:${site.links.email}`} className="text-ink-muted transition-colors hover:text-signal">
            {site.links.email}
          </a>
          <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="text-ink-muted transition-colors hover:text-signal">
            GitHub
          </a>
          <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-ink-muted transition-colors hover:text-signal">
            LinkedIn
          </a>
          <a href={site.links.resume} target="_blank" rel="noopener noreferrer" className="text-ink-muted transition-colors hover:text-signal">
            Resume
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[13px] md:text-[14px] text-ink-faint">
          <span>{site.location}</span>
          <span className="hidden h-4 w-px bg-base-border md:block" />
          <span>© {year} {site.name}</span>
        </div>
      </div>
    </footer>
  );
}
