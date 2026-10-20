import type { Metadata } from "next";
import { SHAPES, SHAPE_IDS, getShape } from "@/lib/shapes";
import Generator from "../../components/Generator";
import InfoSections, { ShapeLinks } from "../../components/InfoSections";

interface ShapePageProps {
  params: { id: string };
}

// Only the listed shapes exist; anything else is a 404 in the static export.
export const dynamicParams = false;

export function generateStaticParams() {
  return SHAPE_IDS.map((id) => ({ id }));
}

export function generateMetadata({ params }: ShapePageProps): Metadata {
  const shape = getShape(params.id);
  const title = `${shape.label} Barcode Generator — BarStripeLab`;
  const description = `${shape.description} Free shape barcode for EAN-13, EAN-8, UPC-A and Code 128, exported as SVG, PDF or PNG.`;
  const url = `/shape/${shape.id}`;
  // A page's openGraph and twitter replace the layout's, so the image is repeated here.
  const images = [{ url: "/og-image.png", width: 1200, height: 630, alt: `${shape.label} barcode by BarStripeLab` }];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "BarStripeLab", images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default function ShapePage({ params }: ShapePageProps) {
  const shape = getShape(params.id);
  // Same category first, so the closest alternatives lead the list.
  const others = SHAPES.filter((s) => s.id !== shape.id).sort(
    (a, b) => Number(b.category === shape.category) - Number(a.category === shape.category)
  );

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
      <div className="pb-10 pt-10 sm:pt-16">
        <h1 className="max-w-[20ch] text-[clamp(40px,5.4vw,68px)] leading-[1.02]">
          {shape.label} barcode generator
        </h1>
        <p className="mt-4 max-w-[52ch] text-xl text-ink-2">
          {shape.description} Choose Retail-safe and the bars stay full height under the{" "}
          {shape.label.toLowerCase()}, or Art for a bolder cut.
        </p>
      </div>
      <Generator initialShape={shape.id} />

      <InfoSections>
        {others.length > 0 && (
          <ShapeLinks titleId="more-shapes-title" title="More shapes" shapes={others} />
        )}
      </InfoSections>
    </main>
  );
}
