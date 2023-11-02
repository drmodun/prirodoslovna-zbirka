"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const SignInForm = () => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  });

  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });
};
