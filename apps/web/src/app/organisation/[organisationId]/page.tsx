import { serverGetOrganisation } from "@/api/serverGetOrganisation";
import { ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./page.module.scss";
import OrganisationHero from "components/OrganisationHero";

const OrganisationPage = async ({ params }: { params: any }) => {
  const organisationInfo: ExtendedOrganisationResponse =
    await serverGetOrganisation(params.organisationId);

  return (
    <div className={classes.container}>
    </div>
  );
};

export default OrganisationPage;
