import { useResetPassword } from "@/api/useResetPassword";
import { zodResolver } from "@hookform/resolvers/zod";
import BaseButton from "components/BaseButton";
import Input from "components/Input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import password from "assets/images/password.svg";
import classes from "./ResetPasswordForm.module.scss";
export interface ResetPaswordFormProps {
  code: string;
}

export const ResetPaswordForm: React.FC<ResetPaswordFormProps> = ({ code }) => {
  const schema = z
    .object({
      password: z
        .string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/,
          "Lozinka mora imati najmanje 8 znakova, jedno veliko slovo, jedno malo slovo, jedan broj i jedan specijalni znak"
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Lozinke se ne poklapaju",
      path: ["confirmPassword"],
    });
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const { mutateAsync } = useResetPassword();

  const onSubmit = async (data: any) => {
    await mutateAsync({ userActivationCode: code, newPassword: data.password });
  };

  return (
    <form className={classes.form} onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        form={form}
        attribute="password"
        question="Nova lozinka"
        error={form.formState.errors.password?.message?.toString()}
        image={password}
        isPassword
      />

      <Input
        form={form}
        attribute="confirmPassword"
        question="Potvrdi lozinku"
        error={form.formState.errors.confirmPassword?.message?.toString()}
        image={password}
        isPassword
      />
      <BaseButton text="Resetiraj lozinku" />
    </form>
  );
};
