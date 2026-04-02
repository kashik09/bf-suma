import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
  display: "swap"
});

export const metadata: Metadata = {
  title: "BF Suma",
  description: "Trusted wellness essentials with clear pricing and fast local support.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ubuntu.variable}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
