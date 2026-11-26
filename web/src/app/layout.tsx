import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Zest — Tonight's table, sorted",
  description:
    "Tap a craving, pick a spend, get a shortlist. Playful picks for hungry Bangalore evenings — no photo clutter, just flavour.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-radius="round" data-buttons="pill">
      <head>
        <meta name="theme-color" content="#d63b22" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className={`${bricolage.variable} ${inter.variable} bg-surface font-sans text-on-surface antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
