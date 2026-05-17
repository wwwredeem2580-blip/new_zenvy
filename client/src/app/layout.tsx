import type { Metadata } from "next";
import { DM_Sans, Lora } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900", "1000"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ZENVY",
  description: "Modern E-commerce Dashboard",
};

import { ZenvyProvider } from "@/context/ZenvyContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable}`}>
       <body className="antialiased font-sans">
         <ZenvyProvider>
           {children}
         </ZenvyProvider>
         <Toaster position="top-center" richColors />
       </body>
    </html>
  );
}
