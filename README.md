# Defio - One-tap DeFi on Base

**Social DeFi aggregator for Base network. Swap, lend, and earn directly from your social feed.**

## 🚀 Features

- **Multi-Platform Support**: Native integration with Farcaster mini-apps and Base App
- **Smart Swaps**: Best rates across Aerodrome, Uniswap, and other Base protocols
- **Portfolio Tracking**: Real-time balance and yield monitoring
- **Social Trading**: Share and copy trades from your social feed
- **Smart Alerts**: Health factor and yield opportunity notifications
- **Gas Optimization**: Paymaster integration for seamless UX

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Web3**: wagmi, viem, Coinbase Smart Wallet SDK
- **State Management**: Zustand
- **UI**: Custom design system with glass morphism and modern animations
- **Deployment**: Vercel with automatic deployments

## 🏗 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd defio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
   - Add your RPC URLs for Base network
   - Configure wallet and app IDs
   - Set up deployment tokens

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Farcaster Frame

The Farcaster mini-app is available at:
- Development: `http://localhost:3000/miniapp`
- Production: `https://your-domain.com/miniapp`

## 📦 Build & Deploy

### Local Build
```bash
npm run build
npm run start
```

### Vercel Deployment

The project auto-deploys to Vercel using the deployment token:

```bash
# Manual deployment
vercel --token $(cat vercel-token.txt)
```

### Environment Setup

1. **Development**: Copy `.env.example` to `.env.local`
2. **Production**: Set environment variables in Vercel dashboard

## 🏛 Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── miniapp/           # Farcaster mini-app routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   ├── swap/              # Swap functionality
│   ├── portfolio/         # Portfolio management
│   ├── alerts/            # Alert system
│   └── activity/          # Activity tracking
├── lib/                   # Utilities and config
├── store/                 # State management
└── types/                 # TypeScript definitions
```

## 🎨 Design System

### Colors
- **Background**: `#0A0B0D` (Deep graphite)
- **Surface**: `#111318` (Cards/panels)  
- **Primary**: `#41E3FF` (Cyan - active elements)
- **Accent**: `#9B87F5` (Violet - highlights)
- **Success**: `#22E6A6` (Mint green)
- **Warning**: `#FFB020` (Orange)

### Animations
- Smooth micro-interactions with Framer Motion
- Glass morphism effects
- Hover states and loading animations
- Page transitions

## 🔗 Integration

### Farcaster Frame
- Interactive buttons for quotes and swaps
- Social sharing capabilities
- Frame-based portfolio viewing

### Base App
- Native Smart Wallet integration
- Deep linking support
- Social graph integration
- Push notifications

### Protocols (Base Network)
- **Aave v3**: Lending and borrowing
- **Aerodrome**: DEX swaps and liquidity
- **Uniswap v3**: Alternative swap routing
- **Morpho**: Optimized lending markets

## 🔐 Security

- Non-custodial design - users maintain full control
- Smart contract interactions through whitelisted protocols
- Pre-transaction simulations
- Clear risk disclosures
- Slippage protection

## 📊 Monitoring

- Real-time price feeds
- Health factor monitoring  
- Gas price optimization
- Portfolio performance tracking
- Alert system for risks/opportunities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is a non-custodial DeFi application. Users maintain full control of their assets. DeFi operations carry risk of partial or total loss. Please read the full Risk Disclaimer before use.

## 🔗 Links

- **Documentation**: [docs.defio.app]
- **Farcaster Frame**: `/miniapp`
- **Base App**: [base.org/defio]
- **GitHub**: [github.com/defio-app]

---

Built with ❤️ for the Base ecosystem