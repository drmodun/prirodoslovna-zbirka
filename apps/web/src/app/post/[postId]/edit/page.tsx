import { serverGetPost } from "@/api/serverPost";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import { RightCheckingWrapper } from "@/utility/wrappers/rightCheckingWrapper";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import PostView from "@/views/PostView";
import PostForm from "components/PostForm";

const PostPage = async ({ params }: { params: any }) => {
  const post = await serverGetPost(params.postId);
  return (
    <UserWrapper>
      <RightCheckingWrapper author={post.authorId}>
        <PostForm exponatId={post.exponatId} values={post} isEdit />
      </RightCheckingWrapper>
    </UserWrapper>
  );
};

export default PostPage;
