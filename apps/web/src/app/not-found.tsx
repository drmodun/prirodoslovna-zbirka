import classes from "./not-found.module.scss";
import GreenDrop from "./views/GreenDrop/GreenDrop";

const NotFound = () => {
  return (
    <div className={classes.notFound}>
      <GreenDrop />
      <h1>404 - Stranica nije pronađena!</h1>
    </div>
  );
};

export default NotFound;
