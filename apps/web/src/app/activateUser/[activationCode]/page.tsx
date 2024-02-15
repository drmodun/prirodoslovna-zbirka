import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import { VerifyUserView } from "@/views/VerifyUserView/VerifyUserView";

const ActivateUserPage = ({ params }: { params: any }) => (
  <QueryClientWrapper>
    <VerifyUserView code={params.activationCode} />
  </QueryClientWrapper>
);

export default ActivateUserPage;
