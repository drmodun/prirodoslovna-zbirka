import classes from "./bodyWrapper.module.scss";

export const BodyWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className={classes.container}>{children}</div>;
};
