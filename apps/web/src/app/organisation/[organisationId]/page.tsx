import { serverGetOrganisation } from "@/api/serverGetOrganisation";
import { ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./page.module.scss";
import OrganisationHero from "components/OrganisationHero";

const OrganisationPage = async ({ params }: { params: any }) => {
  const organisationInfo: ExtendedOrganisationResponse =
    await serverGetOrganisation(params.organisationId);

  console.log(organisationInfo);
  return (
    <div>
      <OrganisationHero organisation={organisationInfo} />
    </div>
  );
};

export default OrganisationPage;
