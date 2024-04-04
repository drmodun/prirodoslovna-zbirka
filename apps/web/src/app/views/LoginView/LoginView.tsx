import { SignInForm } from "components/SignInForm/SignInForm";
import GreenDrop from "../GreenDrop/GreenDrop";
import classes from "./LoginView.module.scss";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";

const LoginView = () => (
  <div className={classes.container}>
    <div className={classes.drop}>
      <GreenDrop />
    </div>
    <span className={classes.title}>Prijavi se</span>
    <div className={classes.form}>
      <QueryClientWrapper>
        <SignInForm />
      </QueryClientWrapper>
    </div>
  </div>
);

export default LoginView;
