import { serverGetOrganisation } from "@/api/serverGetOrganisation";
import { ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./page.module.scss";
import { OrganisationBody } from "@/views/OrganisationBody/OrganisationBody";

const OrganisationPage = async ({ params }: { params: any }) => {
  const organisationInfo: ExtendedOrganisationResponse =
    await serverGetOrganisation(params.organisationId);

  return (
    <div className={classes.container}>
      <OrganisationBody organisation={organisationInfo} />
    </div>
  );
};

export default OrganisationPage;
