# CryptoRetro

A modern, cyberpunk-inspired cryptocurrency tracking platform with Web3 integration, real-time market data, interactive charts, and crypto-specific news, built with React and TypeScript.

## Features

- Real-time cryptocurrency price tracking
- Interactive TradingView price charts
- Web3 wallet integration for watchlist management
- Asset-specific news integration with CryptoCompare
- Comprehensive market data from multiple exchanges
- Cyberpunk-inspired UI with modern components
- Fully responsive design for all devices
- Personal watchlist with wallet authentication

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with dark theme
- **State Management**: React Hooks
- **Web3 Integration**: wagmi, viem
- **Wallet Connection**: Web3Modal
- **Charts**: TradingView Advanced Charts
- **Form Handling**: React Hook Form
- **Data Validation**: Zod
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## Design System

- **Theme**: Dark, cyberpunk-inspired interface
- **Color Palette**: 
  - Primary: Gray scale with semi-transparent backgrounds
  - Accents: Strategic use of neon effects for emphasis
  - Text: Multiple shades of gray for hierarchy
- **Components**: 
  - Custom-styled buttons with hover effects
  - Responsive tables with sorting
  - Interactive filters
  - Modal dialogs with backdrop blur
  - Custom scrollbars
  - Animated transitions

## APIs Used

- CoinCap API - Real-time cryptocurrency data
- CryptoCompare API - News and additional market data
- TradingView Charts - Advanced charting capabilities
- Web3Modal - Wallet connection interface

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn package manager
- CryptoCompare API key (for news integration)
- Web3 wallet (MetaMask, WalletConnect, or other supported providers)

## Environment Setup

Create a `.env` file in the root directory with the following:

```env
VITE_CRYPTOCOMPARE_API_KEY=your_cryptocompare_api_key_here
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Features in Detail

### Asset Detail Page
- Comprehensive asset metrics (price, market cap, volume, supply)
- Real-time price updates
- TradingView Advanced Charts integration
- Latest news articles
- Top markets by volume
- Direct trading links to exchanges
- Add/remove from watchlist with wallet connection

### Market Data
- Support for 25+ major exchanges including:
  - Binance
  - Coinbase
  - Kraken
  - KuCoin
  - Crypto.com
  - Gate.io
  - Huobi
  - OKX
  - Bybit
  - AscendEX
- Real-time market prices and volumes
- Direct trading links
- Volume percentage analysis

### News Integration
- Asset-specific news from CryptoCompare
- Latest articles per asset
- Time-ago timestamps
- Direct links to news sources

### Web3 Features
- Wallet connection via Web3Modal
- Support for multiple wallet providers
- Personal watchlist tied to wallet address
- Local storage persistence
- Network detection and display
- Wallet balance display
- Secure disconnect functionality

### UI Components
- Responsive navigation header
- Advanced filtering system
- Pagination with dynamic page sizing
- Interactive data tables
- Loading states and animations
- Error boundaries and fallbacks
- Toast notifications
- Modal dialogs
- Custom buttons and inputs

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License
