import { Inter } from "next/font/google";
import classes from "./bodyWrapper.module.scss";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

export const BodyWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={clsx(classes.container, inter.className)}>{children}</div>
  );
};
