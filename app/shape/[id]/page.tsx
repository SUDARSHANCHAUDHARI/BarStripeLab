import type { Metadata } from "next";
import Link from "next/link";
import { SHAPES, SHAPE_IDS, getShape } from "@/lib/shapes";
import Generator from "../../components/Generator";
import InfoSections from "../../components/InfoSections";
import ShapeThumb from "../../components/ShapeThumb";

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
  const description = `${shape.description} Free shape barcode for EAN-13, EAN-8, UPC-A and Code 128, exported as SVG or PNG.`;
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
    <main className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-lg font-black uppercase text-ink">{shape.label} barcode generator</h1>
        <p className="mt-1 text-muted">
          {shape.description} Your barcode is cut into the {shape.label.toLowerCase()} silhouette
          while the protected band at the bottom keeps it scannable.
        </p>
      </div>
      <Generator initialShape={shape.id} />

      {others.length > 0 && (
        <nav aria-labelledby="more-shapes-title" className="mt-16 space-y-4">
          <h2 id="more-shapes-title" className="text-lg font-black uppercase text-ink">
            More shapes
          </h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {others.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/shape/${s.id}`}
                  className="btn flex min-h-[44px] items-center gap-2 px-2 leading-tight"
                >
                  <ShapeThumb shape={s} className="h-6 w-6 shrink-0" />
                  <span className="min-w-0 break-words">{s.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <InfoSections />
    </main>
  );
}
