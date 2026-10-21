import { useState, useEffect } from "react";

export function useIsInView(ref: React.RefObject<HTMLDivElement>) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  // Created in an effect: IntersectionObserver does not exist during SSR.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) =>
      setIsIntersecting(
        entry.isIntersecting || element.getBoundingClientRect().y > 0,
      ),
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref]);
  return isIntersecting;
}
