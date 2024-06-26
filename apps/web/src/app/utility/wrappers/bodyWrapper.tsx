import { Inter } from "next/font/google";
import classes from "./bodyWrapper.module.scss";
import clsx from "clsx";
import ReactLenis from "@studio-freight/react-lenis/types";

const inter = Inter({ subsets: ["latin"] });

export const BodyWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={clsx(classes.container, inter.className)}>
      <div id="portal"></div>
      {children}
    </div>
  );
};
