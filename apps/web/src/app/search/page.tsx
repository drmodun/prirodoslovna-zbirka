import { getExponats } from "@/api/serverExponats";
import { getOrganisations } from "@/api/serverOrganisations";
import { getPosts } from "@/api/serverPosts";
import { getUsers } from "@/api/serverUsers";
import { getWorks } from "@/api/serverWorks";
import { getGbifWorks } from "@/api/serverLiterature";
import { SearchPageView, tabType } from "@/views/SearchPageView/SearchPageView";
import { GbifQuery } from "@biosfera/types";

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
    case "work":
      return "Radovi";
    case "literature":
      return "Literatura";
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
    genus: searchParams?.genus,
    family: searchParams?.family,
    kingdom: searchParams?.kingdom,
    phylum: searchParams?.phylum,
    order: searchParams?.order,
    species: searchParams?.species,
    class: searchParams?.class,
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
    username:
      searchParams?.name || searchParams?.title || searchParams?.username,
    location: searchParams?.location,
    page: searchParams?.page,
    attribute: searchParams?.attribute,
    direction: searchParams?.direction,
  });

  const initWorks = getWorks({
    title: searchParams?.name || searchParams?.title,
    tags: searchParams?.tags,
    type: searchParams?.type,
    attribute: searchParams?.attribute,
    direction: searchParams?.direction,
  });

  const initLiterature = getGbifWorks({
    q: searchParams?.name || searchParams?.title || searchParams?.q,
    publisher: searchParams?.publisher,
    source: searchParams?.source,
    topics: searchParams?.topics,
    year: searchParams?.year,
    literatureType: searchParams?.literatureType,
  } as GbifQuery);

  const results = await Promise.all([
    initExponats,
    initPosts,
    initOrganisations,
    initUser,
    initWorks,
    initLiterature,
  ]);

  return (
    <div>
      <SearchPageView
        exponats={results[0]}
        posts={results[1]}
        organisations={results[2]}
        query={searchParams}
        initTab={getTab(searchParams?.kind) || ("Eksponati" as tabType)}
        works={results[4] ?? []}
        literature={results[5] ?? []}
        users={results[3]}
      />
    </div>
  );
};

export default SearchPage;
