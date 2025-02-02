"use client";

import { useAppStore } from "@/store";
import { useSession } from "next-auth/react";
import React, { ReactNode, useEffect } from "react";

const ExtensionAuthentication: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();

  const { setTagOpeningLoading } = useAppStore();

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

  useEffect(() => {
    const messageListener = (e: MessageEvent<any>) => {
      const message = e.data;

      console.log("message", message);

      if (message.action === "openMultipleLinksResponse") {
        setTagOpeningLoading(false);
      }
    };

    window.addEventListener("message", messageListener);

    return () => window.removeEventListener("message", messageListener);
  }, []);

  return <>{children}</>;
};

export default ExtensionAuthentication;
