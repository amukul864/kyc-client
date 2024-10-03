import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import VideoProvider from "./store/video-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Canara HSBC Life Insurance",
  description: "Video Kyc Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/companyLogo.png" sizes="any" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <VideoProvider>{children}</VideoProvider>
      </body>
    </html>
  );
}
