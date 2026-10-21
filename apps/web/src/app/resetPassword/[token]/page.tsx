import ResetPasswordView from "@/views/ResetPasswordView";

const ResetPasswordPage = ({ params }: { params: any }) => (
  <ResetPasswordView code={params.token} />
);

export default ResetPasswordPage;
