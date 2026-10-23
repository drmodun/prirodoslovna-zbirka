import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import { VerifyUserView } from "@/views/VerifyUserView/VerifyUserView";

const ActivateUserPage = async (props: { params: Promise<any> }) => {
  const params = await props.params;
  return (
    <QueryClientWrapper>
      <VerifyUserView code={params.activationCode} />
    </QueryClientWrapper>
  );
};

export default ActivateUserPage;
