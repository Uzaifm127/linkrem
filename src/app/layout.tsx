import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import Providers from "./providers";
import ExtensionAuthentication from "./extension-authentication";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Linkrem",
  description:
    "Save links, organize them with tags, restore browser sessions and open important pages with keyboard shortcuts.",
  icons: {
    icon: "/app-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className)}>
        <Providers>
          <ExtensionAuthentication>{children}</ExtensionAuthentication>
        </Providers>
      </body>
    </html>
  );
}
