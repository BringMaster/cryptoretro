# CryptoRetro

A modern, dark-themed cryptocurrency tracking platform with real-time market data, interactive charts, and crypto-specific news, built with React and TypeScript.

## Features

- Real-time cryptocurrency price tracking
- Interactive TradingView price charts
- Asset-specific news integration with CryptoCompare
- Comprehensive market data from multiple exchanges
- Dark-themed UI with modern components
- Fully responsive design for all devices

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Components**: shadcn-ui
- **Styling**: Tailwind CSS with dark theme
- **State Management**: React Query
- **Charts**: TradingView Advanced Charts
- **Form Handling**: React Hook Form
- **Data Validation**: Zod
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## APIs Used

- CoinCap API - Real-time cryptocurrency data
- CryptoCompare API - News and additional market data
- TradingView Charts - Advanced charting capabilities

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn package manager
- CryptoCompare API key (for news integration)

## Environment Setup

Create a `.env` file in the root directory with the following:

```env
VITE_CRYPTOCOMPARE_API_KEY=your_cryptocompare_api_key_here
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
- Top 5 latest news articles
- Top 10 markets by volume
- Direct trading links to exchanges

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
- Latest 5 articles per asset
- Time-ago timestamps
- Direct links to news sources

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

- Built with shadcn-ui components
- Powered by CoinCap API
- News provided by CryptoCompare
- Charts powered by TradingView
