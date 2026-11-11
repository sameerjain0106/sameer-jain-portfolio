import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://sameer-jain-portfolio-sandy.vercel.app/sitemap.xml",
  };
}
