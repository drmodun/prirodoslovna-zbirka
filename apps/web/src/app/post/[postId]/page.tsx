import { summarisePostPrompt, ttsPrompt } from "@/api/AI";
import { serverGetPost } from "@/api/serverPost";
import { PostAsyncWrapper } from "@/utility/wrappers/postAsyncWrapper";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import PostView from "@/views/PostView";
import { PostResponseExtended } from "@biosfera/types";
import { Suspense } from "react";

const PostPage = async ({ params }: { params: any }) => {
  const post = await serverGetPost(params.postId);

  return (
    <QueryClientWrapper>
      <Suspense fallback={<PostView post={post} />}>
        <PostAsyncWrapper post={post} />
      </Suspense>
    </QueryClientWrapper>
  );
};

export default PostPage;
