import Link from "next/link";
import { site } from "@/data/site";

const navLinks = [
  { href: "/#work", label: "Work" },
  { href: "/#profile", label: "Profile" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-base-border bg-base/80 backdrop-blur-xl">
      <nav className="site-shell flex items-center justify-between py-5 md:py-5.5">
        <Link href="/" className="font-display text-xl md:text-2xl font-semibold tracking-tight text-ink transition-colors hover:text-signal">
          Sameer Jain
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="mono-label text-[14px] md:text-[15px] text-ink-muted transition-colors hover:text-signal">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <a
            href={site.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md border border-base-border px-4 py-2 text-sm md:text-[15px] text-ink-muted transition-colors hover:border-signal/50 hover:text-signal sm:inline-block"
          >
            GitHub
          </a>
          <a
            href={site.links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-signal/30 bg-signal/10 px-4 py-2 text-sm md:text-[15px] text-signal transition-colors hover:bg-signal/20"
          >
            Resume
          </a>
        </div>
      </nav>
    </header>
  );
}
