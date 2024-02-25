import { discoverExponats } from "@/api/serverExponats";
import { discoverOrganisations } from "@/api/serverOrganisations";
import { discoverPosts } from "@/api/serverPosts";
import { DiscoverWrapper } from "@/utility/wrappers/discoverWrapper";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import DiscoverPageView from "@/views/DiscoverPageView";
import { tabType } from "@/views/SearchPageView/SearchPageView";

const getTab = (tab: string) => {
  switch (tab) {
    case "organisation":
      return "Organizacije";
    case "exponat":
      return "Eksponati";
    case "post":
      return "Objave";
    default:
      return "Eksponati";
  }
};

const DiscoverPage = async ({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) => {
  const initExponats = await discoverExponats({
    page: 1,
    size: 20,
  });
  const initPosts = await discoverPosts({
    page: 1,
    size: 20,
  });
  const initOrganisations = await discoverOrganisations({
    page: 1,
    size: 20,
  });

  return (
    <DiscoverPageView
      exponats={initExponats}
      initTab={getTab(searchParams?.kind) || "Eksponati"}
      organisations={initOrganisations}
      posts={initPosts}
      query={searchParams}
    />
  );
};

export default DiscoverPage;
