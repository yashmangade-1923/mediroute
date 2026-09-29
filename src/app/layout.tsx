import type { Metadata } from "next";
import "./globals.css";
import GalaxyCursor from '@/components/GalaxyCursor';
import LiveBackground from '@/components/LiveBackground';

export const metadata: Metadata = {
  title: "MediRoute - Real-Time Emergency Coordination",
  description: "Real-Time Ambulance–Hospital Resource Coordination & Handover Platform. Smart matching, safe reservation, seamless handover.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <LiveBackground />
        <GalaxyCursor />
        {children}
      </body>
    </html>
  );
}
