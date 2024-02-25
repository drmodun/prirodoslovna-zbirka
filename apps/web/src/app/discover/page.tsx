import { discoverExponats } from "@/api/serverExponats";
import { discoverOrganisations } from "@/api/serverOrganisations";
import { discoverPosts } from "@/api/serverPosts";
import DiscoverPageView from "@/views/DiscoverPageView";

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
      initTab="Eksponati"
      organisations={initOrganisations}
      posts={initPosts}
      query={searchParams}
    />
  );
};

export default DiscoverPage;
