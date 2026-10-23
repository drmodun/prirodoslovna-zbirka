import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import PostForm from "components/PostForm";

const CreatePostPage = async (props: { params: Promise<any> }) => {
  const params = await props.params;
  return (
    <div>
      <QueryClientWrapper>
        <PostForm exponatId={params.exponatId} />
      </QueryClientWrapper>
    </div>
  );
};

export default CreatePostPage;
