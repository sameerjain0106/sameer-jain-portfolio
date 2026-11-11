import { MetadataRoute } from "next";
import { projects } from "@/data/projects";

const BASE_URL = "https://musteermain.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const projectRoutes = projects.map((p) => ({
    url: `${BASE_URL}/projects/${p.slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: BASE_URL, lastModified: new Date() },
    { url: `${BASE_URL}/projects`, lastModified: new Date() },
    ...projectRoutes,
  ];
}
