import { serverGetPost } from "@/api/serverPost";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import PostView from "@/views/PostView";

const PostPage = async ({ params }: { params: any }) => {
  const post = await serverGetPost(params.postId);
  return (
  <QueryClientWrapper>
    <PostView post={post} />
  </QueryClientWrapper>
  );
};

export default PostPage;
