import Flow from "./flow/Flow";

interface GeneratorProps {
  // Shape landing pages preselect their own shape.
  initialShape?: string;
  // "art" starts in Art mode instead of Retail-safe (the tattoo page).
  mode?: "retail" | "art";
}

// The page-facing entry point: the Till Check flow.
export default function Generator(props: GeneratorProps) {
  return <Flow {...props} />;
}
