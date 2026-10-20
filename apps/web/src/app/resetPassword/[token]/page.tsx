import ResetPasswordView from "@/views/ResetPasswordView";

const ResetPasswordPage = ({ params }: { params: any }) => (
  <ResetPasswordView code={params.activationCode} />
);

export default ResetPasswordPage;
