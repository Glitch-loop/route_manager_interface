"use client"
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";


import { useState } from 'react';
import { Geist, Geist_Mono } from "next/font/google";

// Components
import { Collapse } from '@mui/material';
import { ToastContainer } from "react-toastify";
import Sidebar from '@/shared/components/Sidebar/Sidebar';
import ShowHideIconButton from '@/shared/components/ShowHideIconButton/ShowHideIconButton';

// Styles
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-system-primary-background text-black w-screen h-screen overflow-hidden flex flex-row`}>
        <ToastContainer />
        <div className="relative flex max-w-[600px]">
          <Collapse in={sidebarOpen} orientation="horizontal">
            <div className="h-full p-5 shrink-0 relative z-20">
              <div className='w-full h-full rounded-lg bg-system-secondary-background'>
                <Sidebar />
              </div>
            </div>
          </Collapse>
          {/* Toggle button - stays at right edge of sidebar area */}
          <div className="absolute -right-9 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full">
            <ShowHideIconButton 
              horizontalHidding={true}
              tooltipTitle={"Menu principal"}
              onChangeButtonState={setSidebarOpen}
              leftDownInitialState={true}
              placement = "right" />
          </div>
        </div>
        <div className="w-full h-full p-5 flex min-w-0 relative z-10">
          <div className="w-full h-full rounded-lg flex items-center justify-center bg-system-secondary-background">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
