import type { MetadataRoute } from "next";
import { SHAPE_IDS } from "@/lib/shapes";
import { SITE_URL } from "./site";

// Required by output: "export"; the sitemap is written to out/sitemap.xml at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/barcode-tattoo`, changeFrequency: "monthly", priority: 0.8 },
    ...SHAPE_IDS.map((id) => ({
      url: `${SITE_URL}/shape/${id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
