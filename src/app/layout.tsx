import type { Metadata } from "next";
import { Inter, Source_Sans_3 } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-inter",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: "AI Wake-Up Call",
  description:
    "A short check-up for boards who are worried about AI but unsure what to do about it.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB">
      <body className={`${inter.variable} ${sourceSans.variable} antialiased`}>
        <header className="px-6 pt-6 sm:px-10 sm:pt-8">
          <Link href="/" className="inline-flex items-center" aria-label="AI Wake-Up Call home">
            <Image src="/logo.png" alt="" width={32} height={32} priority />
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
