import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { getSiteMetadataBase } from "@/lib/seo";
import "./globals.css";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: getSiteMetadataBase(),
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png"
  },
  openGraph: {
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    type: "website",
    url: "/",
    images: [{ url: "/bf-suma-logo.png", alt: APP_NAME }]
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/bf-suma-logo.png"]
  }
};

const gscVerificationToken = process.env.NEXT_PUBLIC_GSC_VERIFICATION_TOKEN?.trim() || "";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ubuntu.variable}>
      <head>
        {gscVerificationToken ? (
          <meta content={gscVerificationToken} name="google-site-verification" />
        ) : null}
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
