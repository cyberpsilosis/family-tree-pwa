import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import localFont from "next/font/local";
import { generateMetadata as getMetadata } from "@/lib/metadata";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const celtic = localFont({
  src: "../../celtic-font/CelticPlain001001-1n4B.ttf",
  variable: "--font-celtic",
});

export const metadata: Metadata = getMetadata();

export const viewport = {
  themeColor: "#A3D5A3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${lora.variable} ${celtic.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
