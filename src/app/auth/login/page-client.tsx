"use client";

import GoogleIcon from "@/components/svgs/google-icon";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/zod-schemas";
import { LoginForm } from "@/types";
import { signIn } from "next-auth/react";

const LoginClient = () => {
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { control, handleSubmit } = loginForm;

  const onSubmit = useCallback((data: LoginForm) => {
    console.log(data);
  }, []);

  return (
    <div className="border rounded-lg p-5 sm:p-10 space-y-8 w-[20rem] sm:w-[24rem] md:w-[26rem] bg-white">
      <Button
        type="button"
        className="flex w-full items-center gap-3 bg-white hover:bg-slate-50 text-text border shadow-none"
        onClick={async () => await signIn("google", { callbackUrl: "/links" })}
      >
        <GoogleIcon className="h-6 w-6" />
        Sign in with Google
      </Button>

      <div className="flex items-center justify-center w-full text-text-foreground gap-2">
        <Separator className="shrink" />
        or
        <Separator className="shrink" />
      </div>

      <Form {...loginForm}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="steve.paul@gmail.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="•••••••••••••" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-3">
            <Button className="w-full" type="submit">
              Sign in
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LoginClient;
