"use client";

import { useLogin } from "@/api/useLogin";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import email from "assets/images/email.svg";
import BaseButton from "components/BaseButton";

export const SignInForm = () => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  });

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const login = useLogin();

  const onSubmit = async (data: any) => {
    await login.mutateAsync(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input form={form} attribute="email" question="Email" image={email} />
      <Input
        form={form}
        attribute="password"
        question="Password"
        isPassword
        isDisabled={login.isLoading}
      />
      <BaseButton text="Sign In" />
    </form>
  );
};
