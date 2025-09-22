import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Prico - Authentication",
  description: "Sign up or log in to Prico",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-full items-center justify-center bg-gradient-to-b from-background to-muted min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}