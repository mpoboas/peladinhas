import type { Metadata } from "next";
import { Bebas_Neue, Barlow, Barlow_Condensed } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { PublicNav } from "@/components/layout/PublicNav";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const barlow = Barlow({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
});

export const metadata: Metadata = {
  title: "Peladinhas da Invicta",
  description: "Sessões de futebol, jogos e resultados — Porto · ISEP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${bebas.variable} ${barlow.variable} ${barlowCondensed.variable} h-full`}
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        <PublicNav />
        <div className="has-bottom-nav flex min-h-0 flex-1 flex-col">
          <PageTransition>{children}</PageTransition>
          <Footer />
        </div>
      </body>
    </html>
  );
}
