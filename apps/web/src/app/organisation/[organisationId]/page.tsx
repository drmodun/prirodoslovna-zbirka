import { serverGetOrganisation } from "@/api/serverOrganisation";
import { ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./page.module.scss";
import { OrganisationBody } from "@/views/OrganisationBody/OrganisationBody";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import { getWorks } from "@/api/serverWorks";
import { notFound } from "next/navigation";

const organisationCalls = async (organisationId: string) => {
  const organisationInfo = serverGetOrganisation(organisationId);
  const organisationWorks = getWorks({
    organisationId,
  });

  return await Promise.all([organisationInfo, organisationWorks]);
};

const OrganisationPage = async (props: { params: Promise<any> }) => {
  const params = await props.params;
  const [info, works] = await organisationCalls(params.organisationId);
  // Unknown or unapproved: answer 404 with the not-found page.
  if (!info) return notFound();

  return (
    <div className={classes.container}>
      <UserWrapper>
        <OrganisationBody organisation={info} works={works || []} />
      </UserWrapper>
    </div>
  );
};

export default OrganisationPage;
