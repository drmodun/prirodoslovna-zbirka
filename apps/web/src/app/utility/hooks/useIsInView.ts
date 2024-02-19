import { useState, useMemo, useEffect } from "react";

export function useIsInView(ref: React.RefObject<HTMLDivElement>) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setIsIntersecting(
          entry.isIntersecting || ref.current?.getBoundingClientRect().y! > 0
        )
      ),
    [ref.current]
  );

  useEffect(() => {
    console.log(ref.current?.getBoundingClientRect().y);
    observer.observe(ref.current!);

    return () => {
      observer.disconnect();
    };
  }, [ref, observer]);
  return isIntersecting;
}
