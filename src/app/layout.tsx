import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import TanstackProvider from "@/components/providers/Tanstack";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "E-commerce App",
  description: "",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", poppins.variable)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Toaster position="top-right" richColors theme="system" />
        <TanstackProvider>{children}</TanstackProvider>
      </body>
    </html>
  );
}
