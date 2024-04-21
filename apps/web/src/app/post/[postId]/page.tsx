import { summarisePostPrompt, ttsPrompt } from "@/api/AI";
import { serverGetPost } from "@/api/serverPost";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import PostView from "@/views/PostView";
import { PostResponseExtended } from "@biosfera/types";
import { Suspense } from "react";

const PostPage = async ({ params }: { params: any }) => {
  const post = await serverGetPost(params.postId);
  const summary = summarisePostPrompt(post.title, post.content);
  const audio = ttsPrompt(post.title + post.content, "post", post.id);

  return (
    <QueryClientWrapper>
      <Suspense fallback={<PostView post={post} />}>
        <PostView summary={summary} post={post} audio={audio} />
      </Suspense>
    </QueryClientWrapper>
  );
};

export default PostPage;
