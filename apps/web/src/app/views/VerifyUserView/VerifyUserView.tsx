"use client";

import { useVerifyUser } from "@/api/useVerifyUser";
import classes from "./VerifyUserView.module.scss";
import GreenDrop from "../GreenDrop/GreenDrop";
import { useEffect } from "react";

export interface VerifyUserViewProps {
  code: string;
}

export const VerifyUserView = ({ code }: VerifyUserViewProps) => {
  const { mutate, isSuccess, isError } = useVerifyUser();

  useEffect(() => {
    mutate(code);
  }, [code, mutate]);

  return (
    <div className={classes.container}>
      <GreenDrop />
      <h1 className={classes.process}>
        {isSuccess
          ? "Uspješna verifikacija, preusmjeravanje na prijavu"
          : isError
            ? "Greška pri verifikaciji"
            : "Verifickacija korisnika"}
      </h1>
    </div>
  );
};
