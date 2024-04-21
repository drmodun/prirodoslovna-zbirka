import { summarisePostPrompt, ttsPrompt } from "@/api/AI";
import PostView from "@/views/PostView";
import { PostResponseExtended } from "@biosfera/types";

export const PostAsyncWrapper = async ({
  post,
}: {
  post: PostResponseExtended;
}) => {
  const summary = await summarisePostPrompt(post.title, post.content);
  const audio = await ttsPrompt(post.title + post.content, "post", post.id);

  return <PostView summary={summary} post={post} audio={audio} />;
};
