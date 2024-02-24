import { FollowsTable } from "@/views/FollowsTable/FollowsTable";
import { getUserFollowers, getUserFollowing } from "@/api/serverFollows";
import { ShortUserResponse } from "@biosfera/types";
import { UserWrapper } from "@/utility/wrappers/userWrapper";

const getFollowers = async (id: string) => {
  const response = await getUserFollowers(id);
  if (response) {
    return response;
  }
  return [];
};

const getFollowing = async (id: string) => {
  const response = await getUserFollowing(id);
  if (response) {
    return response;
  }
  return [];
};

const FollowsPage = async ({ params, searchParams }: any) => {
  const id = params.userId;
  const firstTab = searchParams?.tab as string;
  console.log(firstTab);
  const followers: ShortUserResponse[] = await getFollowers(id);
  const following: ShortUserResponse[] = await getFollowing(id);

  return (
    <UserWrapper>
      <FollowsTable
        followers={followers}
        firstTab={firstTab}
        following={following}
      />
    </UserWrapper>
  );
};

export default FollowsPage;
