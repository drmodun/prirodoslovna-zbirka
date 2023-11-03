import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import { SignInForm } from "components/SignInForm/SignInForm";
import classes from "./page.module.scss";

const LoginPage = () => {
  return (
    <QueryClientWrapper>
      <div className={classes.container}>
        <SignInForm />
      </div>
    </QueryClientWrapper>
  );
};

export default LoginPage;
