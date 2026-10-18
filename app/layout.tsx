import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TFY — Your people, your space",
  description:
    "A private, invite-only community to connect, share, and stay close to your people.",
  applicationName: "TFY",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TFY",
  },
};

export const viewport: Viewport = {
  themeColor: "#090b10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
