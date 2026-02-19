import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const appName = process.env.NEXT_PUBLIC_APP_NAME || "VB Swimwear";

export const metadata: Metadata = {
  title: `${appName} | Moda Praia com Elegância`,
  description:
    "Descubra peças exclusivas de moda praia com design autoral e acabamentos refinados. Biquínis, saídas de praia, vestidos e muito mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
