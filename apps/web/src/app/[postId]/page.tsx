import { serverGetPost } from "@/api/serverPost";
import PostView from "@/views/PostView";

const PostPage = async ({ params }: { params: any }) => {
  const post = await serverGetPost(params.postId);
  return <PostView post={post} />;
};

export default PostPage;
