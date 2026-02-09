import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/auth-context";
import { StoreProvider } from "./lib/store";

const geist = Geist({ subsets: ["latin"], weight: ["400", "500", "700", "800"] });

export const metadata: Metadata = {
  title: "OKMindful — Next-Level Commitments",
  description: "Commit, stake, and crush your 2026 resolutions with AI-powered accountability.",
  icons: {
    icon: "/logo.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <AuthProvider>
          <StoreProvider>{children}</StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
