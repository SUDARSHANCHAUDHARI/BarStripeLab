"use client";

import { useEffect, useRef, useState } from "react";
import type { ComposedBarcode } from "@/types";
import { NO_SHAPE_ID } from "@/lib/urlState";
import { shapeFor } from "./design";
import { svgDataUri } from "./sizes";

interface RevealStageProps {
  composed: ComposedBarcode | null;
  plain: ComposedBarcode | null;
  // Shape the composed artwork was made with.
  shapeId: string;
  number: string;
}

type Layer = { svg: string; id: string; aspect: string };

const layerOf = (composed: ComposedBarcode, id: string): Layer => ({
  svg: composed.svg,
  id,
  aspect: `${composed.viewBox.width} / ${composed.viewBox.height}`,
});

const SWEEP_MS = 1100;
const SWEEP_EASING = "cubic-bezier(.3,.6,.2,1)";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Starts from the plain barcode. When the shape changes, a laser line travels up the artwork and the new
// shape appears behind it. With reduced motion the new artwork simply replaces the old.
export default function RevealStage({ composed, plain, shapeId, number }: RevealStageProps) {
  const [layers, setLayers] = useState<{ base: Layer | null; incoming: Layer | null }>({ base: null, incoming: null });
  const image = useRef<HTMLImageElement>(null);
  const laser = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!composed || !plain) return;
    setLayers((prev) => {
      const base = prev.base ?? layerOf(plain, NO_SHAPE_ID);
      if (base.id === shapeId || reducedMotion()) return { base: layerOf(composed, shapeId), incoming: null };
      return { base, incoming: layerOf(composed, shapeId) };
    });
  }, [composed, plain, shapeId]);

  const { incoming } = layers;
  useEffect(() => {
    const picture = image.current;
    const line = laser.current;
    if (!incoming || !picture || !line) return;

    const reveal = picture.animate(
      [{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
      { duration: SWEEP_MS, easing: SWEEP_EASING, fill: "forwards" }
    );
    const sweep = line.animate(
      [
        { bottom: "0%", opacity: 1 },
        { bottom: "90%", opacity: 1, offset: 0.9 },
        { bottom: "100%", opacity: 0 },
      ],
      { duration: SWEEP_MS, easing: SWEEP_EASING }
    );
    let cancelled = false;
    reveal.finished
      .then(() => {
        if (!cancelled) setLayers({ base: incoming, incoming: null });
      })
      .catch(() => undefined); // cancelled by a newer choice
    return () => {
      cancelled = true;
      reveal.cancel();
      sweep.cancel();
    };
  }, [incoming]);

  const describe = (id: string) =>
    id === NO_SHAPE_ID ? `Plain barcode ${number}` : `${shapeFor(id).label} barcode ${number}`;

  return (
    <div className="relative grid min-h-[320px] place-items-center overflow-hidden rounded-3xl bg-card p-6 sm:min-h-[440px] sm:p-10" aria-busy={!layers.base}>
      {layers.base ? (
        <div className="grid w-[min(100%,20rem)] items-end">
          {/* Data-URI SVG in a static export: next/image has nothing to optimise. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={svgDataUri(layers.base.svg)}
            alt={describe(layers.base.id)}
            style={{ aspectRatio: layers.base.aspect }}
            className="col-start-1 row-start-1 block w-full self-end"
          />
          {incoming && (
            <div className="relative col-start-1 row-start-1 self-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={image}
                src={svgDataUri(incoming.svg)}
                alt=""
                style={{ aspectRatio: incoming.aspect, clipPath: "inset(100% 0 0 0)" }}
                className="block w-full"
              />
              <span
                ref={laser}
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-6 bottom-0 h-[3px] rounded-full bg-laser opacity-0 shadow-[0_0_14px_3px] shadow-laser/50"
              />
            </div>
          )}
        </div>
      ) : (
        <p className="text-base text-ink-2">Making your barcode...</p>
      )}
    </div>
  );
}
