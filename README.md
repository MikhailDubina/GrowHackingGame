# GrowHackingGame

A gamified growth hacking platform built with Node.js, React, and Telegram integration.

## Features

- 🎮 Interactive game mechanics
- 💰 Betting system with real money (Telegram Stars)
- 📊 Leaderboard and achievements
- 🎁 Shop with power-ups
- 📱 Telegram Mini App integration
- 🔐 User authentication and profiles

## Tech Stack

- **Backend:** Node.js, Express, tRPC
- **Frontend:** React, TypeScript, Tailwind CSS
- **Database:** PostgreSQL (via Drizzle ORM)
- **Payments:** Telegram Stars, Stripe
- **Deployment:** Render.com

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Telegram Bot Token
- Stripe API Key

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secret-key
TELEGRAM_BOT_TOKEN=your-bot-token
STRIPE_SECRET_KEY=your-stripe-key
NODE_ENV=production
```

### Running

```bash
npm start
```

## Deployment on Render.com

1. Fork this repository
2. Create a new Web Service on Render.com
3. Connect your GitHub repository
4. Set environment variables
5. Deploy!

## License

MIT
