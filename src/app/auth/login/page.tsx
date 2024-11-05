import React from "react";
import LoginClient from "./page-client";

const Login = () => {
  return (
    <main className="h-screen w-full flex flex-col gap-10 items-center justify-center">
      <h2 className="text-3xl font-bold tracking-wide">Welcom to Linkrem</h2>

      <LoginClient />
    </main>
  );
};

export default Login;
