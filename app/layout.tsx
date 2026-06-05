import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { PopupProvider } from "./component/ui/PopupProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NAMA WEB",
  description: "Platfrom pembelajaran interaktif untuk siswa SD, SMP, dan SMA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider><PopupProvider>{children}</PopupProvider></AuthProvider>
      </body>
    </html>
  );
}
