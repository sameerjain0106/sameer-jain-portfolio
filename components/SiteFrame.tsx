"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import JournalMotion from "./JournalMotion";

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const spatial = usePathname() === "/";
  return <>
    {!spatial && <JournalMotion />}
    <div id="top" className={spatial ? undefined : "relative min-h-screen flex flex-col"}>
      {!spatial && <Navbar />}
      <main id="main-content" className={spatial ? undefined : "flex-1"}>{children}</main>
      {!spatial && <Footer />}
    </div>
  </>;
}
