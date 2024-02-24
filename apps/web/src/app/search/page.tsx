import { getExponats } from "@/api/serverExponats";
import { getOrganisations } from "@/api/serverOrganisations";
import { getPosts } from "@/api/serverPosts";
import { getUsers } from "@/api/serverUsers";
import { SearchPageView } from "@/views/SearchPageView/SearchPageView";
import { Indexable } from "@biosfera/types/src/jsonObjects";

export const tabDictionaryReverse = {
  user: "Korisnici",
  organisation: "Organizacije",
  exponat: "Eksponati",
  post: "Objave",
} as Indexable;
const SearchPage = async ({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) => {
  const initExponats = getExponats({
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

  const initPosts = getPosts({
    attribute: searchParams?.attribute,
    direction: searchParams?.direction,
    exponatId: searchParams?.exponatId,
    exponatName: searchParams?.exponatName,
    title: searchParams?.title,
    userName: searchParams?.userName,
    page: searchParams?.page,
  });

  const initOrganisations = getOrganisations({
    name: searchParams?.name,
    location: searchParams?.location,
    page: searchParams?.page,
  });

  const initUser = getUsers({
    name: searchParams?.name,
    location: searchParams?.location,
    username: searchParams?.username,
    page: searchParams?.page,
  });

  const results = await Promise.all([
    initExponats,
    initPosts,
    initOrganisations,
    initUser,
  ]);

  console.log(
    results[0].length,
    results[1].length,
    results[2].length,
    results[3].length,
    searchParams
  );

  return (
    <div>
      <SearchPageView
        exponats={results[0]}
        posts={results[1]}
        organisations={results[2]}
        query={searchParams}
        initTab={tabDictionaryReverse[searchParams?.kind] || "Eksponati"}
        users={results[3]}
      />
    </div>
  );
};

export default SearchPage;
