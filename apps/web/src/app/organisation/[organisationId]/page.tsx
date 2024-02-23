import { serverGetOrganisation } from "@/api/serverOrganisation";
import { ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./page.module.scss";
import { OrganisationBody } from "@/views/OrganisationBody/OrganisationBody";
import { UserWrapper } from "@/utility/wrappers/userWrapper";

const OrganisationPage = async ({ params }: { params: any }) => {
  const organisationInfo: ExtendedOrganisationResponse =
    await serverGetOrganisation(params.organisationId);

  return (
    <div className={classes.container}>
      <UserWrapper>
        <OrganisationBody organisation={organisationInfo} />
      </UserWrapper>
    </div>
  );
};

export default OrganisationPage;
