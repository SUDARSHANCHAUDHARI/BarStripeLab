import { SHAPES } from "@/lib/shapes";
import Generator from "./components/Generator";
import InfoSections, { ShapeLinks } from "./components/InfoSections";

export default function Page() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
      <div className="pb-10 pt-10 sm:pt-16">
        <h1 className="max-w-[16ch] text-[clamp(40px,5.4vw,68px)] leading-[1.02]">
          Make a barcode that scans at the checkout.
        </h1>
        <p className="mt-4 max-w-[46ch] text-xl text-ink-2">
          Type the number from your packaging or GS1 certificate. We check it as you type, so you know
          it&rsquo;s right before you download.
        </p>
      </div>
      <Generator />
      <InfoSections>
        <ShapeLinks
          id="shapes"
          titleId="shapes-title"
          title={`Give it a shape: ${SHAPES.length} to choose from`}
          shapes={SHAPES}
        />
      </InfoSections>
    </main>
  );
}
