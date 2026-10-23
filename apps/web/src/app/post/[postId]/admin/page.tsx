"use client";

import { useParams } from "next/navigation";
import { useGetClientPost } from "@/api/useGetClientPost";
import { PostAsyncWrapper } from "@/utility/wrappers/postAsyncWrapper";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import PostView from "@/views/PostView";
import { Suspense } from "react";

const PostPage = () => {
  const params = useParams<{ postId: string }>();
  const { data, isLoading } = useGetClientPost(params.postId);

  return data && !isLoading && <PostView post={data} />;
};

export default PostPage;
