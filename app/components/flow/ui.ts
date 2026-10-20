// Shared class strings for the flow. Tailwind sees them here, so they are real utilities.
export const FOCUS =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus";

export const BTN_PRIMARY = `inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 text-lg font-bold text-card hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`;

export const BTN_OUTLINE = `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border-2 border-ink bg-card px-5 py-2 text-base font-bold text-ink hover:bg-board disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:bg-ink aria-pressed:text-card ${FOCUS}`;

export const BTN_QUIET = `inline-flex min-h-[44px] items-center rounded-md text-base text-ink underline underline-offset-4 hover:text-ink-2 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`;

export const FIELD = `min-h-[44px] w-full rounded-xl border-2 border-ink-2 bg-card px-3 py-2 text-base text-ink placeholder:text-ink-2 ${FOCUS}`;

export const LABEL = "mb-1.5 block text-sm font-bold text-ink";

export const HINT = "mt-1 text-sm text-ink-2";

export const CARD = "rounded-3xl bg-card";

// Section heading used by every step; focused programmatically when the step changes.
export const STEP_HEADING =
  "font-display text-[clamp(1.875rem,3.6vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.025em] text-ink focus:outline-none";
