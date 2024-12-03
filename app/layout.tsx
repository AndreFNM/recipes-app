import localFont from "next/font/local";
import MainNavigation from "@/components/MainNavigation";
import "../app/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReactNode } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "CookSpace",
  description: "CookSpace app",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <MainNavigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
