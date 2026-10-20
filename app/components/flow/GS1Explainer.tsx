import { BTN_OUTLINE } from "./ui";

interface GS1ExplainerProps {
  onUseSample: () => void;
}

// Shown inside a Modal. Plain answer first, the way out second.
export default function GS1Explainer({ onUseSample }: GS1ExplainerProps) {
  return (
    <div className="space-y-4 text-lg">
      <p>
        To sell in shops or on Amazon, you need a number that belongs to your brand. Shops and Amazon check it against
        GS1&apos;s database.
      </p>
      <p>
        In the US, GS1 sells a single number (a GTIN) for $30. Numbers from resellers are often rejected by Amazon, so buy
        yours from GS1 or the GS1 office in your country.
      </p>
      <p>Just testing, or not selling in shops? A sample number lets you try everything now.</p>
      <button type="button" onClick={onUseSample} className={BTN_OUTLINE}>
        Use a sample number
      </button>
    </div>
  );
}
