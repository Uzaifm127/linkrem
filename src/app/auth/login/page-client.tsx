"use client";

import GoogleIcon from "@/components/svgs/google-icon";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { LoaderCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const LoginClient = () => {
  const [authLoading, setAuthLoading] = useState(false);

  return (
    <div className="w-full max-w-md">
      {/* Card Container */}
      <Card className="bg-white rounded-2xl p-8 sm:p-10 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Linkrem
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue to your account
          </p>
        </div>

        {/* Divider with text */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-muted-foreground">
              Continue with
            </span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <Button
          type="button"
          className="flex w-full items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm h-12 rounded-xl font-medium transition-all duration-200"
          disabled={authLoading}
          onClick={async () => {
            setAuthLoading(true);

            try {
              const authResult = await signIn("google", {
                callbackUrl: "/links",
                redirect: false,
              });

              if (authResult?.error) {
                throw new Error("Authentication error:" + authResult.error);
              } else if (authResult?.ok && authResult?.url) {
                window.location.href = authResult?.url;
              }
            } catch (error) {
              console.error(error);
            } finally {
              setAuthLoading(false);
            }
          }}
        >
          {authLoading ? (
            <LoaderCircle className="animate-spin h-5 w-5" />
          ) : (
            <>
              <GoogleIcon className="h-5 w-5" />
              <span>Sign in with Google</span>
            </>
          )}
        </Button>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 pt-4 px-10">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </Card>
    </div>
  );
};

export default LoginClient;
