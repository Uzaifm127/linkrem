"use client";

import { useSession } from "next-auth/react";
import React, { ReactNode, useEffect } from "react";

const ExtensionAuthentication: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      (async () => {
        try {
          const response = await fetch("/api/token", {
            method: "GET",
          });

          if (!response.ok) {
            throw new Error("Failed to fetch token");
          }

          const { token } = await response.json();

          window.postMessage(
            { action: "onSignIn", token, authenticated: true },
            "*"
          );
        } catch (error) {
          console.log(error);
          window.postMessage(
            { action: "onSignIn", token: null, authenticated: false },
            "*"
          );
        }
      })();
    } else {
      window.postMessage(
        { action: "onSignIn", token: null, authenticated: false },
        "*"
      );
    }
  }, [session]);

  return <>{children}</>;
};

export default ExtensionAuthentication;
