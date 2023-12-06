"use client";

import { useLogin } from "@/api/useLogin";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import email from "assets/images/email.svg";
import password from "assets/images/password.svg";
import BaseButton from "components/BaseButton";
import classes from "./SignInForm.module.scss";
import Link from "next/link";
import { ButtonColor } from "@/shared/enums";
import { QueryClient, QueryClientProvider } from "react-query";

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
    <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
      <Input form={form} attribute="email" question="Email" image={email} />
      <Input
        form={form}
        attribute="password"
        question="Password"
        isPassword
        image={password}
        isDisabled={login.isLoading}
      />
      <div className={classes.buttons}>
        <BaseButton text="Sign In" />
        <Link href="/registration">
          <BaseButton text="Register" initColor={ButtonColor.BLUE} />
        </Link>
      </div>
    </form>
  );
};
