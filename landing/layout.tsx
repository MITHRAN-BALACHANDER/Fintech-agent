import type { Metadata } from "next";

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

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
