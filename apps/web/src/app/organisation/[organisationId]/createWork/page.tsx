import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import classes from "./page.module.scss";
import WorksForm from "components/WorksForm";
import { ExponatFormImage } from "@/views/ExponatFormImage/ExponatFormImage";

const WorkCreate = ({ params }: { params: any }) => (
  <div className={classes.container}>
    <div className={classes.content}>
      <div className={classes.title}>
        <span>Kreiraj novi projekt</span>
      </div>
      <div className={classes.form}>
        <QueryClientWrapper>
          <WorksForm organisationId={params.organisationId} />
        </QueryClientWrapper>
      </div>
    </div>
    <ExponatFormImage />
  </div>
);

export default WorkCreate;
