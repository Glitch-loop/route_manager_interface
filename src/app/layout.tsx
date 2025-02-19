import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/main/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
        bg-system-primary-background
        w-screen h-screen flex flex-row`}
      >
        <div className="w-2/12 h-full">
          <Sidebar />
        </div>
        <div className="w-10/12 h-screen flex flex-col justify-center items-center">
          <div className="w-11/12 h-full my-6 flex flex-col  bg-system-secondary-background rounded-md">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
