"use client";

import { useGetClientPost } from "@/api/useGetClientPost";
import { PostAsyncWrapper } from "@/utility/wrappers/postAsyncWrapper";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import PostView from "@/views/PostView";
import { Suspense } from "react";

const PostPage = ({ params }: { params: any }) => {
  const { data, isLoading } = useGetClientPost(params.postId);

  return data && !isLoading && <PostView post={data} />;
};

export default PostPage;
