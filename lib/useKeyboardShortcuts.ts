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
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore if user is typing in input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Alt + S = Style
      if (event.altKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        toggleStyle?.();
      }

      // Alt + C = Color
      if (event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        toggleColor?.();
      }

      // Alt + D = Download SVG
      if (event.altKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        downloadSVG?.();
      }

      // Alt + P = PNG
      if (event.altKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        downloadPNG?.();
      }

      // Alt + H = Share
      if (event.altKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        share?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleStyle, toggleColor, downloadSVG, downloadPNG, share]);
}
