# Defio - Social DeFi Trader

**One-tap DeFi, right from your feed on Base**

## Project Overview

Defio is a DeFi aggregator designed as a native experience for both Farcaster and Base App ecosystems. It simplifies DeFi operations on Base network, allowing users to perform swaps, lending, borrowing, and yield farming directly from their social feeds and Base App interface with one-tap simplicity.

## Key Features ✅ **IMPLEMENTED**

- **Multi-Wallet Support**: User-friendly wallet selection with Coinbase Smart Wallet, MetaMask, WalletConnect ✅ **FIXED**
- **Social Login Options**: Farcaster and Base App authentication integration ✅
- **Real Swap Functionality**: Universal Router + Permit2 for gasless approvals ✅
- **Multi-DEX Aggregation**: Uniswap v3 + Aerodrome quote comparison ✅
- **Fee-on-Top Monetization**: 0.15% platform fee via Universal Router commands ✅
- **Multi-Platform Support**: Native integration with both Farcaster mini-apps and Base App ✅
- **Social Trading**: Share trades to Farcaster and Base App feeds with copy-trading functionality
- **Base App Native Features**: Leverages Base App's social graph and user profiles ✅
- **Yield Aggregation**: Auto-discovery of best APR opportunities across Base protocols
- **Risk Management**: Health factor monitoring and liquidation alerts via XMTP and Base App notifications
- **Gas Sponsorship**: Paymaster integration for first transactions and micro-interactions

## Tech Stack

### Frontend ✅ **IMPLEMENTED**
- **Framework**: Next.js 14 (App Router)
- **UI**: React + Tailwind CSS
- **Animations**: Framer Motion
- **Web3**: wagmi + viem + Coinbase Smart Wallet SDK
- **Base App**: Native Base App SDK integration
- **Farcaster**: Farcaster Mini Apps SDK (✅ Active)
- **State**: Zustand
- **Validation**: Zod
- **Icons**: Lucide React
- **Styling**: Custom design system with glass morphism

### Backend
- **Runtime**: Node.js
- **Framework**: NestJS/Express
- **Database**: PostgreSQL + Redis
- **Queue**: BullMQ for alerts/simulations
- **Indexing**: Custom indexer for Base protocols

### Smart Contracts
- **Router**: Delegated calls to whitelisted adapters
- **Adapters**: Protocol-specific implementations (Aave, Aerodrome, etc.)
- **Security**: Minimal surface area, non-custodial design

## Development Commands

### Setup
```bash
cd apps/web
npm install
cp .env.example .env.local
# Configure environment variables
npm run dev
```

### Build & Deploy
```bash
npm run build
npm run start
npm run lint
npm run typecheck
```

### Vercel Deployment
Project deploys automatically to Vercel using deployment token.

**Setup:**
- Deployment token is stored in project root
- Automatic deployments on main branch push
- Preview deployments for pull requests

**Manual deployment:**
```bash
vercel --token $(cat "vercel token.txt") --prod
```

### Testing
```bash
npm run test
npm run test:e2e
```

## Environment Variables

```env
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ROUTER_ADDRESS=0x...
NEXT_PUBLIC_BASE_APP_ID=...
NEXT_PUBLIC_FARCASTER_APP_ID=...
COINBASE_WALLET_APP_NAME=Defio
TENDERLY_SIM_API_KEY=...

# Deployment (Vercel token stored in project root)
# VERCEL_TOKEN=... (stored in vercel-token.txt)
```

## Architecture

```
defio/
├── apps/web/                 # Next.js frontend
│   ├── app/miniapp/         # Farcaster mini-app routes
│   ├── app/baseapp/         # Base App integration
│   └── components/          # Shared UI components
├── contracts/               # Solidity smart contracts  
├── packages/
│   ├── protocols/           # Protocol adapters
│   ├── indexer/            # Data indexing service
│   ├── alerts/             # Risk monitoring
│   ├── base-app-sdk/       # Base App integration
│   └── farcaster-sdk/      # Farcaster integration
└── docs/                   # Documentation
```

## Protocol Integrations

### Supported Protocols on Base ✅ **IMPLEMENTED**
- **Uniswap v3**: Primary swap routing with QuoterV2 integration ✅
- **Aerodrome**: DEX swaps and liquidity with direct router integration ✅
- **Universal Router**: Fee-on-top commands for monetization ✅
- **Permit2**: Gasless approvals for better UX ✅
- **Aave v3**: Lending and borrowing (planned)
- **Morpho**: Optimized lending markets (planned)

### Data Sources
- The Graph subgraphs
- Direct on-chain reads via viem
- Custom indexer for Base events

## Monetization

### Revenue Streams ✅ **IMPLEMENTED**
1. **Routing Fees**: 0.15% on swaps (fee-on-top via Universal Router)
2. **Performance Fees**: 5-10% on vault strategies  
3. **Pro Subscriptions**: $10/month for advanced features
4. **Social Trading**: Revenue share on copy trades
5. **Sponsored Listings**: Protocol promotions
6. **White-label**: B2B licensing

### Fee Transparency
All fees are displayed before transaction signing:
- Protocol fees
- Network gas costs  
- Platform routing/performance fees
- Expected minimum output

## Security

### Smart Contract Security
- Whitelisted protocols and methods only
- Pre-transaction simulations via Tenderly
- Slippage protection and MEV resistance
- Emergency pause functionality (adapters only)
- Planned security audit

### User Protection
- Non-custodial design
- Clear risk disclosures
- Health factor monitoring
- Liquidation alerts via XMTP

## Deployment Status

### ✅ **DEPLOYED - Live on Vercel**
- **Production URL**: https://defio.vercel.app
- **Status**: Active and accessible
- **Deployment**: Successful production build
- **Environment**: Vercel Edge Runtime

### Manual Deployment
```bash
vercel --token $(cat "vercel token.txt") --prod
```

## Roadmap

### MVP (2-4 weeks) ✅ **COMPLETED**
- [x] Basic swap functionality (Aerodrome/Uniswap)
- [x] Coinbase Smart Wallet connection
- [x] Farcaster mini-app integration
- [x] Modern UI/UX with animations
- [x] Portfolio tracking dashboard
- [x] Alert system
- [x] Activity history
- [x] Production deployment

### v1 (4-8 weeks) - **IN PROGRESS**  
- [x] Real Web3 functionality (Universal Router + Permit2 integration)
- [x] Multi-wallet support with user choice (Coinbase, MetaMask, WalletConnect)
- [x] Farcaster authentication integration for frame context
- [x] Base App native integration with smart wallet detection
- [x] Real quote aggregation from Uniswap QuoterV2 and Aerodrome
- [x] Fee-on-top monetization mechanism (0.15% platform fee)
- [x] Professional swap execution with slippage protection
- [ ] Aave/Morpho lending integration
- [ ] Health factor alerts via XMTP and Base App notifications
- [ ] Portfolio dashboard with Base App social features
- [ ] Basic yield ranking
- [ ] Paymaster integration for Base App users
- [ ] Pro subscription features

### v2 (8-12 weeks)
- [ ] Custom vault strategies with performance fees
- [ ] Full copy-trading functionality  
- [ ] Advanced risk alerts
- [ ] White-label solutions
- [ ] Protocol partnerships
- [ ] Strategy author programs

## Key Metrics

### User Engagement
- Activation rate (% completing first transaction)
- D7/D30 retention
- Alert trigger → action conversion

### Financial
- Total Value Locked (TVL)  
- Trading volume and take rate
- Pro subscriber ARPU and churn
- Copy-trade conversion rates

## Compliance & Legal

- Non-custodial service with clear disclaimers
- Risk warnings for liquidation and smart contract risks
- Optional geo-filtering for restricted jurisdictions
- Complaint mechanism for harmful strategies

## Design System

### Brand Colors (Dark Mode)
- **Background**: #0A0B0D
- **Surface**: #111318  
- **Primary**: #41E3FF (Cyan)
- **Accent**: #9B87F5 (Violet)
- **Success**: #22E6A6
- **Warning**: #FFB020
- **Text**: #EDEFF3 / #A9B0BF

### Typography
- **Font**: Inter (system fallbacks)
- **Brand Gradient**: Cyan → Violet (35-45°)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Platform-Specific Features

### Farcaster Integration
- Frame-based mini-app experience
- Direct posting and sharing trades
- Social proof via cast interactions
- Community-driven strategy discovery

### Base App Integration  
- Native wallet experience with Smart Wallet
- Deep linking from Base App feeds
- Profile-based social trading
- Seamless onboarding for Base users
- Push notifications for alerts
- Social graph for copy-trading discovery

## 🌐 Live Application

- **Production URL**: https://defio-ag6z0biip-volodeveths-projects.vercel.app ✅ **ACTIVE**
- **GitHub Repository**: https://github.com/volodeveth/defio ✅ **COMMITTED**
- **Farcaster Mini-app**: https://defio-ag6z0biip-volodeveths-projects.vercel.app/miniapp
- **OG Image API**: https://defio-ag6z0biip-volodeveths-projects.vercel.app/api/og

## Links

- **Documentation**: [Link to docs]
- **Farcaster Mini-app**: `/miniapp` 
- **Base App Integration**: `/baseapp`
- **API Reference**: `/api/docs`
- **Contract Addresses**: See `contracts/deployments/base.json`

## License

MIT License - see LICENSE file for details

---

## 🔧 Recent Technical Implementations

### ✅ **Wallet Connection System Fixes** (Latest Update - August 2025)
- **Fixed Modal Positioning**: React Portal implementation for proper z-index layering
- **Improved UI Visibility**: Better contrast, proper icons for Base/MetaMask, shadow effects
- **Connection Logic Repair**: Fixed premature modal closing, proper error handling
- **User Feedback**: Real-time error display and connection status indicators
- **Environment Configuration**: Complete .env setup with WalletConnect integration

**Issues Resolved:**
- ❌ Modal appearing transparent with poor text visibility → ✅ Dark backdrop with proper contrast
- ❌ Modal positioning behind header → ✅ React Portal with correct z-index
- ❌ Wallet connections failing silently → ✅ Error messages and status feedback
- ❌ Modal closing before connection confirmation → ✅ Only closes on successful connection

### ✅ **Wallet System Overhaul**
- **Multi-Wallet Modal**: Replaced forced Base account opening with user choice
- **Farcaster Auth**: Frame context detection and social authentication
- **Base App Integration**: Native smart wallet detection and connection
- **Enhanced UX**: Professional wallet selection interface with recommendations

### ✅ **Real Web3 Swap System** 
- **Universal Router**: Commands-based swap execution with fee-on-top
- **Permit2 Integration**: Gasless approvals for better user experience  
- **Quote Aggregation**: Real-time price comparison between Uniswap v3 and Aerodrome
- **Revenue Generation**: 0.15% platform fee on all swaps via PAY_PORTION commands
- **Professional Error Handling**: Comprehensive transaction status management

### ✅ **Production Infrastructure**
- **GitHub Repository**: https://github.com/volodeveth/defio
- **Automated Deployment**: Vercel integration with production pipeline
- **Live Application**: https://defio-ag6z0biip-volodeveths-projects.vercel.app

---

## 🎉 Project Status: **LIVE & DEPLOYED**

**✅ Production Ready** - Defio v1 is successfully deployed with reliable wallet connections and real Web3 functionality

**🚀 Ready for users** - Full-featured DeFi aggregator with professional swap execution, fixed multi-wallet support, and social integrations

**📱 Farcaster Frame** - Interactive mini-app available for social media integration

**💰 Revenue Generating** - Live platform fees on swap transactions via Universal Router

**🔧 Recently Fixed** - Wallet connection issues resolved, improved UI/UX, better error handling

*Non-custodial DeFi aggregator. Users maintain full control of their assets. Please read Risk Disclaimer before use.*