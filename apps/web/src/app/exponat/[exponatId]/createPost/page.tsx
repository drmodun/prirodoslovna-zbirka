import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import PostForm from "components/PostForm";

const CreatePostPage = ({ params }: { params: any }) => (
  <div>
    <QueryClientWrapper>
      <PostForm exponatId={params.exponatId} />
    </QueryClientWrapper>
  </div>
);

export default CreatePostPage;
