import type { ReactNode } from "react";

// Primary action row. On phones it sticks to the bottom of the screen so the next step is always in reach.
export default function StepActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 bg-board/95 px-4 py-3 sm:static sm:mx-0 sm:bg-transparent sm:p-0">
      {children}
    </div>
  );
}
