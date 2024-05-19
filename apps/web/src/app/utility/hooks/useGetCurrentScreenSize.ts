import { useEffect, useMemo, useState } from "react";

export const useGetCurrentScreenSize = () => {
  const [screenSize, setScreenSize] = useState<number>(window.innerWidth);
  const isMobile = useMemo(() => screenSize < 768, [screenSize]);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { screenSize, isMobile };
};
