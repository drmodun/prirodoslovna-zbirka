import { useEffect } from "react";

const BOTTOM_OFFSET = 20;

// Re-subscribes on every render so the handler always sees current state.
export function useOnScrollToBottom(onBottom: () => void) {
  useEffect(() => {
    const handleScrolling = () => {
      const { scrollTop, clientHeight, scrollHeight } =
        document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - BOTTOM_OFFSET) {
        onBottom();
      }
    };
    window.addEventListener("scroll", handleScrolling);
    return () => window.removeEventListener("scroll", handleScrolling);
  });
}
