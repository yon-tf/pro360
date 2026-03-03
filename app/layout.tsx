import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { SystemToaster } from "@/components/ui/system-toaster";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Pro360 – Clinical Ops",
  description: "ThoughtFull Pro Clinical Operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} min-h-screen bg-background font-sans antialiased`}>
        <AppShell>{children}</AppShell>
        <SystemToaster />
      </body>
    </html>
  );
}
