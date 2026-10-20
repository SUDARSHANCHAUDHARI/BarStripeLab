import Generator from "./components/Generator";
import InfoSections from "./components/InfoSections";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-lg font-black uppercase text-ink">Barcode art generator</h1>
        <p className="mt-1 text-muted">Turn any barcode into artwork that still scans.</p>
      </div>
      <Generator />
      <InfoSections />
    </main>
  );
}
