import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const nextAuthOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Email address",
          type: "email",
          placeholder: "steve.paul@gmail.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "•••••••••••••",
        },
      },
      authorize: (credentials) => {
        console.log(credentials);

        return null;
      },
    }),
  ],
  // JWT will come in jwt callback and then passed to session callback.
  callbacks: {
    // user parameter will only be available after the signin, later it will be undefined
    jwt: ({ token, user, trigger }) => {
      // Preventing re-assigning the properties of the token if user is undefined
      if (trigger === "signIn" && user) {
        token.id = user?.id;
      }

      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/login" },
};
