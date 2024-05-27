import { getExponats } from "@/api/serverExponats";
import { getOrganisations } from "@/api/serverOrganisations";
import { getPosts } from "@/api/serverPosts";
import { getUsers } from "@/api/serverUsers";
import {
  SearchPageView,
  tabDictionaryType,
  tabType,
} from "@/views/SearchPageView/SearchPageView";
import { Indexable } from "@biosfera/types/src/jsonObjects";

const getTab = (tab: string): tabType => {
  switch (tab) {
    case "user":
      return "Korisnici";
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

const SearchPage = async ({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) => {
  const initExponats = getExponats({
    name: searchParams?.name || searchParams?.title,
    alternateName: searchParams?.alternateName,
    attribute: searchParams?.attribute,
    createdAt: searchParams?.createdAt,
    direction: searchParams?.direction,
    maxFavoriteCount: searchParams?.maxFavoriteCount,
    minFavoriteCount: searchParams?.minFavoriteCount,
    organisationId: searchParams?.organisationId,
    page: searchParams?.page,
  });

  const initPosts = getPosts({
    attribute: searchParams?.attribute,
    direction: searchParams?.direction,
    exponatId: searchParams?.exponatId,
    exponatName: searchParams?.exponatName,
    title: searchParams?.title || searchParams?.name,
    userName: searchParams?.userName,
    page: searchParams?.page,
  });

  const initOrganisations = getOrganisations({
    name: searchParams?.name || searchParams?.title,
    location: searchParams?.location,
    page: searchParams?.page,
    attribute: searchParams?.attribute,
    direction: searchParams?.direction,
  });

  const initUser = getUsers({
    name: searchParams?.name || searchParams?.title,
    location: searchParams?.location,
    username: searchParams?.username,
    page: searchParams?.page,
    attribute: searchParams?.attribute,
    direction: searchParams?.direction,
  });

  const results = await Promise.all([
    initExponats,
    initPosts,
    initOrganisations,
    initUser,
  ]);

  return (
    <div>
      <SearchPageView
        exponats={results[0]}
        posts={results[1]}
        organisations={results[2]}
        query={searchParams}
        initTab={getTab(searchParams?.kind) || ("Eksponati" as tabType)}
        users={results[3]}
      />
    </div>
  );
};

export default SearchPage;
