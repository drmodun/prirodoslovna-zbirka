import { ttsPrompt } from "@/api/AI";
import { serverGetPost } from "@/api/serverPost";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import PostView from "@/views/PostView";
import { PostResponseExtended } from "@biosfera/types";

const PostPage = async ({ params }: { params: any }) => {
  const post = await serverGetPost(params.postId);
  const audio = ttsPrompt(post.title + post.content, "post", post.id);

  return (
    <QueryClientWrapper>
      <PostView post={post} audio={audio} />
    </QueryClientWrapper>
  );
};

export default PostPage;
