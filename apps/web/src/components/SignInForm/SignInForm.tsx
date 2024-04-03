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
import { QueryClient, QueryClientProvider, useQueryClient } from "react-query";
import Modal from "components/BaseModal";
import { useState } from "react";
import SingleInput from "components/SingleInput";
import { useSendPasswordResetEmail } from "@/api/useSendPasswordResetEmail";

export const SignInForm = () => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  });

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const login = useLogin();
  const queryClient = useQueryClient();

  const [resetEmail, setResetEmail] = useState("");

  const onSubmit = async (data: any) => {
    await login.mutateAsync(data);
    await queryClient.invalidateQueries("me");
  };

  const [open, setOpen] = useState(false);
  const { mutateAsync } = useSendPasswordResetEmail();

  const sendResetEmail = async () => {
    await mutateAsync(resetEmail.replace("@", "%40"));
    setOpen(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
      <Input
        form={form}
        attribute="email"
        question="Adresa e-pošte"
        image={email}
      />
      <Input
        form={form}
        attribute="password"
        question="Lozinka"
        isPassword
        image={password}
        isDisabled={login.isLoading}
      />
      <span className={classes.forgotPassword}>
        <span onClick={() => setOpen(true)}>Zaboravili ste lozinku?</span>
      </span>
      <Modal
        open={open}
        title="Oporavak lozinke"
        text="Unesite adresu e-pošte koju ste koristili prilikom registracije"
        actionText="Zatvori"
        deMount={() => setOpen(false)}
      >
        <div className={classes.modalInput}>
          <SingleInput
            onChange={setResetEmail}
            question="Adresa e-pošte za oporavak"
            value={resetEmail}
            image={email}
          />
          <BaseButton
            isNotSubmit
            onClick={sendResetEmail}
            text="Pošalji e-poštu za oporavak lozinke"
          />
        </div>
      </Modal>
      <div className={classes.buttons}>
        <BaseButton text="Prijavite se" />
        <Link href="/register">
          <BaseButton text="Registrirajte se" initColor={ButtonColor.BLUE} />
        </Link>
      </div>
    </form>
  );
};
