import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ItalyDelivery Dashboard",
  description: "Pannello gestionale ItalyDelivery",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={cn("font-sans", geist.variable)}>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
