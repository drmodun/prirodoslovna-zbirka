import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import classes from "./page.module.scss";
import { ExponatForm } from "components/ExponatForm/ExponatForm";
import { RegistrationImage } from "@/views/RegistrationImage/RegistrationImage";
import { ExponatFormImage } from "@/views/ExponatFormImage/ExponatFormImage";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import { serverGetExponat } from "@/api/serverExponat";
import { serverGetOrganisation } from "@/api/serverOrganisation";
import { AdminCheckingWrapper } from "@/utility/wrappers/adminCheckWrapper";

const ExponatCreate = async ({ params }: { params: any }) => {
  const exponat = await serverGetExponat(params.exponatId);
  return (
    exponat && (
      <div className={classes.container}>
        <div className={classes.content}>
          <div className={classes.title}>
            <span>Uredi sadašnji eksponat</span>
          </div>
          <div className={classes.form}>
            <UserWrapper>
              <AdminCheckingWrapper id={exponat.organizationId}>
                <ExponatForm
                  organisationId={params.organisationId}
                  isEdit
                  values={exponat}
                />
              </AdminCheckingWrapper>
            </UserWrapper>
          </div>
        </div>
        <ExponatFormImage />
      </div>
    )
  );
};

export default ExponatCreate;
