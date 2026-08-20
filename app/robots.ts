import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    // TODO: replace with your real deployed domain once you have one
    sitemap: "https://your-domain.vercel.app/sitemap.xml",
  };
}
