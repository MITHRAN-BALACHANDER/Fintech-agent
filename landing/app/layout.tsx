import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinSIght - AI-Powered Trading Platform",
  description: "Scalable multi-tenant AI trading platform with personalized agents. Monitor markets, execute rules, and get intelligent insights 24/7.",
  keywords: ["AI trading", "automated trading", "trading bot", "stock market", "crypto trading", "fintech"],
  authors: [{ name: "FinSIght Team" }],
  openGraph: {
    title: "FinSIght - Your Personal AI Trading Co-Pilot",
    description: "Automate your trading strategy with AI-powered agents that monitor markets 24/7",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
