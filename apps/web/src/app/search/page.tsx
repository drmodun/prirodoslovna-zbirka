import { getExponats } from "@/api/serverExponats";
import { getOrganisations } from "@/api/serverOrganisations";
import { getPosts } from "@/api/serverPosts";
import { getUsers } from "@/api/serverUsers";
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
  });

  const initPosts = await getPosts({
    attribute: searchParams?.attribute,
    direction: searchParams?.direction,
    exponatId: searchParams?.exponatId,
    exponatName: searchParams?.exponatName,
    title: searchParams?.title,
    userName: searchParams?.userName,
  });

  const initOrganisations = await getOrganisations({
    name: searchParams?.name,
    location: searchParams?.location,
  });

  const initUser = await getUsers({
    name: searchParams?.name,
    location: searchParams?.location,
    username: searchParams?.username,
  });
  
};
