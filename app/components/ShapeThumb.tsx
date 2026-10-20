import type { ShapeDef } from "@/types";

interface ShapeThumbProps {
  shape: ShapeDef;
  className?: string;
}

// Decorative silhouette that inherits the surrounding text color.
export default function ShapeThumb({ shape, className }: ShapeThumbProps) {
  const [x, y, width, height] = shape.viewBox;

  return (
    <svg
      viewBox={`${x} ${y} ${width} ${height}`}
      className={className}
      fill="currentColor"
      fillRule={shape.fillRule}
      aria-hidden="true"
      focusable="false"
    >
      {shape.paths.map((d, index) => (
        <path key={index} d={d} />
      ))}
    </svg>
  );
}
