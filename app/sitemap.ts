import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://7dawn.ai";
  const paths = ["", "/docs", "/download"];
  return ["zh", "en"].flatMap((locale) =>
    paths.map((p) => ({
      url: `${base}/${locale}${p}`,
      lastModified: new Date(),
      alternates: { languages: { en: `${base}/en${p}`, zh: `${base}/zh${p}` } },
    })),
  );
}
