import { getExponats } from "@/api/serverExponats";
import { getOrganisations } from "@/api/serverOrganisations";
import { getPosts } from "@/api/serverPosts";
import { getUsers } from "@/api/serverUsers";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import { SearchPageView } from "@/views/SearchPageView/SearchPageView";
import { useSearchParams } from "next/navigation";

const SearchPage = async ({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) => {
  const initExponats = await getExponats({
    name: searchParams?.name,
    alternateName: searchParams?.alternateName,
    attribute: searchParams?.attribute,
    createdAt: searchParams?.createdAt,
    direction: searchParams?.direction,
    maxFavoriteCount: searchParams?.maxFavoriteCount,
    minFavoriteCount: searchParams?.minFavoriteCount,
    organisationId: searchParams?.organisationId,
    page: searchParams?.page,
  });

  const initPosts = await getPosts({
    attribute: searchParams?.attribute,
    direction: searchParams?.direction,
    exponatId: searchParams?.exponatId,
    exponatName: searchParams?.exponatName,
    title: searchParams?.title,
    userName: searchParams?.userName,
    page: searchParams?.page,
  });

  const initOrganisations = await getOrganisations({
    name: searchParams?.name,
    location: searchParams?.location,
    page: searchParams?.page,
  });

  const initUser = await getUsers({
    name: searchParams?.name,
    location: searchParams?.location,
    username: searchParams?.username,
    page: searchParams?.page,
  });

  return (
    <QueryClientWrapper>
      <SearchPageView
        exponats={initExponats}
        posts={initPosts}
        organisations={initOrganisations}
        query={searchParams}
        initTab="Objave"
        users={initUser}
      />
    </QueryClientWrapper>
  );
};

export default SearchPage;
