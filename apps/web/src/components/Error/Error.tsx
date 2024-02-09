import classes from "./Error.module.scss";

export interface ErrorProps {
  message?: string;
}

export const ErrorText = ({ message }: ErrorProps) => {
  return <span className={classes.error}>{message}</span>;
};
