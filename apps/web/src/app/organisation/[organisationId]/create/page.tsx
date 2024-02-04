import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import classes from "./page.module.scss";
import { ExponatForm } from "components/ExponatForm/ExponatForm";
import { RegistrationImage } from "@/views/RegistrationImage/RegistrationImage";

const ExponatCreate = ({ params }: { params: any }) => (
  <div className={classes.container}>
    <div className={classes.form}>
      <QueryClientWrapper>
        <ExponatForm organisationId={params.organisationId} />
      </QueryClientWrapper>
    </div>
    <RegistrationImage />
  </div>
);

export default ExponatCreate;
