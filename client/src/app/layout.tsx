import type { Metadata } from "next";
import { DM_Sans, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900", "1000"],
});

const notoBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  variable: "--font-bengali",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "খবর ২৪ | সত্যের সন্ধানে অবিচল",
  description: "বাংলাদেশের অগ্রগামী একটি ডিজিটাল নিউজ প্ল্যাটফর্ম।",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${dmSans.variable} ${notoBengali.variable}`}>
       <body className="antialiased">
         {children}
         <Toaster position="top-center" richColors />
       </body>
    </html>
  );
}
