import { useEffect } from "react";

interface KeyboardShortcuts {
  toggleStyle?: () => void;
  toggleColor?: () => void;
  downloadSVG?: () => void;
  downloadPNG?: () => void;
  share?: () => void;
}

export function useKeyboardShortcuts({
  toggleStyle,
  toggleColor,
  downloadSVG,
  downloadPNG,
  share,
}: KeyboardShortcuts) {
  useEffect(() => {
    // event.code, not event.key: on macOS Option+S types "ß", not "s".
    const actions: Record<string, (() => void) | undefined> = {
      KeyS: toggleStyle,
      KeyC: toggleColor,
      KeyD: downloadSVG,
      KeyP: downloadPNG,
      KeyH: share,
    };

    function handleKeyDown(event: KeyboardEvent) {
      // Ignore if user is typing in a field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const action = event.altKey ? actions[event.code] : undefined;
      if (action) {
        event.preventDefault();
        action();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleStyle, toggleColor, downloadSVG, downloadPNG, share]);
}
