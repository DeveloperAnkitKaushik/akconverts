import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/component/Navbar/Navbar";
import { Toaster } from "react-hot-toast";
import Favicon from "/public/favicon.ico";

export const metadata: Metadata = {
  title: "Ak coverts - Convert images, audios, and videos to your liking.",
  description: "Convert images, audios, and videos to your liking.",
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body>
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
