import ResetPasswordView from "@/views/ResetPasswordView";

const ResetPasswordPage = async (props: { params: Promise<any> }) => {
  const params = await props.params;
  return <ResetPasswordView code={params.token} />;
};

export default ResetPasswordPage;
