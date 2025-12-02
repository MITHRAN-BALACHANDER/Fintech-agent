# FinSIght Platform - Frontend

Modern Next.js frontend for the FinSIght Platform with shadcn/ui components.

## Features

- 🤖 **AI Chat Interface** - Real-time chat with your personalized trading agent
- 📊 **Watchlist Management** - Monitor stocks and cryptocurrencies
- ⚡ **Trading Rules** - Set up automated alerts and trading triggers
- 📈 **Portfolio Dashboard** - Track performance and platform statistics
- 🎨 **Beautiful UI** - Built with shadcn/ui and Tailwind CSS
- 🌙 **Dark Mode** - Automatic dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:7777`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set environment variable:

The backend API URL is already configured in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:7777
```

3. Start development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Create Account

Fill out the form to create your personalized AI trading agent.

### 2. Chat with Your Agent

Ask about stock prices, request analysis, get market insights.

### 3. Create Watchlists

Organize your investments by creating watchlists for stocks and crypto.

### 4. Set Trading Rules

Automate your strategy with price alerts and trading triggers.

### 5. Monitor Portfolio

Track statistics, rules, and agent activity.

## Building for Production

```bash
npm run build
npm start
```

## Technologies

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

